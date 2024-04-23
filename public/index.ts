import { display } from "../src/display";
import { generate } from "../src/generate";

const newFace = (i: number) => {
  const face = generate(undefined, {
    gender: Math.random() < 0.5 ? "male" : "female",
  });
  display(`c${i}`, face);
};

const newFaces = () => {
  for (let i = 0; i < 12; i++) {
    newFace(i);
  }
};

// Generate faces for initial page load
newFaces();

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
