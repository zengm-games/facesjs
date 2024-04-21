import { forwardRef, useEffect, useRef, type CSSProperties } from "react";
import { Face as FaceType, Overrides } from "../../src/types";
import { useInView } from "react-intersection-observer";
import { display } from "../../src/display";
import override from "../../src/override";
import { deepCopy } from "./utils";

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
>(({ faceConfig, overrides, maxWidth, width = 400, lazyLoad }, ref) => {
  const [scrollRef, inView] = useInView();

  const faceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((inView || !lazyLoad) && faceRef.current) {
      if (overrides) {
        // Only apply overrides if face is in viewport
        const faceConfigCopy = deepCopy(faceConfig);
        override(faceConfigCopy, overrides);
        display(faceRef.current, faceConfig, overrides);
      } else {
        display(faceRef.current, faceConfig);
      }
    }
  }, [inView, faceConfig, overrides]);

  const style: CSSProperties = {
    aspectRatio: "2/3",
    minWidth: 60,
    minHeight: 90,
  };

  if (maxWidth !== undefined) {
    style.maxWidth = maxWidth;
    style.maxHeight = maxWidth * 1.5;
  } else {
    style.width = width;
    style.height = width * 1.5;
  }

  return <div ref={mergeRefs(ref, faceRef, scrollRef)} style={style} />;
});
