import React from "react"
import { faceToSvgString } from "../features/face_utils/faceToSvgString"
import { FaceConfig, Overrides } from "../features/face_utils/types"

export const Face: React.FC<{ faceConfig: FaceConfig, overrides?: Overrides, width?: number }> = ({ faceConfig, overrides, width }) => {

    let faceSvg = faceToSvgString(faceConfig, overrides)

    let widthStyle = width ? { width: `${width}px` } : { width: '400px' }
    let heightStyle = width ? { height: `${width * 1.5}px` } : { height: '600px' }

    console.log('Face', { faceConfig, overrides, width, faceSvg, widthStyle, heightStyle })

    return (
        <div
            style={{ ...widthStyle, ...heightStyle }}
            dangerouslySetInnerHTML={{ __html: faceSvg }}>
        </div>
    )
}