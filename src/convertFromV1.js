/*
Convert face.js 1 format like:

{ head: { id: 0 },
  eyebrows:
   [ { id: 0, lr: 'l', cx: 135, cy: 250 },
     { id: 0, lr: 'r', cx: 265, cy: 250 } ],
  eyes:
   [ { id: 1, lr: 'l', cx: 135, cy: 280, angle: 27.861537444962252 },
     { id: 1, lr: 'r', cx: 265, cy: 280, angle: 27.861537444962252 } ],
  nose:
   { id: 0,
     lr: 'l',
     cx: 200,
     cy: 330,
     size: 0.26825976581890787,
     posY: undefined,
     flip: true },
  mouth: { id: 4, cx: 200, cy: 400 },
  hair: { id: 0 },
  fatness: 0.7266948323707014,
  color: '#ddb7a0' }

to faces.js 2 format like:

{ fatness: 0.32,
  head: { id: 'normal', color: '#74453d' },
  eye: { id: 'line', angle: 2 },
  eyebrow: { id: 'normal' },
  hair: { id: 'afro' },
  mouth: { id: 'open-mouth' },
  nose: { id: 'honker', flip: true, size: 0.17 } }
*/

const convertFromV1 = old => {
  const eyes = ["line", "normal", "dot", "eyelid"];
  const hairs = ["normal", "flat-top", "afro", "cornrows", "bald"];
  const mouths = [
    "thin-smile",
    "thin-flat",
    "teeth-smile",
    "open-mouth",
    "thin-smile-ends"
  ];
  const noses = ["v", "pinocchio", "honker"];

  return {
    fatness: old.fatness,
    head: { id: "normal", color: old.color },
    eye: { id: eyes[old.eyes[0].id], angle: old.eyes[0].angle },
    eyebrow: { id: "normal" },
    hair: { id: hairs[old.hair.id] },
    mouth: { id: mouths[old.mouth.id] },
    nose: { id: noses[old.nose.id], flip: old.nose.flip, size: old.nose.size }
  };
};

export default convertFromV1;
