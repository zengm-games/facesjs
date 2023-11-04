import { Face } from "./generate.js";
import override, { Overrides } from "./override.js";
import svgs from "./svgs.js";
import { XMLBuilder, XMLParser, XMLValidator } from "fast-xml-parser";
import bbox from "svg-path-bounding-box";

const svg_options = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  allowBooleanAttributes: true,
};
let parser = new XMLParser(svg_options);

const lastChild = (arr: any[]) => arr[arr.length - 1];

const childNodes = function (node: any) {
  let children: any = [];
  Object.entries(node).forEach((entry) => {
    let key = entry[0];
    let val = entry[1];
    if (!key.includes("@_")) {
      children.push(val);
    }
  });
  return children;
};

function findPathDAttributes(obj: any) {
  let bboxes: any[] = [];

  function recurse(
    element: { [x: string]: any; hasOwnProperty: (arg0: string) => any } | null
  ) {
    if (typeof element === "object" && element !== null) {
      if (element.hasOwnProperty("@_d")) {
        // Check if this is a path object with a 'd' attribute
        bboxes.push(bbox(element["@_d"]));
      }
      for (let key in element) {
        recurse(element[key]); // Recurse into the object
      }
    }
  }

  recurse(obj); // Start the recursion on the parsed object

  return bboxes;
}

// Function to combine bounding boxes into one
function combineBoundingBoxes(
  bboxes: { minX: number; minY: number; maxX: number; maxY: number }[]
): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  let combinedBbox = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
    height: 0,
    width: 0,
  };

  bboxes.forEach((bbox) => {
    combinedBbox.minX = Math.min(combinedBbox.minX, bbox.minX);
    combinedBbox.minY = Math.min(combinedBbox.minY, bbox.minY);
    combinedBbox.maxX = Math.max(combinedBbox.maxX, bbox.maxX);
    combinedBbox.maxY = Math.max(combinedBbox.maxY, bbox.maxY);
  });

  // Calculate width and height from combined extremes
  combinedBbox.width = combinedBbox.maxX - combinedBbox.minX;
  combinedBbox.height = combinedBbox.maxY - combinedBbox.minY;

  return combinedBbox;
}

const addWrapper = (svgString: string, feature_name: string) => ({
  g: svgString,
  "@_feature": feature_name,
});

const addTransform = (element: any, newTransform: string) => {
  element["g"]["@_transform"] = element["g"]["@_transform"]
    ? `${element["g"]["@_transform"]}  ${newTransform}`
    : newTransform;
};

const getElementSize = (element: any) => {
  // Find bounding boxes for all 'd' attributes
  const bboxes = findPathDAttributes(element);
  const element_bbox = combineBoundingBoxes(bboxes);

  return {
    element_height: element_bbox.height,
    element_width: element_bbox.width,
    element_x: element_bbox.minX,
    element_y: element_bbox.minY,
  };
};

const rotateCentered = (element: SVGGraphicsElement, angle: number) => {
  let { element_height, element_width, element_x, element_y } =
    getElementSize(element);
  const cx = element_x + element_width / 2;
  const cy = element_y + element_height / 2;

  addTransform(element, ` rotate(${angle} ${cx} ${cy})`);
};

const scaleStrokeWidthAndChildren = (element: any, factor: number) => {
  if (element.tagName === "style") {
    return;
  }

  const strokeWidth = element["@_stroke-width"];
  if (strokeWidth) {
    element["@_stroke-width"] = String(parseFloat(strokeWidth) / factor);
  }

  const children = childNodes(element);
  for (let i = 0; i < children.length; i++) {
    scaleStrokeWidthAndChildren(children[i], factor);
  }
};

