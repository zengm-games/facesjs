import override from "./override.js";
import svgs from "./svgs.js";
import { Face, Overrides, RGB, HSL, HEX, FeatureInfo } from "./types";

// Convert hex color to RGB
export const hexToRgb = (hex: HEX): RGB | null => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Convert RGB color to hex
export const rgbToHex = (rgb: RGB): HEX => {
  return (
    "#" +
    ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)
  );
};

// Convert RGB color to HSL
export const rgbToHsl = (rgb: RGB): HSL => {
  let { r, g, b } = rgb;
  (r /= 255), (g /= 255), (b /= 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number = (max + min) / 2;
  let s: number = (max + min) / 2;
  let l: number = (max + min) / 2;

  if (max === min) {
    h = 0;
    s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    if (r === max) {
      h = (g - b) / d + (g < b ? 6 : 0);
    }
    if (g === max) {
      h = (b - r) / d + 2;
    }
    if (b === max) {
      h = (r - g) / d + 4;
    }

    h = h / 6;
  }

  return { h, s, l };
};

// Convert HSL color to RGB
export const hslToRgb = (hsl: HSL): RGB => {
  let r, g, b;
  let { h, s, l } = hsl;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

export const hexToHsl = (hex: HEX): HSL | null => {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return null;
  }
  return rgbToHsl(rgb);
};

export const randomGaussian = (min: number, max: number) => {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5;
  if (num > 1 || num < 0) num = randomGaussian(min, max);
  num *= max - min;
  num += min;
  return num;
};

const adjustShade = (color: string, amount: number): string => {
  // Convert hex to RGB
  const rgb: RGB | null = hexToRgb(color);

  // Convert RGB to HSL
  if (!rgb) {
    return color;
  }
  const hsl: HSL = rgbToHsl(rgb);

  // Adjust the lightness
  const adjustedLightness = Math.max(0, Math.min(1, hsl.l * amount));

  // Convert HSL back to RGB
  const adjustedRgb = hslToRgb({ ...hsl, l: adjustedLightness });

  // Convert RGB back to hex
  const adjustedHex = rgbToHex(adjustedRgb);

  return adjustedHex;
};

const getHairAccent = (hairColor: string): string => {
  let hsl = hexToHsl(hairColor);
  if (!hsl) {
    return hairColor;
  }
  if (hsl.l < 0.33) {
    return adjustShade(hairColor, 2);
  } else {
    return adjustShade(hairColor, 0.5);
  }
};

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
    scaleStrokeWidthAndChildren(children[i], factor);
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

// @ts-ignore
const scaleTopDown = (element: SVGGraphicsElement, x: number, y: number) => {
  const bbox = element.getBBox();
  const cx = bbox.x + bbox.width / 2;

  const initialCy = bbox.y + bbox.height;

  // Compute translations; tx remains the same to keep the horizontal centering
  const tx = (cx * (1 - x)) / x;
  let ty = (bbox.height + bbox.y - (bbox.height + bbox.y * y)) * 6;

  // Apply the transformation with the origin set to the bottom of the element
  addTransform(element, `scale(${x} ${y}) translate(${tx} ${ty})`);

  let newBBox = element.getBBox();
  let newCy = newBBox.y + newBBox.height;
  console.log("scaleTopDown", { initialCy, newCy, ty, bbox, newBBox, element });

  // Stroke width adjustment, if necessary
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
// @ts-ignore
const heightScale = (height: number) => 0.85 + 0.3 * height;

const drawFeature = (svg: SVGSVGElement, face: Face, info: FeatureInfo) => {
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
    /\$\[eyeColor\]/g,
    face.eye.color,
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

  if (featureSVGString.includes("$[hairAccent]")) {
    let hairAccent = getHairAccent(face.hair.color as string) || "#000";
    featureSVGString = featureSVGString.replace(
      /\$\[hairAccent\]/g,
      hairAccent,
    );
  }

  featureSVGString = featureSVGString.replace(
    /\$\[shaveOpacity\]/g,
    // @ts-ignore
    feature.shaveOpacity || 0,
  );

  const bodySize = face.body.size !== undefined ? face.body.size : 1;
  let insertPosition: "afterbegin" | "beforeend" = info.placeBeginning
    ? "afterbegin"
    : "beforeend";
  // let whichChild: 'firstChild' | 'lastChild' = insertPosition == "beforebegin" ? 'firstChild' : 'lastChild';

  const calcChildElement = () => {
    if (insertPosition === "afterbegin") {
      return svg.firstChild;
    } else {
      return svg.lastChild;
    }
  };

  for (let i = 0; i < info.positions.length; i++) {
    svg.insertAdjacentHTML(insertPosition, addWrapper(featureSVGString));
    let childElement = calcChildElement() as SVGSVGElement;

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
        position[0] += shiftDirection * face.eye.distance;
        position[1] += -1 * face.eye.height;
        // position[1] += 1 * 50 * (1 - fatScale(face.height));
      }

      translate(
        childElement as SVGGraphicsElement,
        position[0],
        position[1],
        xAlign,
      );
    }

    if (feature.hasOwnProperty("angle")) {
      // @ts-ignore
      rotateCentered(childElement, (i === 0 ? 1 : -1) * feature.angle);
    }

    // Flip if feature.flip is specified or if this is the second position (for eyes and eyebrows). Scale if feature.size is specified.
    // @ts-ignore
    const scale = feature.hasOwnProperty("size") ? feature.size : 1;
    if (info.name === "body" || info.name === "jersey") {
      scaleCentered(childElement, bodySize, 1);
      // @ts-ignore
    } else if (feature.flip || i === 1) {
      scaleCentered(childElement, -scale, scale);
    } else if (scale !== 1) {
      scaleCentered(childElement, scale, scale);
    }

    if (info.opaqueLines) {
      // @ts-ignore
      childElement.setAttribute("stroke-opacity", String(face.lineOpacity));
    }

    if (info.scaleFatness && info.positions[0] !== null) {
      // Scale individual feature relative to the edge of the head. If fatness is 1, then there are 47 pixels on each side. If fatness is 0, then there are 78 pixels on each side.
      const distance = (78 - 47) * (1 - face.fatness);
      // @ts-ignore
      translate(childElement, distance, 0, "left", "top");
    }
  }

  let childElement = calcChildElement() as SVGSVGElement;

  if (
    info.scaleFatness &&
    info.positions.length === 1 &&
    info.positions[0] === null
  ) {
    // TODO - scale Height as well, make it move down
    // @ts-ignore
    scaleCentered(childElement, fatScale(face.fatness), 1);
  }

  if (info.positions.length === 1 && info.shiftWithEyes) {
    // @ts-ignore
    addTransform(
      childElement as SVGGraphicsElement,
      `translate(0, ${-1 * face.eye.height})`,
    );
  }
};

