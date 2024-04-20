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

export const downloadFacePng = async (svg: string) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const v = await Canvg.from(ctx, svg);

  v.resize(600, 900, "xMidYMid meet");
  await v.render();

  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, `facesjs-${getCurrentTimestampAsString()}.png`);
    }
  });
};

export const downloadFaceSvg = (svg: string) => {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  downloadBlob(blob, `facesjs-${getCurrentTimestampAsString()}.svg`);
};

export const downloadFaceJson = (faceConfig: FaceConfig) => {
  const faceConfigString = JSON.stringify(faceConfig, null, 2);
  const blob = new Blob([faceConfigString], { type: "application/json" });
  downloadBlob(blob, `facesjs-${getCurrentTimestampAsString()}.json`);
};
