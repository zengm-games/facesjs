import { faceToSvgString } from "../../src/faceToSvgString";
import { FaceConfig } from "../../src/types";
import { getCurrentTimestampAsString } from "./utils";
import { Canvg } from "canvg";

export const DownloadFaceAsPng = async (faceConfig: FaceConfig) => {
  // @ts-ignore
  const faceSvg = faceToSvgString(faceConfig);

  const downloadPng = async () => {
    const canvas = document.createElement("canvas");
    const ctx: any = canvas.getContext("2d");
    const v = await Canvg.from(ctx, faceSvg);

    v.resize(600, 900, "xMidYMid meet");
    await v.render();

    canvas.toBlob((blob: any) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facesjs_render_${getCurrentTimestampAsString()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  await downloadPng();
};

export const DownloadFaceAsSvg = (faceConfig: FaceConfig) => {
  // @ts-ignore
  const faceSvg = faceToSvgString(faceConfig);
  const blob = new Blob([faceSvg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `facesjs_render_${getCurrentTimestampAsString()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
};

export const DownloadFaceAsJSON = (faceConfig: FaceConfig) => {
  const faceConfigString = JSON.stringify(faceConfig, null, 2);
  const blob = new Blob([faceConfigString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `facesjs_render_${getCurrentTimestampAsString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
};