export const display = (
  container: HTMLElement | string | null,
  face: Face,
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

  svg.insertAdjacentHTML("beforeend", addWrapper(""));
  let insideSVG = svg.firstChild as SVGSVGElement;

  // Needs to be in the DOM here so getBBox will work
  containerElement.appendChild(svg);

  const featureInfos: FeatureInfo[] = [
    {
      name: "head",
      positions: [null], // Meaning it just gets placed into the SVG with no translation
      scaleFatness: true,
    },
    {
      name: "eyeLine",
      positions: [null],
      opaqueLines: true,
      shiftWithEyes: true,
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
      name: "mouth",
      positions: [[200, 440]],
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
      name: "nose",
      positions: [[200, 370]],
    },
    {
      name: "facialHair",
      positions: [null],
      scaleFatness: true,
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
      shiftWithEyes: true,
    },
    {
      name: "accessories",
      positions: [null],
      scaleFatness: true,
    },
    {
      name: "ear",
      positions: [
        [55, 325] as [number, number],
        [345, 325] as [number, number],
      ],
      scaleFatness: true,
      placeBeginning: true,
    },
    {
      name: "jersey",
      positions: [null],
      placeBeginning: true,
    },
    {
      name: "body",
      positions: [null],
      placeBeginning: true,
    },
    {
      name: "hairBg",
      positions: [null],
      scaleFatness: true,
      placeBeginning: true,
    },
  ];

  for (const info of featureInfos) {
    drawFeature(insideSVG, face, info);
  }

  if (face.height !== undefined) {
    scaleTopDown(insideSVG, 1, heightScale(face.height));
  }
};
