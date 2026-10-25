import { svgPathBbox } from "svg-path-bbox";
import { display } from "./display.js";
import { FaceConfig, Overrides } from "./common.js";

// Attribute values can contain data from the face config (like angle or size), so escape them like setAttribute effectively does in the browser
const escapeAttribute = (value: string) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

type BBox = [minX: number, minY: number, maxX: number, maxY: number];

// SVG transform matrix [a, b, c, d, e, f], meaning x' = a*x + c*y + e and y' = b*x + d*y + f
type Matrix = [number, number, number, number, number, number];

const identity: Matrix = [1, 0, 0, 1, 0, 0];

const multiply = (m: Matrix, n: Matrix): Matrix => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
];

const parseTransform = (transform: string | undefined): Matrix => {
  let matrix = identity;
  if (!transform) {
    return matrix;
  }

  for (const [, type, args] of transform.matchAll(/(\w+)\s*\(([^)]*)\)/g)) {
    const nums = (
      args.match(/[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) ?? []
    ).map(Number);
    const [n0 = 0, n1, n2 = 0] = nums;
    let m: Matrix;
    if (type === "matrix" && nums.length === 6) {
      m = nums as Matrix;
    } else if (type === "translate") {
      m = [1, 0, 0, 1, n0, n1 ?? 0];
    } else if (type === "scale") {
      m = [n0, 0, 0, n1 ?? n0, 0, 0];
    } else if (type === "rotate") {
      const rad = (n0 * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const cx = n1 ?? 0;
      const cy = n2;
      // Rotate around (cx, cy)
      m = [
        cos,
        sin,
        -sin,
        cos,
        cx - cos * cx + sin * cy,
        cy - sin * cx - cos * cy,
      ];
    } else if (type === "skewX") {
      m = [1, 0, Math.tan((n0 * Math.PI) / 180), 1, 0, 0];
    } else if (type === "skewY") {
      m = [1, Math.tan((n0 * Math.PI) / 180), 0, 1, 0, 0];
    } else {
      continue;
    }
    matrix = multiply(matrix, m);
  }

  return matrix;
};

const getAttributes = (attributesString: string) => {
  const attributes: Record<string, string> = {};
  for (const [, name, value] of attributesString.matchAll(
    /([\w:-]+)="([^"]*)"/g,
  )) {
    attributes[name] = value;
  }
  return attributes;
};

/**
 * Bounding box of all the shapes in an SVG string, like getBBox() on a <g> containing it. Handles <path>, <circle>, and <ellipse> (the only shapes left after svgo), including their transform attributes.
 */
export const getShapesBBox = (xml: string): BBox | undefined => {
  let bbox: BBox | undefined;

  for (const [, tag, attributesString] of xml.matchAll(
    /<(path|circle|ellipse)\b([^>]*)>/g,
  )) {
    const attributes = getAttributes(attributesString);
    const [a, b, c, d, e, f] = parseTransform(attributes["transform"]);

    // Bbox in the shape's own coordinates, before its transform
    let x0, y0, x1, y1;
    if (tag === "path") {
      if (!attributes["d"]) {
        continue;
      }
      [x0, y0, x1, y1] = svgPathBbox(attributes["d"]);
    } else {
      const cx = parseFloat(attributes["cx"] ?? "0");
      const cy = parseFloat(attributes["cy"] ?? "0");
      const rx = parseFloat(
        (tag === "circle" ? attributes["r"] : attributes["rx"]) ?? "0",
      );
      const ry = parseFloat(
        (tag === "circle" ? attributes["r"] : attributes["ry"]) ?? "0",
      );
      [x0, y0, x1, y1] = [cx - rx, cy - ry, cx + rx, cy + ry];
    }

    // Like browsers, apply the transform to the corners of that bbox rather than to the shape itself
    const corners = [
      [x0, y0],
      [x1, y0],
      [x0, y1],
      [x1, y1],
    ].map(([x, y]) => [a * x + c * y + e, b * x + d * y + f]);
    const xs = corners.map((corner) => corner[0]);
    const ys = corners.map((corner) => corner[1]);
    const shapeBBox: BBox = [
      Math.min(...xs),
      Math.min(...ys),
      Math.max(...xs),
      Math.max(...ys),
    ];

    bbox = bbox
      ? [
          Math.min(bbox[0], shapeBBox[0]),
          Math.min(bbox[1], shapeBBox[1]),
          Math.max(bbox[2], shapeBBox[2]),
          Math.max(bbox[3], shapeBBox[3]),
        ]
      : shapeBBox;
  }

  return bbox;
};

