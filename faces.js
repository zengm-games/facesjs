var faces = (function (Raphael) {
    "use strict";

    var eye = [], eyebrow = [], hair = [], head = [], mouth = [], nose = [];

    head.push(function (paper, fatness, color) {
        var e;

        e = paper.path("M 200,100"
                     + "c 0,0 180,-10 180,200"
                     + "c 0,0 0,210 -180,200"
                     + "c 0,0 -180,10 -180,-200"
                     + "c 0,0 0,-210 180,-200")
                 .attr({"stroke-width": 0,
                        fill: color})
                 .transform("s " + (0.75 + 0.25 * fatness) + ",1");
    });

    eyebrow.push(function (paper, lr, cx, cy) {
        var e, x = cx - 30, y = cy;

        if (lr === "l") {
            e = paper.path("M " + x + "," + y
                         + "c 0,0 -3,-30 60,0");
        } else {
            e = paper.path("M " + x + "," + y
                         + "c 0,0 63,-30 60,0");
        }

        e.attr({"stroke-width": "8px"});
    });

    eye.push(function (paper, lr, cx, cy, angle) {
        var x = cx - 30, y = cy;

        paper.path("M " + x + "," + y
                 + "h 60")
             .attr({"stroke-width": "8px"})
             .transform("r" + (lr === "l" ? angle : -angle));
    });
    eye.push(function (paper, lr, cx, cy, angle) {
        var angle, x = cx, y = cy + 20;

        paper.path("M " + x + "," + y
                 + "a 30,20 0 1 1 0.1,0")
             .attr({"stroke-width": "6px"})
             .transform("r" + (lr === "l" ? angle : -angle));

        paper.path("M " + x + "," + (y - 12)
                 + "a 12,8 0 1 1 0.1,0")
             .attr({"stroke-width": 0,
                    fill: "#000"})
             .transform("r" + (lr === "l" ? angle : -angle));
    });
    eye.push(function (paper, lr, cx, cy, angle) {
        var angle, x = cx, y = cy + 20;

        paper.path("M " + x + "," + (y - 7)
                 + "a 20,15 0 1 1 0.1,0")
             .attr({"stroke-width": 0,
                    fill: "#000"})
             .transform("r" + (lr === "l" ? angle : -angle));
    });

    nose.push(function (paper, cx, cy, size, posY, flip) {
        var e, x = cx - 30, y = cy;

        e = paper.path("M " + x + "," + y
                     + "l 30,30"
                     + "l 30,-30")
                 .attr({"stroke-width": "8px"});
    });
    nose.push(function (paper, cx, cy, size, posY, flip) {
        // Do variable sized nose and mirroring randomly after I figure out how to not kill the stroke width when applying a transformation

        var e, x = cx, y = cy - 10;

        e = paper.path("M " + x + "," + y
                     + "c 0,0 50,-30 0,30")
                 .attr({"stroke-width": "8px"});

        if (flip) {
            e.transform("m -1 0 0 1 " + (x * 2) + " 0"); // e.transform("s -1,1");
        }
    });

    mouth.push(function (paper, cx, cy) {
        var e, x = cx - 75, y = cy;

        e = paper.path("M " + x + "," + y
                     + "c 0,0 75,60 150,0")
                 .attr({"stroke-width": "8px"});
    });

    hair.push(function (paper, fatness) {
        var e;

        e = paper.path("M 200,100"
                     + "c 0,0 180,-10 176,150"
                     + "c 0,0 -180,-150 -352,0"
                     + "c 0,0 0,-160 176,-150")
                 .attr({"stroke-width": 0,
                        fill: "#000"})
                 .transform("s " + (0.75 + 0.25 * fatness) + ",1");
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

        paper = new Raphael(document.getElementById(container), 400, 600);
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
        var angle, colors, face, flip, i, id, paper;

        face = {head: {}, eyebrows: [{}, {}], eyes: [{}, {}], nose: {}, mouth: {}, hair: {}};

        // Set fatness, biased towards skinny
        face.fatness = Math.random() * 0.88;
        if (face.fatness > 0.6) {
            face.fatness = Math.random() * 0.88;
            if (face.fatness > 0.7) {
                face.fatness = Math.random() * 0.88;
                if (face.fatness > 0.8) {
                    face.fatness = Math.random() * 0.88;
                }
            }
        }

        colors = ["#f2d6cb", "#ddb7a0", "#ce967d", "#bb876f", "#aa816f", "#a67358", "#ad6453", "#74453d", "#5c3937"];
        i = Math.floor(Math.random() * colors.length);
        if (i < 7) {
            i = Math.floor(Math.random() * colors.length);
            if (i < 6) {
                i = Math.floor(Math.random() * colors.length);
                if (i < 5) {
                    i = Math.floor(Math.random() * colors.length);
                }
            }
        }
        face.color = colors[i];

        face.head = {id: getId(head)};

        id = getId(eyebrow);
        face.eyebrows[0] = {id: id, lr: "l", cx: 135, cy: 250};
        face.eyebrows[1] = {id: id, lr: "r", cx: 265, cy: 250};

        angle = Math.random() * 60 - 30;
        id = getId(eye);
        face.eyes[0] = {id: id, lr: "l", cx: 135, cy: 280, angle: angle};
        face.eyes[1] = {id: id, lr: "r", cx: 265, cy: 280, angle: angle};

        flip = Math.random() > 0.5 ? true : false;
        face.nose = {id: getId(nose), lr: "l", cx: 200, cy: 330, size: undefined, posY: undefined, flip: flip};

        face.mouth = {id: getId(mouth), cx: 200, cy: 385};

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
}(Raphael));