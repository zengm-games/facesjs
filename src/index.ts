export { display } from "./display";

// Switch back to one line like the others after TypeScript 3.8, see below
import { generate } from "./generate";
export { generate };

// Usually not needed, but just in case...
export { default as svgs } from "./svgs";
export { svgsIndex } from "./svgs-index";

export type { Face } from "./generate";
