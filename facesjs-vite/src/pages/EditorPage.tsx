import React, { useEffect, useState } from "react";
import { Face } from "../components/Face";
import { svgsIndex } from "../features/face_utils/svgs-index";
import override, { deepCopy } from "../features/face_utils/override";
import { CombinedState, FaceConfig, Overrides, ToolbarItemConfig } from "../features/face_utils/types";
import { useStateStore } from "../store/face_store";
import { Shuffle, ArrowSquareOut, LinkSimple, ClipboardText, DownloadSimple, UploadSimple } from "@phosphor-icons/react";
import { get_from_dict, roundTwoDecimals, set_to_dict } from "../features/face_utils/utils";
import { generate } from "../features/face_utils/generate";
import { Canvg } from 'canvg';
import { faceToSvgString } from "../features/face_utils/faceToSvgString";

import {
    Select, Input, InputGroup, Switch, Tooltip, ToastContainer, useToast
} from '@rewind-ui/core';


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

const luma = (colorHex: string): number => {
    // Extract the hexadecimal RGB components from the color string
    const r = parseInt(colorHex.slice(1, 3), 16) / 255;
    const g = parseInt(colorHex.slice(3, 5), 16) / 255;
    const b = parseInt(colorHex.slice(5, 7), 16) / 255;

    // Apply the luma formula
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const doesStrLookLikeColor = (str: string): boolean => {
    const regex = /^#([0-9A-F]{3}){1,2}$/i;

    return regex.test(str);
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

                if (doesStrLookLikeColor(a) && doesStrLookLikeColor(b)) {
                    return luma(a) - luma(b);
                }

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


const FeatureSelector = ({ selectedItem, overrideList, currentIndexObj, stateStoreProps, setCurrentIndexObj }: { selectedItem: ToolbarItemConfig | null, overrideList: OverrideList, currentIndexObj: { feature_name: string, index: number }, stateStoreProps: CombinedState, setCurrentIndexObj: any }) => {
    let { faceConfig, setFaceStore } = stateStoreProps;

    console.log('FeatureSelector', { selectedItem, overrideList, currentIndexObj, stateStoreProps, setCurrentIndexObj, faceConfig, setFaceStore })
    if (!selectedItem) {
        return <div>Select a feature</div>;
    }

    if (selectedItem.selectionType === 'svgs') {
        return (
            <Select
                value={currentIndexObj.index}
                onChange={(e) => {
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

        const inputTypes: ('number' | 'range')[] = ['range', 'number'];

        return (
            <InputGroup className="flex gap-1">
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
                            let chosenValue = roundTwoDecimals(parseFloat(e.target.value));
                            let overrideChosenIndex: number = overrideList.findIndex((overrideListItem: OverrideListItem) => get_from_dict(overrideListItem.override, selectedItem?.key || '') === chosenValue);
                            if (!chosenValue) return;
                            let faceConfigCopy: FaceConfig = deepCopy(faceConfig);
                            let newOverride: Overrides = set_to_dict({}, selectedItem?.key || '', chosenValue) as Overrides;
                            override(faceConfigCopy, newOverride);
                            setFaceStore(faceConfigCopy);
                            setCurrentIndexObj({ index: overrideChosenIndex, feature_name: selectedItem?.key || '' });
                        }}
                    />
                ))}
            </InputGroup>
        )
    }
    else if (selectedItem.selectionType == 'boolean') {


        return (
            <Switch
                checked={get_from_dict(faceConfig, selectedItem?.key || '') || false}
                radius="full"
                onChange={(e) => {
                    let chosenValue = e?.valueOf() || false;
                    let overrideChosenIndex: number = overrideList.findIndex((overrideListItem: OverrideListItem) => get_from_dict(overrideListItem.override, selectedItem?.key || '') === chosenValue);
                    let faceConfigCopy: FaceConfig = deepCopy(faceConfig);
                    let newOverride: Overrides = set_to_dict({}, selectedItem?.key || '', chosenValue) as Overrides;

                    console.log('FeatureSelectorBoolean', { e, chosenValue, overrideChosenIndex, faceConfigCopy, newOverride })
                    override(faceConfigCopy, newOverride);
                    setFaceStore(faceConfigCopy);
                    setCurrentIndexObj({ index: overrideChosenIndex, feature_name: selectedItem?.key || '' });
                }}
            />
        )
    }
    else if (selectedItem.selectionType == 'color') {

        const [inputValidation, setInputValidation] = useState<undefined | 'invalid' | 'valid'>('valid');

        return (
            <div className="flex gap-2">
                <Input
                    type="color"
                    value={get_from_dict(faceConfig, selectedItem?.key || '') || "#000000"}
                    onChange={(e) => {
                        let chosenValue = e.target.value || '#000000'
                        let overrideChosenIndex: number = overrideList.findIndex((overrideListItem: OverrideListItem) => get_from_dict(overrideListItem.override, selectedItem?.key || '') === chosenValue);
                        let faceConfigCopy: FaceConfig = deepCopy(faceConfig);
                        let newOverride: Overrides = set_to_dict({}, selectedItem?.key || '', chosenValue) as Overrides;

                        console.log('FeatureSelectorBoolean', { e, chosenValue, overrideChosenIndex, faceConfigCopy, newOverride })
                        override(faceConfigCopy, newOverride);
                        setFaceStore(faceConfigCopy);
                        setCurrentIndexObj({ index: overrideChosenIndex, feature_name: selectedItem?.key || '' });
                    }}
                />
                <Tooltip
                    label={"Enter a 6-value hex color code"}
                    placement="right">
                    <Input
                        value={get_from_dict(faceConfig, selectedItem?.key || '') || "#000000"}
                        validation={inputValidation}
                        onChange={(e) => {

                            let chosenValue = e.target.value;

                            setInputValidation(doesStrLookLikeColor(chosenValue) ? 'valid' : 'invalid')

                            let overrideChosenIndex: number = overrideList.findIndex((overrideListItem: OverrideListItem) => get_from_dict(overrideListItem.override, selectedItem?.key || '') === chosenValue);
                            let faceConfigCopy: FaceConfig = deepCopy(faceConfig);
                            let newOverride: Overrides = set_to_dict({}, selectedItem?.key || '', chosenValue) as Overrides;

                            console.log('FeatureSelectorBoolean', { e, chosenValue, overrideChosenIndex, faceConfigCopy, newOverride })
                            override(faceConfigCopy, newOverride);
                            setFaceStore(faceConfigCopy);
                            setCurrentIndexObj({ index: overrideChosenIndex, feature_name: selectedItem?.key || '' });

                        }}
                    />
                </Tooltip>
            </div>
        )
    }
    else {
        return (<>  </>)
    }

}


