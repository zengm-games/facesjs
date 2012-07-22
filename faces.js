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

    nose.push(function (paper, cx, cy) {
        var e, x = cx - 30, y = cy;

        e = paper.path("M " + x + "," + y
                     + "l 30,30"
                     + "l 30,-30")
                 .attr({"stroke-width": "8px"});
    });
    nose.push(function (paper, cx, cy) {
        // Do variable sized nose and mirroring randomly after I figure out how to not kill the stroke width when applying a transformation

        var e, x = cx, y = cy - 10;

        e = paper.path("M " + x + "," + y
                     + "c 0,0 50,-30 0,30")
                 .attr({"stroke-width": "8px"});
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

    return {
        /**
         * Generate a random face
         * 
         * @param {string} container id of the div that the face will appear in.
         */
        generate: function (container) {
            var angle, color, colors, fatness, i, paper;

            // Set fatness, biased towards skinny
            fatness = Math.random() * 0.88;
            if (fatness > 0.6) {
                fatness = Math.random() * 0.88;
                if (fatness > 0.7) {
                    fatness = Math.random() * 0.88;
                    if (fatness > 0.8) {
                        fatness = Math.random() * 0.88;
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
            color = colors[i];

            paper = new Raphael(document.getElementById(container), 400, 600);
            head[0](paper, fatness, color);
            eyebrow[0](paper, "l", 135, 250);
            eyebrow[0](paper, "r", 265, 250);

            i = Math.floor(Math.random() * eye.length);
            angle = Math.random() * 60 - 30;
            eye[i](paper, "l", 135, 280, angle);
            eye[i](paper, "r", 265, 280, angle);

            i = Math.floor(Math.random() * nose.length);
            nose[i](paper, 200, 330);
            mouth[0](paper, 200, 385);
            hair[0](paper, fatness);
        }
    };
}(Raphael));