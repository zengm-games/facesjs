import { Face } from "../../src/types";
import { getCurrentTimestampAsString } from "./utils";

// https://blog.logrocket.com/programmatically-downloading-files-browser/
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.download = filename;
  a.href = url;

  const clickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      removeEventListener("click", clickHandler);
    }, 30 * 1000);
  };

  a.addEventListener("click", clickHandler, false);

  a.click();
};

export const downloadFacePng = async (svgString: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 600;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  // I wish this wasn't needed, but it seems to be
  const fixedSvgString = svgString
    .replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ')
    .replace('width="100%"', `width="${canvas.width}"`)
    .replace('height="100%"', `height="${canvas.height}"`);

  const svgBlob = new Blob([fixedSvgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.width = canvas.width;
  img.height = canvas.height;
  img.addEventListener("load", function () {
    ctx.drawImage(this, 0, 0);
    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, `facesjs-${getCurrentTimestampAsString()}.png`);
      }
    });
  });
  img.src = url;
};

export const downloadFaceSvg = (svgString: string) => {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  downloadBlob(blob, `facesjs-${getCurrentTimestampAsString()}.svg`);
};

export const downloadFaceJson = (faceConfig: Face) => {
  const faceConfigString = JSON.stringify(faceConfig, null, 2);
  const blob = new Blob([faceConfigString], { type: "application/json" });
  downloadBlob(blob, `facesjs-${getCurrentTimestampAsString()}.json`);
};
