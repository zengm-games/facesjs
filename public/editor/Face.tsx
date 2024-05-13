import { forwardRef, useEffect, useRef, type CSSProperties } from "react";
import { Face as FaceType, Overrides } from "../../src/types";
import { useInView } from "react-intersection-observer";
import { display } from "../../src/display";
import { deepCopy } from "./utils";

export const Face = forwardRef<
  HTMLDivElement,
  {
    face: FaceType;
    overrides?: Overrides;
    lazy?: boolean;
    style?: CSSProperties;
  }
>(({ face, overrides, lazy, style }, ref) => {
  const [inViewRef, inView] = useInView();

  const faceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((inView || !lazy) && faceRef.current) {
      if (overrides) {
        // Only apply overrides if face is in viewport
        display(faceRef.current, deepCopy(face), overrides);
      } else {
        display(faceRef.current, face);
      }
    }
  }, [inView, face, overrides]);

  return (
    <div
      ref={(node: HTMLDivElement) => {
        if (ref) {
          // @ts-expect-error
          ref.current = node;
        }
        // @ts-expect-error
        faceRef.current = node;
        inViewRef(node);
      }}
      style={style}
    />
  );
});
