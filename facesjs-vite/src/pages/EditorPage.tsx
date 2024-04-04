import React, { useEffect, useState } from "react";
import { Face } from "../components/Face";
import { svgsIndex } from "../features/face_utils/svgs-index";
import override, { deepCopy } from "../features/face_utils/override";
import { CombinedState, FaceConfig, Overrides, ToolbarItemConfig } from "../features/face_utils/types";
import { useStateStore } from "../store/face_store";
import { Shuffle } from "@phosphor-icons/react";
import { get_from_dict, set_to_dict } from "../features/face_utils/utils";
import { generate } from "../features/face_utils/generate";

import { Select, Input, InputGroup } from '@rewind-ui/core';


type OverrideListItem = { override: Overrides, display: JSX.Element };
type OverrideList = OverrideListItem[];

const concatClassNames = (...classNames: string[]): string => {
    return classNames.join(" ");
}

const MainFaceDisplay = (): JSX.Element => {
    let { faceConfig } = useStateStore()

    return (
        <div className='flex justify-center w-5/12'>
            <Face faceConfig={faceConfig} />
        </div>
    );
}

const EditorPageToolbarAndGallery = (): JSX.Element => {

    return (
        <>
            <EditorPageToolbar />
            <EditorPageGallery />
        </>
    )
}


const getOverrideListForItem = (item: ToolbarItemConfig | null): OverrideList => {

    if (!item) return [];

    console.log('getOverrideListForItem', { item })
    let overrideList: OverrideList = [];

    if (item.selectionType === 'svgs') {
        if (item.key.includes('id')) {
            let featureName = item.key.split('.')[0] as string;
            let svgNames: any[] = get_from_dict(svgsIndex, featureName)

            svgNames = svgNames.sort((a, b) => {
                if (a === "none") return -1;
                if (b === "none") return 1;

                let regex = /^([a-zA-Z-]+)(\d*)$/;
                let matchA = a.match(regex);
                let matchB = b.match(regex);

                let textA = matchA ? matchA[1] : a, numA = matchA ? matchA[2] : "";
                let textB = matchB ? matchB[1] : b, numB = matchB ? matchB[2] : "";

                if (textA < textB) return -1;
                if (textA > textB) return 1;

                if (numA && numB) {
                    return parseInt(numA, 10) - parseInt(numB, 10);
                }

                if (numA) return 1;
                if (numB) return -1;

                return 0;
            });

            for (let i = 0; i < svgNames.length; i++) {
                let overrides: Overrides = { [featureName]: { id: svgNames[i] } };
                overrideList.push({ override: overrides, display: (<span>{item.text}: {svgNames[i]}</span>) })
            }
        }
    }
    else if (item.renderOptions?.valuesToRender) {
        for (let i = 0; i < item.renderOptions.valuesToRender.length; i++) {
            let valueToRender = item.renderOptions.valuesToRender[i];
            let overrides: Overrides = set_to_dict({}, item.key, valueToRender) as Overrides;
            overrideList.push({
                override: overrides, display: (<span>{item.text}: {valueToRender}</span>)
            })
        }
    }

    return overrideList
}


