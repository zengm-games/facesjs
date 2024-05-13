import { forwardRef, useEffect, useRef, type CSSProperties } from "react";
import { Face as FaceType, Overrides } from "./types";
import { useInView } from "react-intersection-observer";
import { display } from "./display";
import { deepCopy } from "./utils";

export const Face = forwardRef<
  HTMLDivElement,
  {
    face: FaceType;
    ignoreDisplayErrors?: boolean;
    lazy?: boolean;
    overrides?: Overrides;
    style?: CSSProperties;
  }
>(({ face, ignoreDisplayErrors, lazy, overrides, style }, ref) => {
  const [inViewRef, inView] = useInView();

  const faceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((inView || !lazy) && faceRef.current) {
      try {
        if (overrides) {
          // Only apply overrides if face is in viewport
          display(faceRef.current, deepCopy(face), overrides);
        } else {
          display(faceRef.current, face);
        }
      } catch (error) {
        if (!ignoreDisplayErrors) {
          throw error;
        }
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
