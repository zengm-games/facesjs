var faces = (function () {
    "use strict";

    var eye = [], eyebrow = [], hair = [], head = [], mouth = [], nose = [];

    function newPath(paper) {
        var e;
        e = document.createElementNS("http://www.w3.org/2000/svg", "path");
        paper.appendChild(e);
        return e;
    }

    // Rotate around center of bounding box of element e, like in Raphael.
    function rotateCentered(e, angle) {
        var bbox, cx, cy;

        bbox = e.getBBox();
        cx = bbox.x + bbox.width / 2;
        cy = bbox.y + bbox.height / 2;
        e.setAttribute("transform", "rotate(" + angle + " " + cx + " " + cy + ")");
    }

    // Scale relative to the center of bounding box of element e, like in Raphael.
    // Set x and y to 1 and this does nothing. Higher = bigger, lower = smaller.
    function scaleCentered(e, x, y) {
        var bbox, cx, cy, strokeWidth, tx, ty;

        bbox = e.getBBox();
        cx = bbox.x + bbox.width / 2;
        cy = bbox.y + bbox.height / 2;
        tx = (cx * (1 - x)) / x;
        ty = (cy * (1 - y)) / y;

        e.setAttribute("transform", "scale(" + x + " " + y + "), translate(" + tx + " " + ty + ")");

        // Keep apparent stroke width constant, similar to how Raphael does it (I think)
        strokeWidth = e.getAttribute("stroke-width");
        if (strokeWidth) {
            e.setAttribute("stroke-width", strokeWidth / Math.abs(x));
        }
    }

    // Defines the range of fat/skinny, relative to the original width of the default head.
    function fatScale(fatness) {
        return 0.75 + 0.25 * fatness;
    }

    head.push(function (paper, fatness, color) {
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 200,100" +
                       "c 0,0 180,-10 180,200" +
                       "c 0,0 0,210 -180,200" +
                       "c 0,0 -180,10 -180,-200" +
                       "c 0,0 0,-210 180,-200");
        e.setAttribute("fill", color);
        scaleCentered(e, fatScale(fatness), 1);
    });

    eyebrow.push(function (paper, lr, cx, cy) {
        var e, x = cx - 30, y = cy;

        e = newPath(paper);
        if (lr === "l") {
            e.setAttribute("d", "M " + x + "," + y +
                           "c 0,0 -3,-30 60,0");
        } else {
            e.setAttribute("d", "M " + x + "," + y +
                           "c 0,0 63,-30 60,0");
        }
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
    });

    eye.push(function (paper, lr, cx, cy, angle) {
        // Horizontal
        var e, x = cx - 30, y = cy;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "h 60");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
        rotateCentered(e, (lr === "l" ? angle : -angle));
    });
    eye.push(function (paper, lr, cx, cy, angle) {
        // Normal (circle with a dot in it)
        var e, x = cx, y = cy + 20;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 30,20 0 1 1 0.1,0");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "6");
        e.setAttribute("fill", "#f0f0f0");
        rotateCentered(e, (lr === "l" ? angle : -angle));

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + (y - 12) +
                       "a 12,8 0 1 1 0.1,0");
        rotateCentered(e, (lr === "l" ? angle : -angle));
    });
    eye.push(function (paper, lr, cx, cy, angle) {
        // Dot
        var e, x = cx, y = cy + 13;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 20,15 0 1 1 0.1,0");
        rotateCentered(e, (lr === "l" ? angle : -angle));
    });
    eye.push(function (paper, lr, cx, cy, angle) {
        // Arc eyelid
        var e, x = cx, y = cy + 20;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 17,17 0 1 1 0.1,0 z");
        rotateCentered(e, (lr === "l" ? angle : -angle));

        e = newPath(paper);
        e.setAttribute("d", "M " + (x - 40) + "," + (y - 14) +
                       "c 36,-44 87,-4 87,-4");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "4");
        e.setAttribute("fill", "none");
        rotateCentered(e, (lr === "l" ? angle : -angle));
    });

    nose.push(function (paper, cx, cy, size, posY, flip) {
        // V
        var e, x = cx - 30, y = cy, scale = size + 0.5;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "l 30,30" +
                       "l 30,-30");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
        scaleCentered(e, scale, scale);
    });
    nose.push(function (paper, cx, cy, size, posY, flip) {
        // Pinnochio
        var e, x = cx, y = cy - 10, scale = size + 0.5;

        e = newPath(paper);
        e.setAttribute("d", "M " + (flip ? x - 48 : x) + "," + y +
                       "c 0,0 50,-30 0,30");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
        if (flip) {
            scaleCentered(e, -scale, scale);
        } else {
            scaleCentered(e, scale, scale);
        }
    });
    nose.push(function (paper, cx, cy, size, posY, flip) {
        // Big single
        var e, x = cx - 9, y = cy - 25, scale = size + 0.5;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "c 0,0 -20,60 9,55" +
                       "c 0,0 29,5 9,-55");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
        scaleCentered(e, scale, scale);
    });

    mouth.push(function (paper, cx, cy) {
        // Thin smile
        var e, x = cx - 75, y = cy - 15;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "c 0,0 75,60 150,0");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
    });
    mouth.push(function (paper, cx, cy) {
        // Thin flat
        var e, x = cx - 55, y = cy;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "h 110");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
    });
    mouth.push(function (paper, cx, cy) {
        // Open-mouthed smile, top teeth
        var e, x = cx - 75, y = cy - 15;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "c 0,0 75,100 150,0" +
                       "h -150");

        e = newPath(paper);
        e.setAttribute("d", "M " + (x + 16) + "," + (y + 8) +
                       "l 16,16" +
                       "h 86" +
                       "l 16,-16" +
                       "h -118");
        e.setAttribute("fill", "#f0f0f0");
    });
    mouth.push(function (paper, cx, cy) {
        // Generic open mouth
        var e, x = cx - 55, y = cy;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "a 54,10 0 1 1 110,0" +
                       "a 54,20 0 1 1 -110,0");
    });
    mouth.push(function (paper, cx, cy) {
        // Thin smile with ends
        var e, x = cx - 75, y = cy - 15;

        e = newPath(paper);
        e.setAttribute("d", "M " + x + "," + y +
                       "c 0,0 75,60 150,0");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");

        e = newPath(paper);
        e.setAttribute("d", "M " + (x + 145) + "," + (y + 19) +
                       "c 15.15229,-18.18274 3.03046,-32.32488 3.03046,-32.32488");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");

        e = newPath(paper);
        e.setAttribute("d", "M " + (x + 5) + "," + (y + 19) +
                       "c -15.15229,-18.18274 -3.03046,-32.32488 -3.03046,-32.32488");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-width", "8");
        e.setAttribute("fill", "none");
    });

    hair.push(function (paper, fatness) {
        // Normal short
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 200,100" +
                       "c 0,0 180,-10 176,150" +
                       "c 0,0 -180,-150 -352,0" +
                       "c 0,0 0,-160 176,-150");
        scaleCentered(e, fatScale(fatness), 1);
    });
    hair.push(function (paper, fatness) {
        // Flat top
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 25,60" +
                       "h 352" +
                       "v 190" +
                       "c 0,0 -180,-150 -352,0" +
                       "v -190");
        scaleCentered(e, fatScale(fatness), 1);
    });
    hair.push(function (paper, fatness) {
        // Afro
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 25,250" +
                       "a 210,150 0 1 1 352,0" +
                       "c 0,0 -180,-150 -352,0");
        scaleCentered(e, fatScale(fatness), 1);
    });
    hair.push(function (paper, fatness) {
        // Cornrows
        var e;

        e = newPath(paper);
        e.setAttribute("d", "M 36,229" +
                       "v -10" +
                       "m 40,-10" +
                       "v -60" +
                       "m 50,37" +
                       "v -75" +
                       "m 50,65" +
                       "v -76" +
                       "m 50,76" +
                       "v -76" +
                       "m 50,93" +
                       "v -75" +
                       "m 50,92" +
                       "v -60" +
                       "m 40,80" +
                       "v -10");
        e.setAttribute("stroke", "#000");
        e.setAttribute("stroke-linecap", "round");
        e.setAttribute("stroke-width", "22");
        scaleCentered(e, fatScale(fatness), 1);
    });
    hair.push(function (paper, fatness) {
        // Intentionally left blank (bald)
    });

    function getId(array) {
        return Math.floor(Math.random() * array.length);
    }

    /**
     * Display a face.
     * 
     * @param {string} container id of the div that the face will appear in. If not given, no face is drawn and the face object is simply returned.
     * @param {Object} face Face object, such as one generated from faces.generate.
     */
    function display(container, face) {
        var paper;

        container = document.getElementById(container);
        container.innerHTML = "";

        paper = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        paper.setAttribute("version", "1.2");
        paper.setAttribute("baseProfile", "tiny");
        paper.setAttribute("width", "100%");
        paper.setAttribute("height", "100%");
        paper.setAttribute("viewBox", "0 0 400 600");
        paper.setAttribute("preserveAspectRatio", "xMinYMin meet");
        container.appendChild(paper);

        head[face.head.id](paper, face.fatness, face.color);
        eyebrow[face.eyebrows[0].id](paper, face.eyebrows[0].lr, face.eyebrows[0].cx, face.eyebrows[0].cy);
        eyebrow[face.eyebrows[1].id](paper, face.eyebrows[1].lr, face.eyebrows[1].cx, face.eyebrows[1].cy);

        eye[face.eyes[0].id](paper, face.eyes[0].lr, face.eyes[0].cx, face.eyes[0].cy, face.eyes[0].angle);
        eye[face.eyes[1].id](paper, face.eyes[1].lr, face.eyes[1].cx, face.eyes[1].cy, face.eyes[1].angle);

        nose[face.nose.id](paper, face.nose.cx, face.nose.cy, face.nose.size, face.nose.posY, face.nose.flip);
        mouth[face.mouth.id](paper, face.mouth.cx, face.mouth.cy);
        hair[face.hair.id](paper, face.fatness);
    }

    /**
     * Generate a random face.
     * 
     * @param {string=} container id of the div that the face will appear in. If not given, no face is drawn and the face object is simply returned.
     * @return {Object} Randomly generated face object.
     */
    function generate(container) {
        var angle, colors, face, flip, id, paper;

        face = {head: {}, eyebrows: [{}, {}], eyes: [{}, {}], nose: {}, mouth: {}, hair: {}};
        face.fatness = Math.random();
        colors = ["#f2d6cb", "#ddb7a0", "#ce967d", "#bb876f", "#aa816f", "#a67358", "#ad6453", "#74453d", "#5c3937"];
        face.color = colors[getId(colors)];

        face.head = {id: getId(head)};

        id = getId(eyebrow);
        face.eyebrows[0] = {id: id, lr: "l", cx: 135, cy: 250};
        face.eyebrows[1] = {id: id, lr: "r", cx: 265, cy: 250};

        angle = Math.random() * 50 - 20;
        id = getId(eye);
        face.eyes[0] = {id: id, lr: "l", cx: 135, cy: 280, angle: angle};
        face.eyes[1] = {id: id, lr: "r", cx: 265, cy: 280, angle: angle};

        flip = Math.random() > 0.5 ? true : false;
        face.nose = {id: getId(nose), lr: "l", cx: 200, cy: 330, size: Math.random(), posY: undefined, flip: flip};

        face.mouth = {id: getId(mouth), cx: 200, cy: 400};

        face.hair = {id: getId(hair)};

        if (typeof container !== "undefined") {
            display(container, face);
        }

        return face;
    }

    return {
        display: display,
        generate: generate
    };
}());