const EditorFeatureGallery = () => {
    let stateStoreProps = useStateStore();
    let { getSelectedItem, selectedFeatureSection, toolbarConfig, faceConfig, setFaceStore, setSelectedFeatureSection, setSelectedItem } = stateStoreProps;
    let selectedItem = getSelectedItem();

    let toolbarItems: ToolbarItemConfig[] | undefined = toolbarConfig[selectedFeatureSection];

    console.log('EditorFeatureGallery', { toolbarItems, selectedItem })

    return (
        <div className='w-5/12 h-screen flex flex-col overflow-y-scroll pb-20'>
            {toolbarItems && toolbarItems.map((toolbarItem: ToolbarItemConfig) => {
                let overrideList = getOverrideListForItem(toolbarItem);

                let startingIndex = overrideList.findIndex((override) => {
                    if (!toolbarItem) return false;
                    return get_from_dict(faceConfig, toolbarItem.key) === get_from_dict(override.override, toolbarItem.key);
                })
                let [currentIndexObj, setCurrentIndexObj] = useState<{ feature_name: string, index: number }>({ feature_name: toolbarItem?.key || '', index: startingIndex });


                return (
                    <div className="py-6  border-t-2 border-t-slate-500">
                        <div className="my-1 mx-1 flex justify-between items-center">
                            <div className="flex items-center gap-1">
                                <span>Choose {toolbarItem.text}</span>
                                <span onClick={() => {
                                    setSelectedItem(toolbarItem.key);
                                    setSelectedFeatureSection(selectedFeatureSection);
                                }}
                                >
                                    <ArrowSquareOut size={20} weight="bold" className="cursor-pointer" />
                                </span>
                            </div>

                            <div className="w-1/2 my-2">
                                <FeatureSelector selectedItem={toolbarItem} overrideList={overrideList} currentIndexObj={currentIndexObj} stateStoreProps={stateStoreProps} setCurrentIndexObj={setCurrentIndexObj} />
                            </div>
                        </div>
                        <div className="w-full flex overflow-scroll gap-2">
                            {overrideList.map((overrideToRun: OverrideListItem, index) => {
                                let faceConfigCopy = deepCopy(faceConfig);
                                override(faceConfigCopy, overrideToRun.override);

                                let isThisItemTheSelectedOne = currentIndexObj.index === index && currentIndexObj.feature_name === toolbarItem?.key;

                                return <div
                                    key={index}
                                    className={` rounded-lg cursor-pointer hover:bg-slate-100 hover:border-slate-500 border-2 border-inherit flex justify-center pb-2 active:scale-90 transition-transform ease-in-out ${isThisItemTheSelectedOne ? 'bg-slate-200 hover:border-slate-500 ' : ''}`}
                                    onClick={() => {
                                        setFaceStore(faceConfigCopy);
                                        setCurrentIndexObj({ index, feature_name: selectedItem?.key || '' });
                                    }}
                                >
                                    <Face faceConfig={faceConfigCopy} width={75} />
                                </div>
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

const EditorItemGallery = () => {
    let stateStoreProps = useStateStore();
    let { getSelectedItem, faceConfig, setFaceStore } = stateStoreProps;
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
                    <FeatureSelector selectedItem={selectedItem} overrideList={overrideList} currentIndexObj={currentIndexObj} stateStoreProps={stateStoreProps} setCurrentIndexObj={setCurrentIndexObj} />
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
}

const EditorPageGallery = (): JSX.Element => {
    let stateStoreProps = useStateStore();
    let { getSelectedItem } = stateStoreProps;
    let selectedItem = getSelectedItem();

    if (!selectedItem) {
        return (
            <EditorFeatureGallery />
        )
    }
    else {
        return (
            <EditorItemGallery />
        )
    }
};


const shuffleOptions = (toolbarItem: ToolbarItemConfig, setFaceStore: any, faceConfig: FaceConfig) => {
    let overrideList = getOverrideListForItem(toolbarItem);
    let randomIndex = Math.floor(Math.random() * overrideList.length);
    let faceConfigCopy = deepCopy(faceConfig);
    override(faceConfigCopy, overrideList[randomIndex]?.override);
    setFaceStore(faceConfigCopy);

    console.log('ShuffleOptions', { overrideList, randomIndex, faceConfigCopy });
}

const ToolbarItemSectionHead = ({ text }: { text: string }): JSX.Element => {
    let { setSelectedFeatureSection, setSelectedItem, selectedFeatureSection, getSelectedItem } = useStateStore();

    let selectedItem = getSelectedItem();
    let isSelected = text === selectedFeatureSection && !selectedItem;

    console.log('ToolbarItemSectionHead', { text, selectedFeatureSection, isSelected, selectedItem })

    return (
        <div
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
            onClick={() => {
                setSelectedFeatureSection(text);
                setSelectedItem('');
            }}>
            <span>
                {text}
            </span>
        </div>
    )
}


const ToolbarItem = ({ toolbarItem, featureSection }: { toolbarItem: ToolbarItemConfig, featureSection: string }): JSX.Element => {
    let { isSelected, text, key } = toolbarItem;
    let { faceConfig, setFaceStore, setSelectedItem, setSelectedFeatureSection } = useStateStore();

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
            onClick={() => {
                setSelectedItem(key);
                setSelectedFeatureSection(featureSection);
            }}
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
                                    featureSection={section}
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

const doToast = (message: string) => {
    const toast = useToast();

    toast.add({
        id: 'face-config-copy-toast',
        closeOnClick: true,
        color: 'green',
        description: '',
        duration: 3000,
        iconType: 'success',
        pauseOnHover: true,
        radius: 'lg',
        shadow: 'none',
        shadowColor: 'green',
        showProgress: false,
        title: message,
        tone: 'solid',
    });

}

const copyFaceConfigToClipboard = async (faceConfig: FaceConfig) => {

    try {
        // Use the Clipboard API to copy the text
        await navigator.clipboard.writeText(JSON.stringify(faceConfig));
        doToast('Face Config copied to clipboard')
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
};

function getCurrentTimestamp(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    const second = now.getSeconds().toString().padStart(2, '0');

    return `${year}${month}${day}${hour}${minute}${second}`;
}

const DownloadSvgAsPng = async (faceConfig: FaceConfig) => {

    const faceSvg = faceToSvgString(faceConfig)

    const downloadPng = async () => {

        const canvas = document.createElement('canvas');
        const ctx: any = canvas.getContext('2d');
        const v = await Canvg.from(ctx, faceSvg);

        v.resize(600, 900, 'xMidYMid meet');
        await v.render();

        canvas.toBlob((blob: any) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `facesjs_render_${getCurrentTimestamp()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    };

    await downloadPng();

};

export const EditorPage = (): JSX.Element => {
    let { setFaceStore, faceConfig } = useStateStore();


    return (
        <>
            <div className="bg-slate-800 text-white flex justify-between w-full">
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
                <div className="flex justify-between gap-4 items-center mr-12">
                    {/* <span
                        className="hover:bg-slate-50 hover:text-slate-900 cursor-pointer rounded-full p-1 m-0.5"
                    >
                        <Tooltip
                            label={"Copy link to this faces.js configuration"}
                            placement="bottom"
                        >
                            <LinkSimple
                                size={24}
                            />
                        </Tooltip>
                    </span> */}
                    <span
                        className="hover:bg-slate-50 hover:text-slate-900 cursor-pointer rounded-full p-1 m-0.5"
                        onClick={async () => { await copyFaceConfigToClipboard(faceConfig) }}
                    >
                        <Tooltip
                            label={"Copy JSON configuration to clipboard"}
                            placement="bottom"
                        >
                            <ClipboardText
                                size={24}
                            />
                        </Tooltip>
                        <ToastContainer position="bottom-right" />
                    </span>
                    <span
                        className="hover:bg-slate-50 hover:text-slate-900 cursor-pointer rounded-full p-1 m-0.5"
                    >
                        <Tooltip
                            label={"Paste JSON to draw face"}
                            placement="bottom"
                        >
                            <UploadSimple
                                size={24}
                            />
                        </Tooltip>
                    </span>
                    <span
                        className="hover:bg-slate-50 hover:text-slate-900 cursor-pointer rounded-full p-1 m-0.5"
                        onClick={async () => { await DownloadSvgAsPng(faceConfig) }}
                    >
                        <Tooltip
                            label={"Download face as PNG image"}
                            placement="bottom"
                        >
                            <DownloadSimple
                                size={24}
                            />
                        </Tooltip>
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