const FeatureSelector = ({ overrideList, currentIndexObj, stateStoreProps, setCurrentIndexObj }: { overrideList: OverrideList, currentIndexObj: { feature_name: string, index: number }, stateStoreProps: CombinedState, setCurrentIndexObj: any }) => {
    let { faceConfig, setFaceStore, getSelectedItem } = stateStoreProps;
    let selectedItem = getSelectedItem();

    if (!selectedItem) {
        return <div>Select a feature</div>;
    }

    console.log('FeatureSelector', { overrideList, currentIndexObj, selectedItem })

    if (selectedItem.selectionType === 'svgs') {
        return (
            <Select
                value={currentIndexObj.index}
                onChange={(e) => {
                    console.log('OnSelectChange', { e, target: e.target, value: e.target.value })
                    let overrideChosen: OverrideListItem | undefined = overrideList[parseInt(e.target.value)];
                    if (!overrideChosen) return;
                    let faceConfigCopy: FaceConfig = deepCopy(faceConfig);
                    override(faceConfigCopy, overrideChosen.override);
                    setFaceStore(faceConfigCopy);
                    setCurrentIndexObj({ index: parseInt(e.target.value), feature_name: selectedItem?.key || '' });
                }}
            >
                {overrideList.map((overrideToRun, index) => {
                    { console.log('EditorPageGalleryOverride', { overrideToRun, index }) }
                    return <option key={index} value={index}>{overrideToRun.display}</option>
                })}
            </Select>
        )
    }

    else if (selectedItem.selectionType === 'range') {

        const inputTypes: ('number' | 'range')[] = ['number', 'range'];

        return (
            <InputGroup className="flex flex-col">
                {inputTypes.map((inputType, _) => (
                    <Input
                        type={inputType}
                        min={selectedItem?.renderOptions?.rangeConfig?.min}
                        max={selectedItem?.renderOptions?.rangeConfig?.max}
                        step={selectedItem?.renderOptions?.rangeConfig?.sliderStep || 0.01}
                        // step={selectedItem.renderOptions?.rangeConfig?.sliderStep}
                        value={get_from_dict(faceConfig, selectedItem?.key || '') || 0}
                        onChangeCapture={(e) => {
                            console.log('onChangeCapture', { e, target: e.target })
                        }}
                        onChange={(e) => {
                            let overrideChosenIndex: number = overrideList.findIndex((overrideListItem: OverrideListItem) => get_from_dict(overrideListItem.override, selectedItem?.key || '') === e.target.value);
                            if (!e.target.value) return;
                            let faceConfigCopy: FaceConfig = deepCopy(faceConfig);
                            let newOverride: Overrides = set_to_dict({}, selectedItem?.key || '', parseFloat(e.target.value)) as Overrides;
                            override(faceConfigCopy, newOverride);
                            setFaceStore(faceConfigCopy);
                            setCurrentIndexObj({ index: overrideChosenIndex, feature_name: selectedItem?.key || '' });
                        }}
                    />
                ))}
            </InputGroup>
        )
    }
    else {
        return (<>  </>)
    }

}


