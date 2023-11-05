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
let builder = new XMLBuilder(svg_options);

const setAttribute = (
  element: SVGGraphicsElement | any,
  attribute_name: string,
  value: string
) => {
  if (element && element.nodeType === Node.ELEMENT_NODE) {
    element.setAttribute(attribute_name, value);
  } else {
    element[`@_${attribute_name}`] = value;
  }
};

const getAttribute = (
  element: SVGGraphicsElement | any,
  attribute_name: string
) => {
  if (element && element.nodeType === Node.ELEMENT_NODE) {
    return element.getAttribute(attribute_name);
  } else {
    return element[`@_${attribute_name}`];
  }
};

const appendElement = (svg: SVGGraphicsElement | any, element: any) => {
  if (svg && svg.nodeType === Node.ELEMENT_NODE) {
    svg.insertAdjacentHTML("beforeend", element);
  } else {
    svg.svg.g.push(element);
  }
};

const lastChild = (svg: SVGGraphicsElement | any) => {
  if (svg && svg.nodeType === Node.ELEMENT_NODE) {
    return svg.lastChild;
  } else {
    return svg.svg.g[svg.svg.g.length - 1];
  }
};

const nthLastChild = (svg: SVGGraphicsElement | any, n: number) => {
  if (svg && svg.nodeType === Node.ELEMENT_NODE) {
    let children = childNodes(svg);

    return children[children.length - n];
  } else {
    return svg.svg.g[svg.svg.g.length - n];
  }
};