/**
 * An instance of this object can pretend to be the global "document"
 * variable used in a browser context so that the calls made by the display()
 * function populate our structure instead of manipulating DOM nodes.
 */
class SvgDocument {
  public root: SvgNode | undefined;
  public innerHTML = "";

  private container = {
    appendChild(_node: unknown) {},
  };

  appendChild(node: SvgNode) {
    this.root = node;
  }

  getElementById(_id: string) {
    return this.container;
  }

  createElementNS(_namespace: string, tag: string) {
    this.root = new SvgNode(tag, undefined);
    return this.root;
  }

  toXml() {
    return this.root!.toXml();
  }
}

class SvgNode {
  public attributes: Record<string, string> = {};
  public childNodes: SvgNode[] = [];

  public lastChild: SvgNode | undefined;
  private minX: number | undefined;
  private minY: number | undefined;
  private maxX: number | undefined;
  private maxY: number | undefined;

  constructor(
    public tag: string | undefined,
    public xml: string | undefined,
  ) {
    // We will need to insert attribute of the g node, so let's
    // split the xml <g>...</g>
    if (this.xml?.startsWith("<g>")) {
      this.tag = "g";
      this.childNodes.push(
        new SvgNode(
          undefined,
          this.xml.substring("<g>".length, this.xml.length - "</g>".length),
        ),
      );
      // Let's calculate the bbox of this g group, so that translation,
      // rotation and scaling operations applied to this element get the
      // correct values when invoking getBBox()
      const bbox = getShapesBBox(this.xml);
      if (bbox) {
        [this.minX, this.minY, this.maxX, this.maxY] = bbox;
      }

      this.xml = undefined;
    }
  }

  setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }

  insertAdjacentHTML(_position: string, content: string) {
    this.lastChild = new SvgNode(undefined, content);
    this.childNodes.push(this.lastChild);
  }

  getBBox() {
    return {
      x: this.minX,
      y: this.minY,
      width: this.maxX! - this.minX!,
      height: this.maxY! - this.minY!,
    };
  }

  getAttribute(name: string) {
    return this.attributes[name];
  }

  toXml(): string {
    let s = "";
    if (this.tag) {
      let openTag = `<${this.tag}`;
      if (this.tag === "svg") {
        openTag += ' xmlns="http://www.w3.org/2000/svg"';
      }
      for (const attributeName of Object.keys(this.attributes)) {
        openTag += ` ${attributeName}="${escapeAttribute(this.attributes[attributeName])}"`;
      }
      openTag += ">";
      s += openTag + "\n";
      for (const child of this.childNodes) {
        s += child.toXml() + "\n";
      }
      s += `</${this.tag}>`;
    } else {
      s += this.xml;
    }
    return s;
  }
}

/**
 * Renders the given face in a pseudo DOM element and then returns the
 * SVG image as an XML string.
 */
export const faceToSvgString = (
  face: FaceConfig,
  overrides?: Overrides,
): string => {
  const svgDocument = new SvgDocument();
  // Even though we will provide a pseudo HTML elment, display() accesses
  // document.createElementNS() so we need to inject our own code there.
  // Let's first save what's already there
  const backup = globalThis.document;

  try {
    globalThis.document = svgDocument as any;
    display(svgDocument as unknown as HTMLElement, face, overrides);
  } finally {
    globalThis.document = backup;
  }
  return svgDocument.toXml();
};