const EditorPageGallery = (): JSX.Element => {
    let stateStoreProps = useStateStore();
    let { faceConfig, setFaceStore, getSelectedItem } = stateStoreProps;
    let selectedItem = getSelectedItem();

    let overrideList = getOverrideListForItem(selectedItem);

    let startingIndex = overrideList.findIndex((override) => {
        if (!selectedItem) return false;
        return get_from_dict(faceConfig, selectedItem.key) === get_from_dict(override.override, selectedItem.key);
    })

    let [currentIndexObj, setCurrentIndexObj] = useState<{ feature_name: string, index: number }>({ feature_name: selectedItem?.key || '', index: startingIndex });
    let num_columns = 4;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!selectedItem) return;
            if (currentIndexObj.index === -1) return;

            let overrideList = getOverrideListForItem(selectedItem);
            let nextIndex = currentIndexObj.index;
            let listLength = overrideList.length;
            let isLeftBound = currentIndexObj.index % num_columns === 0;
            let isRightBound = currentIndexObj.index % num_columns === num_columns - 1;
            let isTopBound = currentIndexObj.index < num_columns;
            let isBottomBound = currentIndexObj.index >= overrideList.length - num_columns;

            let elementsOnBottomRow = listLength % num_columns;
            let isBottomRow = currentIndexObj.index > listLength - elementsOnBottomRow;

            switch (event.key) {
                case 'ArrowUp':
                    if (!isTopBound) nextIndex -= num_columns;
                    break;
                case 'ArrowDown':
                    if (!isBottomBound) nextIndex += num_columns;
                    break;
                case 'ArrowLeft':
                    if (!isLeftBound) nextIndex -= 1;
                    if (isLeftBound && !isTopBound) nextIndex -= 1;
                    break;
                case 'ArrowRight':
                    if (!isRightBound) nextIndex += 1;
                    else if (isRightBound && !isBottomRow) nextIndex += 1;
                    break;
                default:
                    return;
            }

            if (nextIndex !== currentIndexObj.index || selectedItem.key !== currentIndexObj.feature_name) {
                event.preventDefault();
                setCurrentIndexObj({ index: nextIndex, feature_name: selectedItem.key || '' });

                let faceConfigCopy = deepCopy(faceConfig);
                override(faceConfigCopy, overrideList[nextIndex]?.override)
                setFaceStore(faceConfigCopy);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndexObj, selectedItem, setFaceStore]);

    if (!selectedItem) {
        return <div>Select a feature</div>;
    }

    return (
        <div className='w-5/12 h-screen flex flex-col'>
            <div className="my-4 mx-1 flex justify-between items-center">
                <span>Choose {selectedItem.text}</span>

                <div className="w-1/2">
                    <FeatureSelector overrideList={overrideList} currentIndexObj={currentIndexObj} stateStoreProps={stateStoreProps} setCurrentIndexObj={setCurrentIndexObj} />
                </div>
            </div>
            <div className={`grid grid-cols-${num_columns} gap-2  overflow-y-scroll`}>
                {overrideList.map((overrideToRun: OverrideListItem, index) => {
                    let faceConfigCopy = deepCopy(faceConfig);
                    override(faceConfigCopy, overrideToRun.override);
                    let isThisItemTheSelectedOne = currentIndexObj.index === index && currentIndexObj.feature_name === selectedItem?.key;

                    return (
                        <div
                            key={index}
                            className={`rounded-lg cursor-pointer hover:bg-slate-100 hover:border-slate-500 border-2 border-inherit flex justify-center pb-2 active:scale-90 transition-transform ease-in-out ${isThisItemTheSelectedOne ? 'bg-slate-200 hover:border-slate-500 ' : ''}`}
                            onClick={() => {
                                setFaceStore(faceConfigCopy);
                                setCurrentIndexObj({ index, feature_name: selectedItem?.key || '' });
                            }}
                        >
                            <Face faceConfig={faceConfigCopy} width={150} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const ToolbarItemSectionHead = ({ text }: { text: string }): JSX.Element => {
    return (
        <div className="w-11/12  p-2 border-t-slate-500 border-t-2">
            <span>
                {text}
            </span>
        </div>
    )
}


const shuffleOptions = (toolbarItem: ToolbarItemConfig, setFaceStore: any, faceConfig: FaceConfig) => {
    let overrideList = getOverrideListForItem(toolbarItem);
    let randomIndex = Math.floor(Math.random() * overrideList.length);
    let faceConfigCopy = deepCopy(faceConfig);
    override(faceConfigCopy, overrideList[randomIndex]?.override);
    setFaceStore(faceConfigCopy);

    console.log('ShuffleOptions', { overrideList, randomIndex, faceConfigCopy });
}


const ToolbarItem = ({ toolbarItem }: { toolbarItem: ToolbarItemConfig }): JSX.Element => {
    let { isSelected, text, key } = toolbarItem;
    let { faceConfig, setFaceStore, setSelectedItem } = useStateStore();

    let indentStyle = { paddingLeft: `${20}px` };

    return (
        <div
            style={{ ...indentStyle }}
            className={concatClassNames(`
                flex
                justify-between
                p-2
                w-11/12
                hover:bg-slate-200
                active:scale-90
                transition-transform
                ease-in-out
                items-center
                cursor-pointer
                `, isSelected ? 'bg-slate-100' : '')}
            onClick={() => { setSelectedItem(key); }}
        >
            <span>{text}</span>
            <span
                className="
                    hover:bg-slate-50 
                    rounded-full 
                    p-1
                    m-0.5"
                onClick={(event) => {
                    event.stopPropagation();
                    shuffleOptions(toolbarItem, setFaceStore, faceConfig);
                }}
            >
                <Shuffle size={24} />
            </span>
        </div>
    );
};


const EditorPageToolbar = (): JSX.Element => {

    const { toolbarConfig } = useStateStore();


    return (
        <div className='w-2/12 flex flex-col h-screen overflow-scroll'>

            {Object.keys(toolbarConfig).map((section, section_index) => (
                <>
                    <ToolbarItemSectionHead text={section} key={`section-${section_index}`} />


                    {toolbarConfig[section] &&
                        // @ts-ignore
                        toolbarConfig[section].map((toolbarItem: ToolbarItemConfig, item_index: number) => {
                            return (
                                <ToolbarItem
                                    toolbarItem={toolbarItem}
                                    key={`section-${section_index}-${item_index}`}
                                />
                            )

                        })
                    }
                </>
            ))}
        </div>
    )
}

export const EditorPage = (): JSX.Element => {
    let { setFaceStore } = useStateStore();


    return (
        <>
            <div className="bg-slate-800 text-white">
                <div className="flex text-xl p-2 justify-around w-2/12 items-center" >
                    <span>faces.js Editor</span>
                    <span
                        className="
                            hover:bg-slate-50 
                            hover:text-slate-900
                            cursor-pointer
                            rounded-full 
                            p-1
                            m-0.5"
                    >
                        <Shuffle size={24} onClick={() => setFaceStore(generate())} />
                    </span>
                </div>
            </div>
            <div className="  font-bold w-screen h-screen flex  items-center ">
                <EditorPageToolbarAndGallery />
                <MainFaceDisplay />
            </div>
        </>
    );
};
