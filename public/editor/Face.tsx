import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
} from "react";
import { Face as FaceType, Overrides } from "../../src/types";
import { useInView } from "react-intersection-observer";
import { display } from "../../src/display";
import { deepCopy } from "./utils";

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
  const [inViewRef, inView] = useInView();

  const faceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((inView || !lazyLoad) && faceRef.current) {
      if (overrides) {
        // Only apply overrides if face is in viewport
        display(faceRef.current, deepCopy(faceConfig), overrides);
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

  const setRefs = useCallback(
    (node: HTMLDivElement) => {
      if (ref) {
        // @ts-expect-error
        ref.current = node;
      }
      // @ts-expect-error
      faceRef.current = node;
      inViewRef(node);
    },
    [inViewRef],
  );

  return <div ref={setRefs} style={style} />;
});
