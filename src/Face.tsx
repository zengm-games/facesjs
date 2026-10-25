import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { FaceConfig, Overrides } from "./common.js";
import { display } from "./display.js";

const useIntersectionObserver = () => {
  const [ref, setRef] = useState<HTMLElement | undefined>();
  const [entry, setEntry] = useState<IntersectionObserverEntry | undefined>();

  useEffect(() => {
    if (!ref) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    });

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return [setRef, entry] as const;
};

export const Face = forwardRef<
  HTMLDivElement,
  {
    className?: string;
    face: FaceConfig;
    ignoreDisplayErrors?: boolean;
    lazy?: boolean;
    overrides?: Overrides;
    style?: CSSProperties;
  }
>(({ className, face, ignoreDisplayErrors, lazy, overrides, style }, ref) => {
  const [intersectionObserverRef, intersectionObserverEntry] =
    useIntersectionObserver();

  const faceRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (
      (intersectionObserverEntry?.isIntersecting || !lazy) &&
      faceRef.current
    ) {
      try {
        display(faceRef.current, face, overrides);
      } catch (error) {
        if (!ignoreDisplayErrors) {
          throw error;
        }
      }
    }
  }, [intersectionObserverEntry, face, overrides]);

  return (
    <div
      className={className}
      ref={(node: HTMLDivElement) => {
        if (ref) {
          // @ts-expect-error
          ref.current = node;
        }
        // @ts-expect-error
        faceRef.current = node;
        intersectionObserverRef(node);
      }}
      style={style}
    />
  );
});
