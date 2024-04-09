import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Face } from "./Face";
import { svgsIndex } from "../src/svgs-index";
import override from "../src/override";
import { CombinedState, FaceConfig, Overrides, ToolbarItemConfig } from "../src/types";
import { useStateStore } from "./stateStore";
import { Shuffle, ArrowSquareOut, ClipboardText, DownloadSimple, UploadSimple, LinkSimple, House, List } from "@phosphor-icons/react";
import { get_from_dict, roundTwoDecimals, set_to_dict, deepCopy, concatClassNames, doesStrLookLikeColor, luma, isValidJSON, encodeJSONForUrl, decodeFromUrlToJSON, objStringifyInOrder } from "../src/utils";
import { generate } from "../src/generate";
import { Canvg } from 'canvg';
import { faceToSvgString } from "../src/faceToSvgString";

import {
    ToastContainer, useToast
} from '@rewind-ui/core';

import { Select, SelectItem, Input, Slider, Textarea, Switch, Tooltip, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";

type OverrideListItem = { override: Overrides, display: JSX.Element | string };
type OverrideList = OverrideListItem[];

const MainFaceDisplay = (): JSX.Element => {
    let { faceConfig } = useStateStore()

    return (
        <div className='flex justify-center md:w-5/12 w-full'>
            <div className="p-8 border-5 border-black rounded-md">
                <Face faceConfig={faceConfig} maxWidth={400} />
            </div>
        </div>
    );
}


const getOverrideListForItem = (item: ToolbarItemConfig | null): OverrideList => {

    if (!item) return [];

    let overrideList: OverrideList = [];

    if (item.selectionType === 'svgs') {
        if (item.key.includes('id')) {
            let featureName = item.key.split('.')[0] as string;
            let svgNames: any[] = get_from_dict(svgsIndex, featureName)

            svgNames = svgNames.sort((a, b) => {
                if (a === "none" || a === "bald") return -1;
                if (b === "none" || b === "bald") return 1;

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
                overrideList.push({ override: overrides, display: svgNames[i] })
            }
        }
    }
    else if (item.renderOptions?.valuesToRender) {
        for (let i = 0; i < item.renderOptions.valuesToRender.length; i++) {
            let valueToRender = item.renderOptions.valuesToRender[i];
            let overrides: Overrides = set_to_dict({}, item.key, valueToRender) as Overrides;
            overrideList.push({
                override: overrides, display: valueToRender
            })
        }
    }

    return overrideList
}


const FeatureSelector = ({ selectedItem, overrideList, stateStoreProps, setCurrentIndexObj }: { selectedItem?: ToolbarItemConfig | null, overrideList: OverrideList, stateStoreProps: CombinedState, setCurrentIndexObj: any }) => {
    let { faceConfig, setFaceStore, getSelectedItem } = stateStoreProps;
    selectedItem = selectedItem || getSelectedItem();

    if (!selectedItem) {
        return <div>Select a feature</div>;
    }

    const selectedVal = get_from_dict(faceConfig, selectedItem?.key || '');

    if (selectedItem.selectionType === 'svgs') {
        return (
            <Select
                label={selectedItem.text}
                className="max-w-xs"
                // value={currentIndexObj.index}
                selectedKeys={[selectedVal]}
                onChange={(e) => {
                    let chosenValue = e.target.value;

                    let overrideChosenIndex: number = overrideList.findIndex((overrideListItem: OverrideListItem) => get_from_dict(overrideListItem.override, selectedItem?.key || '') === chosenValue);

                    let faceConfigCopy: FaceConfig = deepCopy(faceConfig);
                    let newOverride: Overrides = set_to_dict({}, selectedItem?.key || '', chosenValue) as Overrides;
                    override(faceConfigCopy, newOverride);

                    setFaceStore(faceConfigCopy);
                    setCurrentIndexObj({ index: overrideChosenIndex, feature_name: selectedItem?.key || '' });
                }}
            >
                {overrideList.map((overrideToRun) => {
                    return (
                        <SelectItem key={overrideToRun.display as string} value={overrideToRun.display as string}>
                            {overrideToRun.display}
                        </SelectItem>
                    );
                })}
            </Select>
        )
    }

    else if (selectedItem.selectionType === 'range') {

        const handleChange = (val: number) => {
            let chosenValue = roundTwoDecimals(val);
            let overrideChosenIndex: number = overrideList.findIndex((overrideListItem: OverrideListItem) => get_from_dict(overrideListItem.override, selectedItem?.key || '') === chosenValue);
            if (!chosenValue) return;
            let faceConfigCopy: FaceConfig = deepCopy(faceConfig);
            let newOverride: Overrides = set_to_dict({}, selectedItem?.key || '', chosenValue) as Overrides;
            override(faceConfigCopy, newOverride);
            setFaceStore(faceConfigCopy);
            setCurrentIndexObj({ index: overrideChosenIndex, feature_name: selectedItem?.key || '' });
        }

        return (
            <Slider
                label={selectedItem.text}
                step={selectedItem?.renderOptions?.rangeConfig?.sliderStep || 0.01}
                maxValue={selectedItem?.renderOptions?.rangeConfig?.max}
                minValue={selectedItem?.renderOptions?.rangeConfig?.min}
                defaultValue={0.4}
                value={selectedVal || 0}
                className="max-w-md"
                onChange={(e) => {
                    handleChange(e as number)
                }}
            >
            </Slider>
        )
    }
    else if (selectedItem.selectionType == 'boolean') {

        return (
            <Switch
                isSelected={selectedVal || false}
                onValueChange={(e: boolean) => {
                    let chosenValue = e || false;
                    let overrideChosenIndex: number = overrideList.findIndex((overrideListItem: OverrideListItem) => get_from_dict(overrideListItem.override, selectedItem?.key || '') === chosenValue);
                    let faceConfigCopy: FaceConfig = deepCopy(faceConfig);
                    let newOverride: Overrides = set_to_dict({}, selectedItem?.key || '', chosenValue) as Overrides;

                    override(faceConfigCopy, newOverride);
                    setFaceStore(faceConfigCopy);
                    setCurrentIndexObj({ index: overrideChosenIndex, feature_name: selectedItem?.key || '' });
                }}
            />
        )
    }
    else if (selectedItem.selectionType == 'color') {

        let numColors = selectedItem?.renderOptions?.colorCount || 1;
        let initialValidArr: (undefined | 'invalid' | 'valid')[] = Array.from({ length: numColors }).map(() => 'valid');
        const [inputValidationArr, setInputValidationArr] = useState<(undefined | 'invalid' | 'valid')[]>(initialValidArr);

        const updateValidationAtIndex = (indexToUpdate: number, newValue: 'invalid' | 'valid' | undefined) => {
            const newArr = [...inputValidationArr]; // Copy the array
            newArr[indexToUpdate] = newValue; // Update the specific element
            setInputValidationArr(newArr); // Set the new array as the state
        };

        return (
            <div className="flex flex-col gap-2">
                {selectedItem && Array.from({ length: numColors }).map((_, index) => {

                    let hasMultipleColors = numColors > 1;
                    let selectedColor = (hasMultipleColors ? selectedVal[index] : selectedVal) || "#000000"

                    return (
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={selectedColor}
                                label={`${selectedItem?.text} Picker`}
                                onChange={(e) => {
                                    let chosenValue = e.target.value || '#000000';
                                    let overrideChosenIndex: number = overrideList.findIndex((overrideListItem: OverrideListItem) => get_from_dict(overrideListItem.override, selectedItem?.key || '') === chosenValue);
                                    let faceConfigCopy: FaceConfig = deepCopy(faceConfig);

                                    let colorToOverride = get_from_dict(faceConfigCopy, selectedItem?.key || '');
                                    if (hasMultipleColors) {
                                        colorToOverride[index] = chosenValue;
                                    }
                                    else {
                                        colorToOverride = chosenValue;
                                    }
                                    let newOverride: Overrides = set_to_dict({}, selectedItem?.key || '', colorToOverride) as Overrides;

                                    override(faceConfigCopy, newOverride);
                                    setFaceStore(faceConfigCopy);
                                    setCurrentIndexObj({ index: overrideChosenIndex, feature_name: selectedItem?.key || '' });
                                }} />
                            <Input
                                value={selectedColor}
                                isInvalid={inputValidationArr[index] === 'invalid'}
                                errorMessage={inputValidationArr[index] === 'invalid' ? "Color format must be #RRGGBB" : null}
                                label={`${selectedItem?.text} Hex Code`}
                                onChange={(e) => {

                                    let chosenValue = e.target.value;

                                    updateValidationAtIndex(index, doesStrLookLikeColor(chosenValue) ? 'valid' : 'invalid');

                                    let overrideChosenIndex: number = overrideList.findIndex((overrideListItem: OverrideListItem) => get_from_dict(overrideListItem.override, selectedItem?.key || '') === chosenValue);
                                    let faceConfigCopy: FaceConfig = deepCopy(faceConfig);

                                    let colorToOverride = get_from_dict(faceConfigCopy, selectedItem?.key || '');
                                    if (hasMultipleColors) {
                                        colorToOverride[index] = chosenValue;
                                    }
                                    else {
                                        colorToOverride = chosenValue;
                                    }
                                    let newOverride: Overrides = set_to_dict({}, selectedItem?.key || '', colorToOverride) as Overrides;

                                    override(faceConfigCopy, newOverride);
                                    setFaceStore(faceConfigCopy);
                                    setCurrentIndexObj({ index: overrideChosenIndex, feature_name: selectedItem?.key || '' });

                                }} />
                        </div>
                    )
                })
                }

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

    return (
        <div className='md:w-1/2 w-full h-1/2 md:h-screen flex flex-col overflow-y-scroll pb-20 pr-3'>
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

                            <div className="w-1/2 my-2 text-end" >
                                <FeatureSelector selectedItem={toolbarItem} overrideList={overrideList} stateStoreProps={stateStoreProps} setCurrentIndexObj={setCurrentIndexObj} />
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
                                    <Face faceConfig={faceConfigCopy} maxWidth={75} />
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
    }, [currentIndexObj, selectedItem, faceConfig]);

    if (!selectedItem) {
        return <div>Select a feature</div>;
    }

    return (
        <div className='md:w-1/2 h-1/2 md:h-screen overflow-y-scroll w-full flex flex-col'>
            <div className="my-4 mx-1 flex justify-between items-center">
                <span>Choose {selectedItem.text}</span>

                <div className="w-1/2 text-end">
                    <FeatureSelector overrideList={overrideList} stateStoreProps={stateStoreProps} setCurrentIndexObj={setCurrentIndexObj} />
                </div>
            </div>
            <div className={`grid grid-cols-${num_columns} gap-2`}>
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
                            <Face faceConfig={faceConfigCopy} maxWidth={150} />
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
}

const ToolbarItemSectionHead = ({ text }: { text: string }): JSX.Element => {
    let { setSelectedFeatureSection, setSelectedItem, selectedFeatureSection, getSelectedItem } = useStateStore();

    let selectedItem = getSelectedItem();
    let isSelected = text === selectedFeatureSection && !selectedItem;

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
        <div className='w-2/12 h-screen flex justify-start flex-col overflow-scroll'>

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
        console.log('Face Config copied to clipboard');
    } catch (err) {
        console.error('Failed to copyFaceConfigToClipboard: ', err);
    }
};

const copyEditorURLToClipboard = async () => {
    try {
        const editorURL = window.location.href;
        await navigator.clipboard.writeText(editorURL);
        doToast('Editor URL copied to clipboard')
    } catch (err) {
        console.error('Failed to copyEditorURLToClipboard: ', err);
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
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [textAreaValue, setTextAreaValue] = useState('');
    const [textAreaValid, setTextAreaValid] = useState(false);
    const textRef = useRef<HTMLTextAreaElement>(null);
    const navigate = useNavigate();

    let { param } = useParams();

    useEffect(() => {
        if (param) {
            const decodedFaceConfig = decodeFromUrlToJSON(param) as FaceConfig;
            if (objStringifyInOrder(decodedFaceConfig) !== objStringifyInOrder(faceConfig)) {
                try {
                    setFaceStore(decodedFaceConfig);
                } catch (error) {
                    console.error('Error parsing JSON from URL param:', error);
                }
            }

        }
    }, [param, setFaceStore]);

    useEffect(() => {
        if (faceConfig) {
            const urlEncodeString = encodeJSONForUrl(faceConfig);
            navigate(`/editor/${urlEncodeString}`, { replace: true });
        }
    }, [faceConfig, navigate]);

    let errorMessage = (
        <>
            <span>Invalid JSON. Refer to the </span>
            <Link className="font-bold underline" to='https://www.json.org/json-en.html'>JSON spec</Link>
        </>
    )


    return (
        <>
            <div className="bg-slate-800 text-white flex justify-between w-full">
                <div className="flex text-xl p-2 justify-around w-2/12 items-center" >
                    <span
                        className="cursor-pointer rounded-full p-1 m-0.5 hover:bg-slate-50 hover:text-slate-900"
                    >
                        <House
                            weight='fill'
                            size={24}
                            onClick={() => navigate('/')}
                        />
                    </span>
                    <span className="invisible md:visible">faces.js Editor</span>
                    <span
                        className="
                            hover:bg-slate-50 
                            hover:text-slate-900
                            cursor-pointer
                            rounded-full 
                            p-1
                            m-0.5"
                        onClick={() => setFaceStore(generate())}
                    >
                        <Shuffle size={24} />
                    </span>
                    <span
                        className="
                            hover:bg-slate-50 
                            hover:text-slate-900
                            md:hidden
                            cursor-pointer
                            rounded-full 
                            p-1
                            m-0.5"
                    >
                        <List size={24} className="md:hidden" />
                    </span>
                </div>
                <div className="flex justify-between gap-4 items-center mr-12">
                    <span
                        className="hover:bg-slate-50 hover:text-slate-900 cursor-pointer rounded-full p-1 m-0.5"
                        onClick={async () => { await copyEditorURLToClipboard() }}
                    >
                        <Tooltip
                            content={"Copy link to this faces.js configuration"}
                            placement="bottom"
                            showArrow={true}
                        >
                            <LinkSimple
                                size={24}
                            />
                        </Tooltip>
                    </span>
                    <span
                        className="hover:bg-slate-50 hover:text-slate-900 cursor-pointer rounded-full p-1 m-0.5"
                        onClick={async () => { await copyFaceConfigToClipboard(faceConfig) }}
                    >
                        <Tooltip
                            content={"Copy JSON configuration to clipboard"}
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
                        onClick={onOpen}
                    >
                        <Tooltip
                            content={"Paste JSON to draw face"}
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
                            content={"Download face as PNG image"}
                            placement="bottom"
                        >
                            <DownloadSimple
                                size={24}
                            />
                        </Tooltip>
                    </span>
                </div>
            </div>
            <div className="  font-bold w-screen flex  items-start ">
                <EditorPageToolbar />
                <div className="flex flex-col-reverse md:flex-row items-center justify-around w-5/6">
                    <EditorPageGallery />
                    <MainFaceDisplay />
                </div>
            </div>
            <Modal
                className="w-1/2"
                shadow="md"
                size="xl"
                isOpen={isOpen}
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                    {(_) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Paste JSON to Render Face</ModalHeader>
                            <ModalBody>
                                <Textarea
                                    value={textAreaValue}
                                    isInvalid={!textAreaValid}
                                    ref={textRef}
                                    // errorMessage={!textAreaValid ? ("Invalid JSON. Refer to the <a src='https://www.json.org/json-en.html'>JSON spec</a>") : null}
                                    errorMessage={!textAreaValid ? errorMessage : null}
                                    onValueChange={(e) => setTextAreaValue(e)}
                                    placeholder='Input Face JSON'
                                    size='lg'
                                    className="my-6 min-h-90"
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    onClick={() => {
                                        let isValid = isValidJSON(textAreaValue);
                                        setTextAreaValid(isValid);

                                        if (!isValid) {
                                            doToast('Invalid JSON');
                                        }
                                    }}
                                    size="md"
                                >
                                    Validate
                                </Button>
                                <Button
                                    onClick={() => {
                                        let isValid = isValidJSON(textAreaValue);
                                        setTextAreaValid(isValid);

                                        if (!isValid) {
                                            doToast('Invalid JSON');
                                        }
                                        else {
                                            let faceConfigCopy: FaceConfig = JSON.parse(textAreaValue);
                                            setFaceStore(faceConfigCopy);
                                            onOpenChange();
                                        }
                                    }}
                                    size="md"
                                >
                                    Draw
                                </Button>
                                <Button
                                    onClick={onOpenChange}
                                    size="md"
                                >
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};
