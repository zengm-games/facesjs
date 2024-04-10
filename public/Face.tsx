import React from "react";
import { faceToSvgString } from "../src/faceToSvgString";
import { FaceConfig, Overrides } from "../src/types";
import { objStringifyInOrder } from "./utils";
import { useInView } from "react-intersection-observer";

/*
    This component is responsible for rendering the face SVG string
    It uses the faceToSvgString function to generate the SVG string
    It requires the faceConfig to be set, with the overrides being optional
    The width and className are also optional
    The SVG string is then rendered in a div element
    The SVG string is set as the innerHTML of the div element
*/

export const Face = ({
  faceConfig,
  overrides,
  maxWidth,
  width,
  className,
  lazyLoad,
}: {
  faceConfig: FaceConfig;
  overrides?: Overrides;
  maxWidth?: number;
  width?: number;
  className?: string;
  lazyLoad?: boolean;
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0,
  });

  const faceSvg =
    inView || !lazyLoad ? faceToSvgString(faceConfig, overrides) : "";

  let widthStyle: React.CSSProperties = width
    ? { width: `${width}px` }
    : { width: "400px" };
  let heightStyle: React.CSSProperties = width
    ? { height: `${width * 1.5}px` }
    : { height: "600px" };

  if (maxWidth) {
    widthStyle = { maxWidth: `${maxWidth}px` };
    heightStyle = { maxHeight: `${maxWidth * 1.5}px` };
  }

  widthStyle.minWidth = "60px";
  heightStyle.minHeight = "90px";

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...widthStyle, ...heightStyle, aspectRatio: "2/3" }}
      dangerouslySetInnerHTML={{ __html: faceSvg || "" }}
    ></div>
  );
};