// Scale relative to the center of bounding box of element e, like in Raphael.
// Set x and y to 1 and this does nothing. Higher = bigger, lower = smaller.
const scaleCentered = (element: any, x: number, y: number) => {
  let { element_height, element_width, element_x, element_y } =
    getElementSize(element);

  const cx = element_x + element_width / 2;
  const cy = element_y + element_height / 2;
  const tx = (cx * (1 - x)) / x;
  const ty = (cy * (1 - y)) / y;

  addTransform(element, ` scale(${x} ${y}) translate(${tx} ${ty})`);

  // Keep apparent stroke width constant, similar to how Raphael does it (I think)
  if (
    Math.abs(x) !== 1 ||
    Math.abs(y) !== 1 ||
    Math.abs(x) + Math.abs(y) !== 2
  ) {
    const factor = (Math.abs(x) + Math.abs(y)) / 2;
    scaleStrokeWidthAndChildren(element, factor);
  }
};

// Translate element such that its center is at (x, y). Specifying xAlign and yAlign can instead make (x, y) the left/right and top/bottom.
const translate = (
  element: any,
  x: number,
  y: number,
  xAlign = "center",
  yAlign = "center"
) => {
  let { element_height, element_width, element_x, element_y } =
    getElementSize(element);
  let cx, cy;

  if (xAlign === "left") {
    cx = element_x;
  } else if (xAlign === "right") {
    cx = element_x + element_width;
  } else {
    // cx = element_x + (element_width / 2);
    cx = element_x + element_width / 2;
  }
  if (yAlign === "top") {
    cy = element_y;
  } else if (yAlign === "bottom") {
    cy = element_y + element_height;
  } else {
    cy = element_y + element_height / 2;
  }

  let tx = x - cx;
  let ty = y - cy;

  addTransform(element, `translate(${tx} ${ty})`);
};

// Defines the range of fat/skinny, relative to the original width of the default head.
const fatScale = (fatness: number) => 0.8 + 0.2 * fatness;

type FeatureInfo = {
  name: Exclude<keyof Face, "fatness" | "teamColors">;
  positions: [null] | [number, number][];
  scaleFatness?: true;
};

const drawFeature = (svg_js_obj: any, face: Face, info: FeatureInfo) => {
  const feature = face[info.name];
  if (!feature || !svgs[info.name]) {
    return;
  }
  if (
    ["hat", "hat2", "hat3"].includes(face.accessories.id) &&
    info.name == "hair"
  ) {
    if (
      [
        "afro",
        "afro2",
        "curly",
        "curly2",
        "curly3",
        "faux-hawk",
        "hair",
        "high",
        "juice",
        "messy-short",
        "messy",
        "middle-part",
        "parted",
        "shaggy1",
        "shaggy2",
        "short3",
        "spike",
        "spike2",
        "spike3",
        "spike4",
      ].includes(face.hair.id)
    ) {
      face.hair.id = "short";
    } else if (
      [
        "blowoutFade",
        "curlyFade1",
        "curlyFade2",
        "dreads",
        "fauxhawk-fade",
        "tall-fade",
      ].includes(face.hair.id)
    ) {
      face.hair.id = "short-fade";
    } else {
      return;
    }
  }

  // @ts-ignore
  let featureSVGString = svgs[info.name][feature.id];
  if (!featureSVGString) {
    return;
  }

  // @ts-ignore
  if (feature.shave) {
    // @ts-ignore
    featureSVGString = featureSVGString.replace("$[faceShave]", feature.shave);
  }

  // @ts-ignore
  if (feature.shave) {
    // @ts-ignore
    featureSVGString = featureSVGString.replace("$[headShave]", feature.shave);
  }

  featureSVGString = featureSVGString.replace("$[skinColor]", face.body.color);
  featureSVGString = featureSVGString.replace(
    /\$\[hairColor\]/g,
    face.hair.color
  );
  featureSVGString = featureSVGString.replace(
    /\$\[primary\]/g,
    face.teamColors[0]
  );
  featureSVGString = featureSVGString.replace(
    /\$\[secondary\]/g,
    face.teamColors[1]
  );
  featureSVGString = featureSVGString.replace(
    /\$\[accent\]/g,
    face.teamColors[2]
  );

  const bodySize = face.body.size !== undefined ? face.body.size : 1;

  for (let i = 0; i < info.positions.length; i++) {
    let new_element = addWrapper(parser.parse(featureSVGString), info.name);

    const position = info.positions[i];

    if (position !== null) {
      // Special case, for the pinocchio nose it should not be centered but should stick out to the left or right
      let xAlign;
      if (feature.id === "nose4" || feature.id === "pinocchio") {
        // @ts-ignore
        xAlign = feature.flip ? "right" : "left";
      } else {
        xAlign = "center";
      }

      translate(new_element, position[0], position[1], xAlign);
    }

    if (feature.hasOwnProperty("angle")) {
      // @ts-ignore
      rotateCentered(new_element, (i === 0 ? 1 : -1) * feature.angle);
    }

    // Flip if feature.flip is specified or if this is the second position (for eyes and eyebrows). Scale if feature.size is specified.
    // @ts-ignore
    const scale = feature.hasOwnProperty("size") ? feature.size : 1;
    if (info.name === "body" || info.name === "jersey") {
      // @ts-ignore
      scaleCentered(new_element, bodySize, 1);
      // @ts-ignore
    } else if (feature.flip || i === 1) {
      // @ts-ignore
      scaleCentered(new_element, -scale, scale);
    } else if (scale !== 1) {
      // @ts-ignore
      scaleCentered(new_element, scale, scale);
    }

    if (info.scaleFatness && info.positions[0] !== null) {
      // Scale individual feature relative to the edge of the head. If fatness is 1, then there are 47 pixels on each side. If fatness is 0, then there are 78 pixels on each side.
      const distance = (78 - 47) * (1 - face.fatness);
      // @ts-ignore
      translate(new_element, distance, 0, "left", "top");
    }

    svg_js_obj["svg"]["g"].push(new_element);
  }

  if (
    info.scaleFatness &&
    info.positions.length === 1 &&
    info.positions[0] === null
  ) {
    // @ts-ignore
    scaleCentered(lastChild(svg_js_obj["svg"]["g"]), fatScale(face.fatness), 1);
  }
};

