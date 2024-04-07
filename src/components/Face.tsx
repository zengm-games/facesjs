import React from "react"
import { faceToSvgString } from "../tools/draw/faceToSvgString"
import { FaceConfig, Overrides } from "../tools/types"
import { objStringifyInOrder } from "../tools/utils";

/*
    This component is responsible for rendering the face SVG string
    It uses the faceToSvgString function to generate the SVG string
    It requires the faceConfig to be set, with the overrides being optional
    The width and className are also optional
    The SVG string is then rendered in a div element
    The SVG string is set as the innerHTML of the div element
    Memoization is used to speed up rendering by reusing the same SVG string
*/


export const memoizeWithDeepComparison = <Fn extends (...args: any[]) => any>(fn: Fn) => {
    const cache = new Map<string, ReturnType<Fn>>();
    return function (...args: Parameters<Fn>) {
        const serializedArgs = args.map(arg =>
            // objStringifyInOrder is used to stringify objects in a consistent order, flattening nested objects then sorting keys
            typeof arg === 'object' ? objStringifyInOrder(arg) : JSON.stringify(arg)
        ).join(',');
        if (cache.has(serializedArgs)) {
            return cache.get(serializedArgs);
        }
        const result = fn(...args);
        cache.set(serializedArgs, result);
        return result;
    };
};

const faceToSvgStringMemoized = memoizeWithDeepComparison(faceToSvgString);
// Set to false to disable memoization
// Memoization is useful when rendering multiple faces with the same configuration
//      It will speed up rendering by reusing the same SVG string
const MEMOIZE_FACE = true;


export const Face: React.FC<{ faceConfig: FaceConfig, overrides?: Overrides, width?: number, className?: string }> = ({ faceConfig, overrides, width, className }) => {

    let faceSvg;
    if (!MEMOIZE_FACE) {
        faceSvg = faceToSvgString(faceConfig, overrides);
    }
    else {
        faceSvg = faceToSvgStringMemoized(faceConfig, overrides);
    }

    let widthStyle = width ? { width: `${width}px` } : { width: '400px' }
    let heightStyle = width ? { height: `${width * 1.5}px` } : { height: '600px' }

    return (
        <div
            className={className}
            style={{ ...widthStyle, ...heightStyle }}
            dangerouslySetInnerHTML={{ __html: faceSvg }}>
        </div>
    )
}