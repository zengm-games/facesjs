import svgs from "./svgs";

const rotateCentered = (element, angle) => {
    const bbox = element.getBBox();
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    element.setAttribute("transform", `${element.getAttribute("transform")} rotate(${angle} ${cx} ${cy})`);
};

const wrapTranslate = (coords, svg) => {
    return `<g transform="translate(${coords})">${svg}</g>`
}

const drawHead = (paper, face) => {
    const headSVG = svgs.head[face.head.id]
        .replace("$[color]", face.head.color);
    paper.insertAdjacentHTML("beforeend", headSVG);
};

const drawEyes = (paper, face) => {
    const eyeSVG = svgs.eye[face.eye.id];
    const positions = ["100,280", "250,280"];
    for (let i = 0; i < positions.length; i++) {
        paper.insertAdjacentHTML("beforeend", wrapTranslate(positions[i], eyeSVG));
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

    const eye = svgs.eye[face.eye.id];
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
