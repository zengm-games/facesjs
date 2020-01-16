export { default as display } from "./display";

// Switch back to one line like the others after TypeScript 3.8, see below
import generate from "./generate";
export { generate };

// Usually not needed, but just in case...
export { default as svgs } from "./svgs";
export { default as svgsIndex } from "./svgs-index";

// Uncomment this when TypeScript 3.8 is out. Otherwise importing and re-exporting breaks
// export type { Face } from "./generate";
export type Face = ReturnType<typeof generate>;
