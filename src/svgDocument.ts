import svgPathBbox from "svg-path-bbox";

/**
 * An instance of this object can pretend to be the global "document"
 * variable used in a browser context so that the calls made by the display()
 * function populates our structure instead of manipulating DOM nodes.
 */
export class SvgDocument {
  public root: SvgNode | undefined;
  public innerHTML = "";

  private container = {
    appendChild(node: any) {},
  };

  appendChild(node: any) {
    this.root = node;
  }

  getElementById(id: string) {
    return this.container;
  }

  createElementNS(namespace: string, tag: string) {
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
  private minX = 0;
  private minY = 0;
  private maxX = 400;
  private maxY = 600;

  constructor(public tag: string | undefined, public xml: string | undefined) {
    // We will need to insert attribute of the g node, so let's
    // split the xml <g>...</g>
    if (this.xml?.startsWith("<g>")) {
      this.tag = "g";
      this.childNodes.push(
        new SvgNode(
          undefined,
          this.xml.substring("<g>".length, this.xml.length - "</g>".length)
        )
      );
      // Let's calculate the bbox of this g group which is the smallest bbox
      // that contains the bboxes of all paths
      let pathStart = 0;
      while (true) {
        pathStart = this.xml.indexOf(' d="', pathStart);
        if (pathStart === -1) break;
        pathStart += ' d="'.length;
        const pathEnd = this.xml.indexOf('"', pathStart);
        const path = this.xml.substring(pathStart, pathEnd);
        const bbox = svgPathBbox(path);
        if (this.minX === undefined || bbox[0] < this.minX) {
          this.minX = bbox[0];
        }
        if (this.minY === undefined || bbox[1] < this.minY) {
          this.minY = bbox[1];
        }
        if (this.maxX === undefined || bbox[2] > this.maxX) {
          this.maxX = bbox[2];
        }
        if (this.maxY === undefined || bbox[3] > this.maxY) {
          this.maxY = bbox[3];
        }

        pathStart = pathEnd + 1;
      }

      this.xml = undefined;
    }
  }

  setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }

  insertAdjacentHTML(position: string, content: string) {
    this.lastChild = new SvgNode(undefined, content);
    this.childNodes.push(this.lastChild);
  }

  getBBox() {
    return {
      x: this.minX!,
      y: this.minY!,
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
        openTag += ` ${attributeName}="${this.attributes[attributeName]}"`;
      }
      openTag += ">";
      s += openTag + "\n";
      for (const child of this.childNodes) {
        s += child.toXml() + "\n";
      }
      s += `</${this.tag}>\n`;
    } else {
      s += this.xml + "\n";
    }
    return s;
  }
}