const childNodes = function (element: any | SVGGraphicsElement) {
  let children: any = [];

  if (element && element.nodeType === Node.ELEMENT_NODE) {
    return element.childNodes;
  } else {
    Object.entries(element).forEach((entry) => {
      let key = entry[0];
      let val = entry[1];
      if (!key.includes("@_")) {
        children.push(val);
      }
    });
    return children.flat();
  }
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

const getBbox = (element: SVGGraphicsElement | any) => {
  // Find bounding boxes for all 'd' attributes
  if (element && element.nodeType === Node.ELEMENT_NODE) {
    return element.getBBox();
  } else {
    const bboxes = findPathDAttributes(element);
    const element_bbox = combineBoundingBoxes(bboxes);

    return {
      height: element_bbox.height,
      width: element_bbox.width,
      x: element_bbox.minX,
      y: element_bbox.minY,
    };
  }
};

const addWrapper = (svgString: string, element: any | SVGGraphicsElement) => {
  if (element && element.nodeType === Node.ELEMENT_NODE) {
    return `<g>${svgString}</g>`;
  } else {
    return {
      g: parser.parse(svgString),
    };
  }
};

const addTransform = (
  element: SVGGraphicsElement | any,
  newTransform: string
) => {
  let oldTransform = getAttribute(element, "transform");
  let updatedTransform = oldTransform
    ? `${oldTransform} ${newTransform}`
    : newTransform;
  setAttribute(element, "transform", updatedTransform);
};

const rotateCentered = (element: SVGGraphicsElement | any, angle: number) => {
  const { x, y, height, width } = getBbox(element);
  const cx = x + width / 2;
  const cy = y + height / 2;

  addTransform(element, `rotate(${angle} ${cx} ${cy})`);
};

function scaleEarring(
  svg: SVGGraphicsElement | any,
  face: Face,
  positionY: number
): number {
  // Grab earring element in DOM, to give height for scaling later. Some earrings can be much taller than others
  // Grab latest ear for this side - always the 3rd to last element before earring
  let earringElement = lastChild(svg);
  let earElement = nthLastChild(svg, 3);

  const earringBbox = getBbox(earringElement);
  const earBbox = getBbox(earElement);

  // Subtract 10 to account for slight buffer between actual ear size & bbox
  let earHeight = Math.max(0, earBbox.height - 10);

  // We'll translate the earring down by 1/4 of the difference between the ear height and the ear size
  let earSize = face.ear.size;
  let earTranslate =
    (earHeight - earHeight / earSize) / 4 + earBbox.y + earringBbox.height / 2;

  return positionY + earTranslate;
}

const scaleStrokeWidthAndChildren = (
  element: SVGGraphicsElement | any,
  factor: number
) => {
  if (element.tagName === "style" || typeof element === "string") {
    return;
  }

  const strokeWidth = getAttribute(element, "stroke-width");
  setAttribute(
    element,
    "stroke-width",
    String(parseFloat(strokeWidth) / factor)
  );

  const children = childNodes(element);

  for (let i = 0; i < children.length; i++) {
    scaleStrokeWidthAndChildren(children[i], factor);
  }
};

// Scale relative to the center of bounding box of element e, like in Raphael.
// Set x and y to 1 and this does nothing. Higher = bigger, lower = smaller.
const scaleCentered = (
  element: SVGGraphicsElement | any,
  x: number,
  y: number
) => {
  const bbox = getBbox(element);
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;
  const tx = (cx * (1 - x)) / x;
  const ty = (cy * (1 - y)) / y;

  addTransform(element, `scale(${x} ${y}) translate(${tx} ${ty})`);

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
  element: SVGGraphicsElement | any,
  x: number,
  y: number,
  xAlign = "center",
  yAlign = "center"
) => {
  const bbox = getBbox(element);
  let cx;
  let cy;
  if (xAlign === "left") {
    cx = bbox.x;
  } else if (xAlign === "right") {
    cx = bbox.x + bbox.width;
  } else {
    cx = bbox.x + bbox.width / 2;
  }
  if (yAlign === "top") {
    cy = bbox.y;
  } else if (yAlign === "bottom") {
    cy = bbox.y + bbox.height;
  } else {
    cy = bbox.y + bbox.height / 2;
  }

  addTransform(element, `translate(${x - cx} ${y - cy})`);
};

// Defines the range of fat/skinny, relative to the original width of the default head.
const fatScale = (fatness: number) => 0.8 + 0.2 * fatness;

type FeatureInfo = {
  name: Exclude<
    keyof Face,
    "fatness" | "teamColors" | "eyeDistance" | "lineOpacity"
  >;
  positions: [null] | [number, number][];
  scaleFatness?: boolean;
  shiftWithEyes?: boolean;
  opaqueLines?: true;
};

const drawFeature = (
  svg: SVGSVGElement | any,
  face: Face,
  info: FeatureInfo
) => {
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

  if (
    ["suit", "suit2"].includes(face.jersey.id) &&
    (info.name == "accessories" ||
      info.name == "glasses" ||
      info.name == "earring")
  ) {
    //Don't show headband, facemask, etc if person is wearing a suit
    //might be a smarter way to do that includes statement, but wanted to throw in all non-jersey clothing. Only those 2 right now
    return;
  }

  // @ts-ignore
  let featureSVGString = svgs[info.name][feature.id];
  if (!featureSVGString) {
    return;
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

  // @ts-ignore
  if (feature.hasOwnProperty("shaveOpacity")) {
    // @ts-ignore
    featureSVGString = featureSVGString.replace(
      /\$\[shaveOpacity\]/g,
      // @ts-ignore
      feature.shaveOpacity
    );
  }

  const bodySize = face.body.size !== undefined ? face.body.size : 1;

  for (let i = 0; i < info.positions.length; i++) {
    appendElement(svg, addWrapper(featureSVGString, svg));

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

      // @ts-ignore
      if (feature.distance) {
        let move_direction = i == 1 ? 1 : -1;
        // @ts-ignore
        position[0] += move_direction * feature.distance;
      }

      let shiftDirection = i == 1 ? 1 : -1;
      if (info.shiftWithEyes) {
        // @ts-ignore
        position[0] += shiftDirection * face.eyeDistance;
      }

      if (info.name === "earring") {
        position[1] = scaleEarring(svg, face, position[1]);
      }

      translate(lastChild(svg), position[0], position[1], xAlign);
    }

    if (feature.hasOwnProperty("angle")) {
      // @ts-ignore
      rotateCentered(lastChild(svg), (i === 0 ? 1 : -1) * feature.angle);
    }

    // Flip if feature.flip is specified or if this is the second position (for eyes and eyebrows). Scale if feature.size is specified.
    // @ts-ignore
    const scale = feature.hasOwnProperty("size") ? feature.size : 1;
    if (info.name === "body" || info.name === "jersey") {
      // @ts-ignore
      scaleCentered(lastChild(svg), bodySize, 1);
      // @ts-ignore
    } else if (feature.flip || i === 1) {
      // @ts-ignore
      scaleCentered(lastChild(svg), -scale, scale);
    } else if (scale !== 1) {
      // @ts-ignore
      scaleCentered(lastChild(svg), scale, scale);
    }

    if (info.opaqueLines) {
      // @ts-ignore
      setAttribute(lastChild(svg), "stroke-opacity", String(face.lineOpacity));
    }

    if (info.scaleFatness && info.positions[0] !== null) {
      // Scale individual feature relative to the edge of the head. If fatness is 1, then there are 47 pixels on each side. If fatness is 0, then there are 78 pixels on each side.
      const distance = (78 - 47) * (1 - face.fatness);
      // @ts-ignore
      translate(lastChild(svg), distance, 0, "left", "top");
    }
  }

  if (
    info.scaleFatness &&
    info.positions.length === 1 &&
    info.positions[0] === null
  ) {
    // @ts-ignore
    scaleCentered(lastChild(svg), fatScale(face.fatness), 1);
  }
};

export const buildSVGString = (
  face: Face,
  overrides: Overrides,
  containerElement: any
) => {
  override(face, overrides);
  let svg = buildBaseSVG(containerElement);

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
      name: "earring",
      positions: [
        [43, 338] as [number, number],
        [357, 338] as [number, number],
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
      opaqueLines: true,
    },
    {
      name: "smileLine",
      positions: [
        [150, 435],
        [250, 435],
      ],
      opaqueLines: true,
    },
    {
      name: "miscLine",
      positions: [null],
      opaqueLines: true,
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
      shiftWithEyes: true,
    },
    {
      name: "eyebrow",
      positions: [
        [140, 270],
        [260, 270],
      ],
      shiftWithEyes: true,
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
    drawFeature(svg, face, info);
  }

  if (containerElement && containerElement.nodeType === Node.ELEMENT_NODE) {
    return;
  } else {
    // @ts-ignore
    return builder.build(svg);
  }
};

const buildBaseSVG = (containerElement: SVGGraphicsElement | any) => {
  let svg;
  if (containerElement && containerElement.nodeType === Node.ELEMENT_NODE) {
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    setAttribute(svg, "version", "1.2");
    setAttribute(svg, "baseProfile", "tiny");
    setAttribute(svg, "width", "100%");
    setAttribute(svg, "height", "100%");
    setAttribute(svg, "viewBox", "0 0 400 600");
    setAttribute(svg, "preserveAspectRatio", "xMinYMin meet");
    containerElement.appendChild(svg);
  } else {
    svg = {
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
  }

  return svg;
};

export const display = (
  container: HTMLElement | string | null,
  face: Face,
  overrides: Overrides
) => {
  const containerElement = (
    typeof container === "string"
      ? document.getElementById(container)
      : container
  ) as HTMLElement;
  if (!containerElement) {
    throw new Error("container not found");
  }
  containerElement.innerHTML = "";

  buildSVGString(face, overrides, containerElement);
};