export const server_display = (face: Face, overrides: Overrides) => {
  override(face, overrides);

  let svg_js_obj = {
    svg: {
      "@_version": "1.2",
      "@_baseProfile": "tiny",
      "@_width": "100%",
      "@_height": "100%",
      "@_viewBox": "0 0 400 600",
      "@_preserveAspectRatio": "xMinYMin meet",
      g: [],
    },
  };

  const featureInfos: FeatureInfo[] = [
    {
      name: "hairBg",
      positions: [null],
      scaleFatness: true,
    },
    {
      name: "body",
      positions: [null],
    },
    {
      name: "jersey",
      positions: [null],
    },
    {
      name: "ear",
      positions: [
        [55, 325] as [number, number],
        [345, 325] as [number, number],
      ],
      scaleFatness: true,
    },
    {
      name: "head",
      positions: [null], // Meaning it just gets placed into the SVG with no translation
      scaleFatness: true,
    },
    {
      name: "eyeLine",
      positions: [null],
    },
    {
      name: "smileLine",
      positions: [
        [150, 435],
        [250, 435],
      ],
    },
    {
      name: "miscLine",
      positions: [null],
    },
    {
      name: "facialHair",
      positions: [null],
      scaleFatness: true,
    },
    {
      name: "eye",
      positions: [
        [140, 310],
        [260, 310],
      ],
    },
    {
      name: "eyebrow",
      positions: [
        [140, 270],
        [260, 270],
      ],
    },
    {
      name: "mouth",
      positions: [[200, 440]],
    },
    {
      name: "nose",
      positions: [[200, 370]],
    },
    {
      name: "hair",
      positions: [null],
      scaleFatness: true,
    },
    {
      name: "glasses",
      positions: [null],
      scaleFatness: true,
    },
    {
      name: "accessories",
      positions: [null],
      scaleFatness: true,
    },
  ];

  for (const info of featureInfos) {
    drawFeature(svg_js_obj, face, info);
  }

  let builder = new XMLBuilder(svg_options);
  let built_svg = builder.build(svg_js_obj);

  return built_svg;
};
