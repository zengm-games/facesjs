import React, { forwardRef, useEffect } from "react";
import { Face as FaceType, Overrides } from "../../src/types";
import { useInView } from "react-intersection-observer";
import { display } from "../../src/display";

export const Face = forwardRef<
  HTMLDivElement,
  {
    faceConfig: FaceType;
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
    />
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
