import svgs from "./svgs";

const addWrapper = svgString => `<g>${svgString}</g>`;

const addTransform = (element, newTransform) => {
  const oldTransform = element.getAttribute("transform");
  element.setAttribute(
    "transform",
    `${oldTransform ? `${oldTransform} ` : ""}${newTransform}`
  );
};

const rotateCentered = (element, angle) => {
  const bbox = element.getBBox();
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;

  addTransform(element, `rotate(${angle} ${cx} ${cy})`);
};

// Scale relative to the center of bounding box of element e, like in Raphael.
// Set x and y to 1 and this does nothing. Higher = bigger, lower = smaller.
const scaleCentered = (element, x, y) => {
  const bbox = element.getBBox();
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;
  const tx = (cx * (1 - x)) / x;
  const ty = (cy * (1 - y)) / y;

  addTransform(element, `scale(${x} ${y}) translate(${tx} ${ty})`);

  // Keep apparent stroke width constant, similar to how Raphael does it (I think)
  const strokeWidth = element.getAttribute("stroke-width");
  if (strokeWidth) {
    element.setAttribute("stroke-width", strokeWidth / Math.abs(x));
  }
};

// Translate element such that its center is at (x, y). Specifying xAlign and yAlign can instead make (x, y) the left/right and top/bottom.
const translate = (element, x, y, xAlign = "center", yAlign = "center") => {
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
  console.log(xAlign, bbox.x, cx);

  addTransform(element, `translate(${x - cx} ${y - cy})`);
};

// Defines the range of fat/skinny, relative to the original width of the default head.
const fatScale = fatness => 0.75 + 0.25 * fatness;

const drawFeature = (svg, face, info) => {
  const feature = face[info.name];
  let featureSVGString = svgs[info.name][feature.id];
  if (feature.color) {
    featureSVGString = featureSVGString.replace("$[color]", feature.color);
  }

  for (let i = 0; i < info.positions.length; i++) {
    svg.insertAdjacentHTML("beforeend", addWrapper(featureSVGString));

    if (info.positions[i] !== null) {
      // Special case, for the pinocchio nose it should not be centered but should stick out to the left or right
      let xAlign;
      if (feature.id === "pinocchio") {
        xAlign = feature.flip ? "right" : "left";
      } else {
        xAlign = "center";
      }

      translate(
        svg.lastChild,
        info.positions[i][0],
        info.positions[i][1],
        xAlign
      );
    }

    if (feature.hasOwnProperty("angle")) {
      rotateCentered(svg.lastChild, (i === 0 ? 1 : -1) * feature.angle);
    }

    if (feature.hasOwnProperty("size")) {
      const scale = feature.size + 0.5;
      if (feature.flip) {
        scaleCentered(svg.lastChild, -scale, scale);
      } else {
        scaleCentered(svg.lastChild, scale, scale);
      }
    }
  }

  if (info.scaleFatness) {
    scaleCentered(svg.lastChild, fatScale(face.fatness), 1);
  }
};

const display = (container, face) => {
  if (typeof container === "string") {
    container = document.getElementById(container);
  }
  container.innerHTML = "";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("version", "1.2");
  svg.setAttribute("baseProfile", "tiny");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("viewBox", "0 0 400 600");
  svg.setAttribute("preserveAspectRatio", "xMinYMin meet");

  // Needs to be in the DOM here so getBBox will work
  container.appendChild(svg);

  const featureInfos = [
    {
      name: "head",
      positions: [null], // Meaning it just gets placed into the SVG with no translation
      scaleFatness: true
    },
    {
      name: "eye",
      positions: [[125, 280], [275, 280]]
    },
    {
      name: "eyebrow",
      positions: [[125, 240], [275, 240]]
    },
    {
      name: "mouth",
      positions: [[200, 410]]
    },
    {
      name: "nose",
      positions: [[200, 335]]
    },
    {
      name: "hair",
      positions: [null],
      scaleFatness: true
    }
  ];

  for (const info of featureInfos) {
    drawFeature(svg, face, info);
  }
};

export default display;
