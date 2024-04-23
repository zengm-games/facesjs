import "./index.css";
import { display } from "../src/display";
import { generate } from "../src/generate";

const newFace = (i: number) => {
  const face = generate(undefined, {
    gender: Math.random() < 0.5 ? "male" : "female",
  });
  display(`c${i}`, face);
};

const wide = window.matchMedia("(min-width: 666px)");
let renderedWideFaces = false;

const NUM_FACES_SMALL = 5;
const NUM_FACES_WIDE = 12;

const newFaces = () => {
  const numFaces = wide.matches ? NUM_FACES_WIDE : NUM_FACES_SMALL;

  for (let i = 0; i < numFaces; i++) {
    newFace(i);
  }

  if (wide.matches) {
    renderedWideFaces = true;
  }
};

// Generate faces for initial page load
newFaces();

// Watch for resizing from small to large, because otherwise we can't render the extra faces while they are not shown because it's glitchy rendering to a hidden div
wide.addEventListener("change", () => {
  if (wide.matches && !renderedWideFaces) {
    for (let i = NUM_FACES_SMALL; i < NUM_FACES_WIDE; i++) {
      newFace(i);
    }

    renderedWideFaces = true;
  }
});

// Generate new faces when "r" is pressed
document.addEventListener(
  "keydown",
  (event) => {
    if (event.code === "KeyR" && !event.ctrlKey) {
      newFaces();
    }
  },
  false,
);

(window as any).newFace = newFace;
(window as any).newFaces = newFaces;
