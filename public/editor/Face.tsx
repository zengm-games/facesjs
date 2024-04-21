import React, { forwardRef, useEffect, useRef } from "react";
import { Face as FaceType, Overrides } from "../../src/types";
import { useInView } from "react-intersection-observer";
import { display } from "../../src/display";
import override from "../../src/override";

const mergeRefs = <T extends HTMLElement>(...refs: React.Ref<T>[]) => {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }

      if (typeof ref === "function") {
        ref(node);
      } else if (ref && typeof ref === "object") {
        // @ts-expect-error
        ref.current = node;
      }
    }
  };
};

export const Face = forwardRef<
  HTMLDivElement,
  {
    faceConfig: FaceType;
    overrides?: Overrides;
    maxWidth?: number;
    width?: number;
    lazyLoad?: boolean;
  }
>(({ faceConfig, overrides, maxWidth, width, lazyLoad }, ref) => {
  const [scrollRef, inView] = useInView({
    triggerOnce: false,
    threshold: 0,
  });

  const faceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((inView || !lazyLoad) && faceRef.current) {
      if (overrides) {
        // Only apply overrides if face is in viewport
        const faceConfigCopy = structuredClone(faceConfig);
        override(faceConfigCopy, overrides);
        display(faceRef.current, faceConfig, overrides);
      } else {
        display(faceRef.current, faceConfig);
      }
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
      ref={mergeRefs(ref, faceRef, scrollRef)}
      style={{ ...widthStyle, ...heightStyle, aspectRatio: "2/3" }}
    />
  );
});
