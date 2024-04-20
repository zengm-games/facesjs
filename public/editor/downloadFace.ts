import { faceToSvgString } from "../../src/faceToSvgString";
import { FaceConfig } from "../../src/types";
import { getCurrentTimestampAsString } from "./utils";
import { Canvg } from "canvg";

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

export const downloadFacePng = async (faceConfig: FaceConfig) => {
  const faceSvg = faceToSvgString(faceConfig);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const v = await Canvg.from(ctx, faceSvg);

  v.resize(600, 900, "xMidYMid meet");
  await v.render();

  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, `facesjs-${getCurrentTimestampAsString()}.png`);
    }
  });
};

export const downloadFaceSvg = (faceConfig: FaceConfig) => {
  const faceSvg = faceToSvgString(faceConfig);
  const blob = new Blob([faceSvg], { type: "image/svg+xml" });
  downloadBlob(blob, `facesjs-${getCurrentTimestampAsString()}.svg`);
};

export const downloadFaceJson = (faceConfig: FaceConfig) => {
  const faceConfigString = JSON.stringify(faceConfig, null, 2);
  const blob = new Blob([faceConfigString], { type: "application/json" });
  downloadBlob(blob, `facesjs-${getCurrentTimestampAsString()}.json`);
};
