import override from "./override";
import svgs from "../svg/svgs";
import { FaceConfig, FeatureInfo, Overrides } from "../types";

const addWrapper = (svgString: string) => `<g>${svgString}</g>`;

const addTransform = (element: SVGGraphicsElement, newTransform: string) => {
  const oldTransform = element.getAttribute("transform");
  element.setAttribute(
    "transform",
    `${oldTransform ? `${oldTransform} ` : ""}${newTransform}`,
  );
};

const rotateCentered = (element: SVGGraphicsElement, angle: number) => {
  const bbox = element.getBBox();
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;

  addTransform(element, `rotate(${angle} ${cx} ${cy})`);
};

const scaleStrokeWidthAndChildren = (
  element: SVGGraphicsElement,
  factor: number,
) => {
  if (element.tagName === "style") {
    return;
  }

  const strokeWidth = element.getAttribute("stroke-width");
  if (strokeWidth) {
    element.setAttribute(
      "stroke-width",
      String(parseFloat(strokeWidth) / factor),
    );
  }
  const children = element.childNodes as unknown as SVGGraphicsElement[];
  for (let i = 0; i < children.length; i++) {
    scaleStrokeWidthAndChildren(children[i] as SVGGraphicsElement, factor);
  }
};

// Scale relative to the center of bounding box of element e, like in Raphael.
// Set x and y to 1 and this does nothing. Higher = bigger, lower = smaller.
const scaleCentered = (element: SVGGraphicsElement, x: number, y: number) => {
  const bbox = element.getBBox();
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
  element: SVGGraphicsElement,
  x: number,
  y: number,
  xAlign = "center",
  yAlign = "center",
) => {
  const bbox = element.getBBox();
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


const drawFeature = (svg: SVGSVGElement, face: FaceConfig, info: FeatureInfo) => {
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


  if (featureSVGString.includes("shaveOpacity")) {
    // @ts-ignore
    if (feature.shaveOpacity) {
      // @ts-ignore
      featureSVGString = featureSVGString.replace(
        /\$\[shaveOpacity\]/g,
        // @ts-ignore
        feature.shaveOpacity
      );
    }
    else {
      // @ts-ignore
      featureSVGString = featureSVGString.replace(
        /\$\[shaveOpacity\]/g,
        "0"
      );
    }

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
    face.hair.color,
  );
  featureSVGString = featureSVGString.replace(
    /\$\[primary\]/g,
    face.teamColors[0],
  );
  featureSVGString = featureSVGString.replace(
    /\$\[secondary\]/g,
    face.teamColors[1],
  );
  featureSVGString = featureSVGString.replace(
    /\$\[accent\]/g,
    face.teamColors[2],
  );

  const bodySize = face.body.size !== undefined ? face.body.size : 1;

  for (let i = 0; i < info.positions.length; i++) {
    svg.insertAdjacentHTML("beforeend", addWrapper(featureSVGString));

    const position = info.positions[i];

    if (position) {
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

      translate(
        svg.lastChild as SVGGraphicsElement,
        position[0],
        position[1],
        xAlign,
      );
    }

    if (feature.hasOwnProperty("angle")) {
      // @ts-ignore
      rotateCentered(svg.lastChild, (i === 0 ? 1 : -1) * feature.angle);
    }

    // Flip if feature.flip is specified or if this is the second position (for eyes and eyebrows). Scale if feature.size is specified.
    // @ts-ignore
    const scale = feature.hasOwnProperty("size") ? feature.size : 1;
    if (info.name === "body" || info.name === "jersey") {
      // @ts-ignore
      scaleCentered(svg.lastChild, bodySize, 1);
      // @ts-ignore
    } else if (feature.flip || i === 1) {
      // @ts-ignore
      scaleCentered(svg.lastChild, -scale, scale);
    } else if (scale !== 1) {
      // @ts-ignore
      scaleCentered(svg.lastChild, scale, scale);
    }

    if (info.opaqueLines) {
      // @ts-ignore
      svg.lastChild.setAttribute("stroke-opacity", String(face.lineOpacity));
    }

    if (info.scaleFatness && info.positions[0] !== null) {
      // Scale individual feature relative to the edge of the head. If fatness is 1, then there are 47 pixels on each side. If fatness is 0, then there are 78 pixels on each side.
      const distance = (78 - 47) * (1 - face.fatness);
      // @ts-ignore
      translate(svg.lastChild, distance, 0, "left", "top");
    }
  }

  if (
    info.scaleFatness &&
    info.positions.length === 1 &&
    info.positions[0] === null
  ) {
    // @ts-ignore
    scaleCentered(svg.lastChild, fatScale(face.fatness), 1);
  }
};

export const display = (
  container: HTMLElement | string | null,
  face: FaceConfig,
  overrides?: Overrides,
): void => {
  override(face, overrides);

  const containerElement =
    typeof container === "string"
      ? document.getElementById(container)
      : container;
  if (!containerElement) {
    throw new Error("container not found");
  }
  containerElement.innerHTML = "";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("version", "1.2");
  svg.setAttribute("baseProfile", "tiny");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("viewBox", "0 0 400 600");
  svg.setAttribute("preserveAspectRatio", "xMinYMin meet");

  // Needs to be in the DOM here so getBBox will work
  containerElement.appendChild(svg);

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
};