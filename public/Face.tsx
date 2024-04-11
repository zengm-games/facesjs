import React, { useEffect, useRef } from "react";
import { FaceConfig, Overrides } from "../src/types";
import { useInView } from "react-intersection-observer";
import { display } from "../src/display";

/*
    This component is responsible for rendering the face SVG string
    It uses the faceToSvgString function to generate the SVG string
    It requires the faceConfig to be set, with the overrides being optional
    The width and className are also optional
    The SVG string is then rendered in a div element
    The SVG string is set as the innerHTML of the div element
*/

export const Face = React.forwardRef<
  HTMLDivElement,
  {
    faceConfig: FaceConfig;
    overrides?: Overrides;
    maxWidth?: number;
    width?: number;
    className?: string;
    lazyLoad?: boolean;
  }
>(({ faceConfig, overrides, maxWidth, width, className, lazyLoad }, ref) => {
  const [scrollRef, inView] = useInView({
    triggerOnce: false,
    threshold: 0,
  });

  useEffect(() => {
    if (
      (inView || !lazyLoad) &&
      ref &&
      typeof ref === "object" &&
      ref.current
    ) {
      display(ref.current, faceConfig, overrides);
    }
  }, [inView, faceConfig, overrides, ref]);

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
      ref={mergeRefs(ref, scrollRef)}
      className={className}
      style={{ ...widthStyle, ...heightStyle, aspectRatio: "2/3" }}
    ></div>
  );
});

const mergeRefs = (...refs: React.Ref<HTMLDivElement>[]) => {
  return (node: HTMLDivElement) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref && typeof ref === "object") {
        // @ts-ignore
        ref.current = node;
      }
    });
  };
};
