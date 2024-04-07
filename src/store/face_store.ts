import { create, StateCreator } from 'zustand'
import { CombinedState, FaceConfig, FaceState, ToolbarConfig, ToolbarState } from '../tools/types'
import { generate } from '../tools/generate'
import { generateRangeFromStep } from '../tools/utils'
import { distinctHairColors, distinctSkinColors, jerseyColorOptions } from '../tools/globals'


let toolbarItemConfig: ToolbarConfig = {
    Body: [
        {
            key: 'body.color',
            text: 'Skin Color',
            isSelected: true,
            renderOptions: {
                isColor: true,
                valuesToRender: distinctSkinColors
            }
        },
        {
            key: 'body.size',
            text: 'Body Size',
            renderOptions: {
                rangeConfig: {
                    min: 0.8,
                    max: 1.2,
                    step: 0.1,
                    sliderStep: 0.01,
                }
            }
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
            renderOptions: {
                rangeConfig: {
                    min: 0,
                    max: 1,
                    step: 0.1,
                    sliderStep: 0.02,
                }
            }
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
            renderOptions: {
                rangeConfig: {
                    min: 0.8,
                    max: 1.2,
                    step: 0.1,
                    sliderStep: 0.01,
                }
            },
        },
        {
            key: 'mouth.flip',
            text: 'Mouth Flip',
            renderOptions: {
                isBoolean: true
            }
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
            renderOptions: {
                rangeConfig: {
                    min: -10,
                    max: 15,
                    step: 1,
                    sliderStep: 0.1,
                }
            }
        },
        {
            key: 'eyeDistance',
            text: 'Eye Distance',
            renderOptions: {
                rangeConfig: {
                    min: -4,
                    max: 4,
                    step: 1,
                    sliderStep: 0.1,
                }
            }
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
            renderOptions: {
                rangeConfig: {
                    min: 0.5,
                    max: 1.5,
                    step: 0.1,
                    sliderStep: 0.01,
                }
            }
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
            renderOptions: {
                isColor: true,
                valuesToRender: distinctHairColors
            }
        },
        {
            key: 'hair.flip',
            text: 'Hair Flip',
            renderOptions: {
                isBoolean: true
            }
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
            renderOptions: {
                rangeConfig: {
                    min: 0,
                    max: 1,
                    step: 0.1,
                    sliderStep: 0.01,
                }
            }
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
            renderOptions: {
                rangeConfig: {
                    min: -15,
                    max: 20,
                    step: 1,
                    sliderStep: 0.1,
                }
            }
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
            renderOptions: {
                rangeConfig: {
                    min: 0.5,
                    max: 1.25,
                    step: 0.05,
                    sliderStep: 0.01,
                }
            }
        },
        {
            key: 'nose.flip',
            text: 'Nose Flip',
            renderOptions: {
                isBoolean: true
            }
        },
    ],
    'Face Lines': [
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
            renderOptions: {
                rangeConfig: {
                    min: 0.25,
                    max: 2.25,
                    step: 0.1,
                    sliderStep: 0.01,
                }
            }
        },
        {
            key: 'miscLine.id',
            text: 'Misc Line Style',
            hasSvgs: true,
        },
        {
            key: 'lineOpacity',
            text: 'Line Opacity',
            renderOptions: {
                rangeConfig: {
                    min: 0,
                    max: 0.75,
                    step: 0.05,
                    sliderStep: 0.01,
                }
            }
        },
    ],
    Accessories: [
        {
            key: 'glasses.id',
            text: 'Glasses Style',
            hasSvgs: true,
        },
        {
            key: 'accessories.id',
            text: 'Accessories Style',
            hasSvgs: true,
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
            renderOptions: {
                isColor: true,
                colorCount: 3,
                valuesToRender: jerseyColorOptions
            }
        },
    ],
}

for (const [_, itemList] of Object.entries(toolbarItemConfig)) {
    for (const itemConfig of itemList) {
        if (itemConfig.renderOptions && itemConfig.renderOptions.rangeConfig) {
            const rangeConfig = itemConfig.renderOptions.rangeConfig
            itemConfig.renderOptions.valuesToRender = generateRangeFromStep(rangeConfig.min, rangeConfig.max, rangeConfig.step)
            itemConfig.selectionType = 'range';
        }
        else if (itemConfig.renderOptions && itemConfig.renderOptions.isBoolean) {
            itemConfig.renderOptions.valuesToRender = [false, true]
            itemConfig.selectionType = 'boolean';
        }
        else if (itemConfig.renderOptions && itemConfig.renderOptions.isColor) {
            itemConfig.selectionType = 'color';
        }
        else {
            itemConfig.selectionType = 'svgs';
        }
    }
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
        return { ...state, faceConfig: { ...newFace } }
    }),
})

const createToolbarSlice: StateCreator<
    CombinedState,
    [],
    [],
    ToolbarState
> = (set: any) => ({
    selectedFeatureSection: 'Body',
    toolbarConfig: toolbarItemConfig,
    setSelectedFeatureSection: (section: string) => {
        set((state: CombinedState) => {
            return { selectedFeatureSection: section }
        })
    },
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
    },
})

export const useStateStore = create<CombinedState>()((...a: [any, any, any]) => ({
    ...createFaceSlace(...a),
    ...createToolbarSlice(...a),
}))
