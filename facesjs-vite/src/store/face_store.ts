import { create, StateCreator } from 'zustand'
import { CombinedState, FaceConfig, FaceState, ToolbarConfig, ToolbarState } from '../features/face_utils/types'
import { generate } from '../features/face_utils/generate'
import { generateRangeFromSlots, generateRangeFromStep } from '../features/face_utils/utils'


let toolbarItemConfig: ToolbarConfig = {
    Body: [
        {
            key: 'body.color',
            text: 'Skin Color',
            valuesToRender: [
                "#f2d6cb", "#ddb7a0", "#fedac7", "#f0c5a3", "#eab687", "#bb876f", "#aa816f", "#a67358", "#ad6453", "#74453d", "#5c3937"
            ],
            isSelected: true,
        },
        {
            key: 'body.size',
            text: 'Body Size',
            valuesToRender: generateRangeFromSlots(0.8, 1.2, 5),
        },
        {
            key: 'body.id',
            text: 'Body Shape',
            hasSvgs: true,
        },
        {
            key: 'head.id',
            text: 'Head Shape',
            hasSvgs: true,
        },
        {
            key: 'fatness',
            text: 'Face Size',
            valuesToRender: generateRangeFromSlots(0, 1, 20),
        },
    ],
    Mouth: [
        {
            key: 'mouth.id',
            text: 'Mouth Shape',
            hasSvgs: true,
        },
        {
            key: 'mouth.size',
            text: 'Mouth Size',
            valuesToRender: generateRangeFromSlots(0.8, 1.2, 10),
        },
        {
            key: 'mouth.flip',
            text: 'Mouth Flip',
            valuesToRender: [true, false],
        },
    ],
    Eyes: [
        {
            key: 'eye.id',
            text: 'Eye Shape',
            hasSvgs: true,
        },
        {
            key: 'eye.angle',
            text: 'Eye Angle',
            valuesToRender: generateRangeFromSlots(-10, 15, 15),
        },
        {
            key: 'eyeDistance',
            text: 'Eye Distance',
            valuesToRender: generateRangeFromSlots(-4, 4, 10),
        },
    ],
    Ears: [
        {
            key: 'ear.id',
            text: 'Ear Shape',
            hasSvgs: true,
        },
        {
            key: 'ear.size',
            text: 'Ear Size',
            valuesToRender: generateRangeFromSlots(0.5, 1.5, 10),
        },
    ],
    Hair: [
        {
            key: 'hair.id',
            text: 'Hair Style',
            hasSvgs: true,
        },
        {
            key: 'hair.color',
            text: 'Hair Color',
            valuesToRender: [
                "#272421",
                "#3D2314",
                "#5A3825",
                "#CC9966",
                "#2C1608",
                "#B55239",
                "#e9c67b",
                "#D7BF91",
                "#0f0902",
                "#1c1008",
            ],
        },
        {
            key: 'hair.flip',
            text: 'Hair Flip',
            valuesToRender: [true, false],
        },
        {
            key: 'hairBg.id',
            text: 'Hair Background',
            hasSvgs: true,
        },
    ],
    'Facial Hair': [
        {
            key: 'facialHair.id',
            text: 'Facial Hair Style',
            hasSvgs: true,
        },
        {
            key: 'head.shaveOpacity',
            text: 'Head Shave Opacity',
            valuesToRender: generateRangeFromSlots(0, 1, 10),
        },
    ],
    Eyebrows: [
        {
            key: 'eyebrow.id',
            text: 'Eyebrow Style',
            hasSvgs: true,
        },
        {
            key: 'eyebrow.angle',
            text: 'Eyebrow Angle',
            valuesToRender: generateRangeFromSlots(-15, 20, 10),
        },
    ],
    Nose: [
        {
            key: 'nose.id',
            text: 'Nose Shape',
            hasSvgs: true,
        },
        {
            key: 'nose.size',
            text: 'Nose Size',
            valuesToRender: generateRangeFromSlots(0.5, 1.25, 10),
        },
        {
            key: 'nose.flip',
            text: 'Nose Flip',
            valuesToRender: [true, false],
        },
    ],
    Glasses: [
        {
            key: 'glasses.id',
            text: 'Glasses Style',
            hasSvgs: true,
        },
    ],
    Accessories: [
        {
            key: 'accessories.id',
            text: 'Accessories Style',
            hasSvgs: true,
        },
    ],
    Earrings: [
        {
            key: 'earring.id',
            text: 'Earring Style',
            hasSvgs: true,
        },
    ],
    'Eye Line': [
        {
            key: 'eyeLine.id',
            text: 'Eye Line Style',
            hasSvgs: true,
        },
        {
            key: 'smileLine.id',
            text: 'Smile Line Style',
            hasSvgs: true,
        },
        {
            key: 'smileLine.size',
            text: 'Smile Line Size',
            valuesToRender: generateRangeFromSlots(0.25, 2.25, 10),
        },
        {
            key: 'miscLine.id',
            text: 'Misc Line Style',
            hasSvgs: true,
        },
        {
            key: 'lineOpacity',
            text: 'Line Opacity',
            valuesToRender: generateRangeFromSlots(0, 0.75, 20),
        },
    ],
    Jersey: [
        {
            key: 'jersey.id',
            text: 'Jersey Style',
            hasSvgs: true,
        },
        {
            key: 'teamColors',
            text: 'Team Colors',
        },
    ],
}

const createFaceSlace: StateCreator<
    CombinedState,
    [],
    [],
    FaceState
> = (set: any) => ({
    faceConfig: generate(),
    setFaceStore: (newFace: FaceConfig) => set((state: CombinedState) => {
        console.log('Set new face!!!', { state, newFace })
        return { ...state, faceConfig: { ...state.faceConfig, ...newFace } }
    }),
})

const createToolbarSlice: StateCreator<
    CombinedState,
    [],
    [],
    ToolbarState
> = (set: any) => ({
    toolbarConfig: toolbarItemConfig,
    setSelectedItem: (itemKey: string) => {
        set((state: CombinedState) => {
            let newConfig = { ...state.toolbarConfig }
            for (const [section, items] of Object.entries(newConfig)) {
                for (const itemConfig of items) {
                    if (newConfig && newConfig[section]) {
                        if (itemConfig.key === itemKey) {
                            itemConfig.isSelected = true
                        } else {
                            itemConfig.isSelected = false
                        }
                    }
                }
            }
            return { toolbarConfig: newConfig }
        })
    },
    getSelectedItem: () => {
        for (const [_, items] of Object.entries(toolbarItemConfig)) {
            for (const itemConfig of items) {
                if (itemConfig.isSelected) {
                    return itemConfig
                }
            }
        }
        return null;
    },
    isSelectedItem: (item: string) => {
        for (const [_, items] of Object.entries(toolbarItemConfig)) {
            for (const [key, value] of Object.entries(items)) {
                if (key === item && value.isSelected) {
                    return true
                }
            }
        }
        return false
    }
})

export const useStateStore = create<CombinedState>()((...a: [any, any, any]) => ({
    ...createFaceSlace(...a),
    ...createToolbarSlice(...a),
}))
