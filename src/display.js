import svgs from "./svgs";

const addWrapper = svg => {
  return `<g>${svg}</g>`;
};

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

// Translate element such that its center is at (x, y)
const translateCentered = (element, x, y) => {
  const bbox = element.getBBox();
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;

  addTransform(element, `translate(${x - cx} ${y - cy})`);
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

// Defines the range of fat/skinny, relative to the original width of the default head.
const fatScale = fatness => {
  return 0.75 + 0.25 * fatness;
};

const drawHead = (paper, face) => {
  const headSVG = svgs.head[face.head.id].replace("$[color]", face.head.color);
  paper.insertAdjacentHTML("beforeend", headSVG);
  scaleCentered(paper.lastChild, fatScale(face.fatness), 1);
};

const drawEyes = (paper, face) => {
  const eyeSVG = svgs.eye[face.eye.id];
  const positions = [[125, 280], [275, 280]];
  for (let i = 0; i < positions.length; i++) {
    paper.insertAdjacentHTML("beforeend", addWrapper(eyeSVG));
    translateCentered(paper.lastChild, positions[i][0], positions[i][1]);
    rotateCentered(paper.lastChild, (i === 0 ? 1 : -1) * face.eye.angle);
  }
};

const display = (container, face) => {
  if (typeof container === "string") {
    container = document.getElementById(container);
  }
  container.innerHTML = "";

  const paper = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  paper.setAttribute("version", "1.2");
  paper.setAttribute("baseProfile", "tiny");
  paper.setAttribute("width", "100%");
  paper.setAttribute("height", "100%");
  paper.setAttribute("viewBox", "0 0 400 600");
  paper.setAttribute("preserveAspectRatio", "xMinYMin meet");

  // Needs to be in the DOM here so getBBox will work
  container.appendChild(paper);

  drawHead(paper, face);
  drawEyes(paper, face);

  /*    head[face.head.id](paper, face.fatness, face.color);
    eyebrow[face.eyebrows[0].id](paper, face.eyebrows[0].lr, face.eyebrows[0].cx, face.eyebrows[0].cy);
    eyebrow[face.eyebrows[1].id](paper, face.eyebrows[1].lr, face.eyebrows[1].cx, face.eyebrows[1].cy);

    eye[face.eyes[0].id](paper, face.eyes[0].lr, face.eyes[0].cx, face.eyes[0].cy, face.eyes[0].angle);
    eye[face.eyes[1].id](paper, face.eyes[1].lr, face.eyes[1].cx, face.eyes[1].cy, face.eyes[1].angle);

    nose[face.nose.id](paper, face.nose.cx, face.nose.cy, face.nose.size, face.nose.posY, face.nose.flip);
    mouth[face.mouth.id](paper, face.mouth.cx, face.mouth.cy);
    hair[face.hair.id](paper, face.fatness);*/
};

export default display;
