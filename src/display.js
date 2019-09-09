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
const fatScale = fatness => {
  return 0.75 + 0.25 * fatness;
};

const drawHead = (svg, feature, fatness) => {
  const featureSVGString = svgs.head[feature.id].replace(
    "$[color]",
    feature.color
  );
  svg.insertAdjacentHTML("beforeend", featureSVGString);
  scaleCentered(svg.lastChild, fatScale(fatness), 1);
};

const drawEyes = (svg, feature) => {
  const featureSVGString = svgs.eye[feature.id];
  const positions = [[125, 280], [275, 280]];
  for (let i = 0; i < positions.length; i++) {
    svg.insertAdjacentHTML("beforeend", addWrapper(featureSVGString));
    translate(svg.lastChild, positions[i][0], positions[i][1]);
    rotateCentered(svg.lastChild, (i === 0 ? 1 : -1) * feature.angle);
  }
};

const drawEyebrows = (svg, feature) => {
  const featureSVGString = svgs.eyebrow[feature.id];
  const positions = [[125, 240], [275, 240]];
  for (let i = 0; i < positions.length; i++) {
    svg.insertAdjacentHTML("beforeend", addWrapper(featureSVGString));
    translate(svg.lastChild, positions[i][0], positions[i][1]);
    if (i === 1) {
      scaleCentered(svg.lastChild, -1, 1);
    }
  }
};

const drawMouth = (svg, feature) => {
  const featureSVGString = svgs.mouth[feature.id];
  svg.insertAdjacentHTML("beforeend", addWrapper(featureSVGString));
  translate(svg.lastChild, 200, 410);
};

const drawNose = (svg, feature) => {
  const featureSVGString = svgs.nose[feature.id];
  svg.insertAdjacentHTML("beforeend", addWrapper(featureSVGString));

  // Special case, for the pinocchio nose it should not be centered but should stick out to the left or right
  let xAlign;
  if (feature.id === "pinocchio") {
    xAlign = feature.flip ? "right" : "left";
  } else {
    xAlign = "center";
  }
  translate(svg.lastChild, 200, 335, xAlign);

  const scale = feature.size + 0.5;
  if (feature.flip) {
    scaleCentered(svg.lastChild, -scale, scale);
  } else {
    scaleCentered(svg.lastChild, scale, scale);
  }
};

const drawHair = (svg, feature, fatness) => {
  const featureSVGString = svgs.hair[feature.id].replace();
  svg.insertAdjacentHTML("beforeend", featureSVGString);
  scaleCentered(svg.lastChild, fatScale(fatness), 1);
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

  drawHead(svg, face.head, face.fatness);
  drawEyes(svg, face.eye);
  drawEyebrows(svg, face.eyebrow);
  drawMouth(svg, face.mouth);
  drawNose(svg, face.nose);
  drawHair(svg, face.hair, face.fatness);

  /*    head[face.head.id](svg, face.fatness, face.color);
    eyebrow[face.eyebrows[0].id](svg, face.eyebrows[0].lr, face.eyebrows[0].cx, face.eyebrows[0].cy);
    eyebrow[face.eyebrows[1].id](svg, face.eyebrows[1].lr, face.eyebrows[1].cx, face.eyebrows[1].cy);

    eye[face.eyes[0].id](svg, face.eyes[0].lr, face.eyes[0].cx, face.eyes[0].cy, face.eyes[0].angle);
    eye[face.eyes[1].id](svg, face.eyes[1].lr, face.eyes[1].cx, face.eyes[1].cy, face.eyes[1].angle);

    nose[face.nose.id](svg, face.nose.cx, face.nose.cy, face.nose.size, face.nose.posY, face.nose.flip);
    mouth[face.mouth.id](svg, face.mouth.cx, face.mouth.cy);
    hair[face.hair.id](svg, face.fatness);*/
};

export default display;
