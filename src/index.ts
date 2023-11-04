export { display } from "./display.js";
export { server_display } from "./server_display.js";

// Switch back to one line like the others after TypeScript 3.8, see below
import { generate } from "./generate.js";
export { generate };

// Usually not needed, but just in case...
export { default as svgs } from "./svgs.js";
export { svgsIndex } from "./svgs-index.js";

export type { Face } from "./generate.js";
