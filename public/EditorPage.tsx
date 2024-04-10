import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Face } from "./Face";
import { svgsIndex } from "../src/svgs-index";
import override from "../src/override";
import {
  CombinedState,
  FaceConfig,
  Overrides,
  GallerySectionConfig,
} from "../src/types";
import { useStateStore } from "./stateStore";
import {
  Shuffle,
  DownloadSimple,
  UploadSimple,
  LinkSimple,
  House,
  CaretDown,
  LockSimpleOpen,
  LockSimple,
  List,
  Rows,
  Square,
} from "@phosphor-icons/react";
import {
  getFromDict,
  roundTwoDecimals,
  setToDict,
  deepCopy,
  concatClassNames,
  doesStrLookLikeColor,
  luma,
  isValidJSON,
  encodeJSONForUrl,
  decodeFromUrlToJSON,
  objStringifyInOrder,
  deleteFromDict,
} from "./utils";
import { Canvg } from "canvg";
import { faceToSvgString } from "../src/faceToSvgString";

import { ToastContainer, useToast } from "@rewind-ui/core";

import {
  Select,
  SelectItem,
  Input,
  Slider,
  Textarea,
  Switch,
  Tooltip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  ButtonGroup,
  Dropdown,
  DropdownMenu,
  DropdownTrigger,
  DropdownItem,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { generate } from "../src/generate";

type OverrideListItem = {
  override: Overrides;
  display: JSX.Element | string;
  value: string | number | boolean;
};
type OverrideList = OverrideListItem[];

export const EditorPage = (): JSX.Element => {
  let { setFaceStore, faceConfig } = useStateStore();
  const navigate = useNavigate();
  const modalDisclosure = useDisclosure();

  let { param } = useParams();

  useEffect(() => {
    if (param) {
      const decodedFaceConfig = decodeFromUrlToJSON(param) as FaceConfig;
      if (
        objStringifyInOrder(decodedFaceConfig) !==
        objStringifyInOrder(faceConfig)
      ) {
        try {
          setFaceStore(decodedFaceConfig);
        } catch (error) {
          console.error("Error parsing JSON from URL param:", error);
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

  return (
    <>
      <EditorPageTopBar />
      <div className="w-screen flex flex-col-reverse md:flex-row items-center justify-around">
        <EditorPageGallery />
        <MainFaceDisplay modalDisclosure={modalDisclosure} />
      </div>
      <EditJSONModal modalDisclosure={modalDisclosure} />
      <ToastContainer position="bottom-right" max={3} />
    </>
  );
};

const MainFaceDisplayActionBar = ({
  modalDisclosure,
}: {
  modalDisclosure: any;
}) => {
  let { faceConfig } = useStateStore();

  const { onOpen } = modalDisclosure;

  const dropdownConfig = [
    {
      groupName: "Copy",
      groupIcon: LinkSimple,
      baseAction: async () => {
        await copyStringToClipboard(
          window.location.href,
          "Copied link to clipboard",
        );
      },
      items: [
        {
          key: "link",
          text: "Copy Link",
          description: "Copy link to FacesJS Editor to Clipboard",
          action: async () => {
            await copyStringToClipboard(
              window.location.href,
              "Copied link to clipboard",
            );
          },
        },
        {
          key: "json",
          text: "Copy JSON",
          description: "Copy Face JSON to Clipboard",
          action: async () => {
            await copyStringToClipboard(
              JSON.stringify(faceConfig),
              "Copied face config to clipboard",
            );
          },
        },
      ],
    },
    {
      groupName: "Download",
      groupIcon: DownloadSimple,
      baseAction: async () => {
        await DownloadFaceAsPng(faceConfig);
      },
      items: [
        {
          key: "png",
          text: "Download PNG",
          description: "Download face as PNG image",
          action: async () => {
            await DownloadFaceAsPng(faceConfig);
          },
        },
        {
          key: "svg",
          text: "Download SVG",
          description: "Download face as SVG",
          action: async () => {
            await DownloadFaceAsSvg(faceConfig);
          },
        },
        {
          key: "json",
          text: "Download JSON",
          description: "Download face as JSON",
          action: async () => {
            await DownloadFaceAsJSON(faceConfig);
          },
        },
      ],
    },
    {
      groupName: "Upload",
      groupIcon: UploadSimple,
      baseAction: (e: any) => {
        onOpen(e);
      },
    },
  ];

  return (
    <div className="flex border-t-5 border-slate-800 justify-between gap-4 items-center mr-12 bg-slate-800 text-white w-full">
      {dropdownConfig.map((group) => {
        if (!group.items) {
          return (
            <Button
              onPress={group.baseAction}
              className="bg-slate-800 text-white border-2 border-white"
            >
              {group.groupName}
            </Button>
          );
        }

        return (
          <ButtonGroup>
            <Button
              onClick={group.baseAction}
              className="bg-slate-800 text-white border-2 border-white"
            >
              {group.groupName}
            </Button>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  className="bg-slate-800 text-white border-t-2 border-r-2 border-b-2 border-white"
                >
                  <CaretDown size={32} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Merge options"
                // onSelectionChange={setSelectedOption}
                className="max-w-[300px]"
              >
                {group.items.map((item) => (
                  <DropdownItem
                    key={item.key}
                    description={item.description}
                    onClick={item.action}
                  >
                    {item.text}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </ButtonGroup>
        );
      })}
    </div>
  );
};

const MainFaceDisplay = ({
  modalDisclosure,
}: {
  modalDisclosure: any;
}): JSX.Element => {
  let { faceConfig } = useStateStore();

  return (
    <div className="flex justify-center md:w-1/3">
      <div className=" border-5 border-slate-800 rounded-md">
        <div className="p-8">
          <Face faceConfig={faceConfig} maxWidth={400} />
        </div>
        <MainFaceDisplayActionBar modalDisclosure={modalDisclosure} />
      </div>
    </div>
  );
};

const getOverrideListForItem = (
  gallerySectionConfig: GallerySectionConfig | null,
): OverrideList => {
  if (!gallerySectionConfig) return [];

  let overrideList: OverrideList = [];

  if (gallerySectionConfig.selectionType === "svgs") {
    if (gallerySectionConfig.key.includes("id")) {
      let featureName = gallerySectionConfig.key.split(".")[0] as string;
      let svgNames: any[] = getFromDict(svgsIndex, featureName);

      svgNames = svgNames.sort((a, b) => {
        if (a === "none" || a === "bald") return -1;
        if (b === "none" || b === "bald") return 1;

        if (doesStrLookLikeColor(a) && doesStrLookLikeColor(b)) {
          return luma(a) - luma(b);
        }

        let regex = /^([a-zA-Z-]+)(\d*)$/;
        let matchA = a.match(regex);
        let matchB = b.match(regex);

        let textA = matchA ? matchA[1] : a,
          numA = matchA ? matchA[2] : "";
        let textB = matchB ? matchB[1] : b,
          numB = matchB ? matchB[2] : "";

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
        overrideList.push({
          override: overrides,
          display: svgNames[i],
          value: svgNames[i],
        });
      }
    }
  } else if (gallerySectionConfig.renderOptions?.valuesToRender) {
    for (
      let i = 0;
      i < gallerySectionConfig.renderOptions.valuesToRender.length;
      i++
    ) {
      let valueToRender = gallerySectionConfig.renderOptions.valuesToRender[i];
      let overrides: Overrides = setToDict(
        {},
        gallerySectionConfig.key,
        valueToRender,
      ) as Overrides;
      overrideList.push({
        override: overrides,
        display: valueToRender,
        value: valueToRender,
      });
    }
  }

  return overrideList;
};

const newFaceConfigFromOverride = (
  faceConfig: FaceConfig,
  gallerySectionConfig: GallerySectionConfig,
  chosenValue: any,
): FaceConfig => {
  let faceConfigCopy: FaceConfig = deepCopy(faceConfig);
  let newOverride: Overrides = setToDict(
    {},
    gallerySectionConfig?.key || "",
    chosenValue,
  ) as Overrides;
  override(faceConfigCopy, newOverride);
  return faceConfigCopy;
};

const FeatureSelector = ({
  gallerySectionConfig,
  overrideList,
  stateStoreProps,
  sectionIndex,
}: {
  gallerySectionConfig?: GallerySectionConfig | null;
  overrideList: OverrideList;
  stateStoreProps: CombinedState;
  sectionIndex: number;
}) => {
  let { faceConfig } = stateStoreProps;

  if (!gallerySectionConfig) {
    return <div>Select a feature</div>;
  }

  const selectedVal: string | number | boolean = getFromDict(
    faceConfig,
    gallerySectionConfig?.key || "",
  );

  if (gallerySectionConfig.selectionType === "svgs") {
    return (
      <Select
        label={gallerySectionConfig.text}
        className="max-w-xs"
        // @ts-ignore Annoying type issue
        selectedKeys={[gallerySectionConfig.selectedValue]}
        onChange={(e) => {
          let chosenValue = e.target.value;

          let overrideChosenIndex: number = overrideList.findIndex(
            (overrideListItem: OverrideListItem) =>
              getFromDict(
                overrideListItem.override,
                gallerySectionConfig?.key || "",
              ) === chosenValue,
          );

          let faceConfigCopy = newFaceConfigFromOverride(
            faceConfig,
            gallerySectionConfig,
            chosenValue,
          );
          updateStores({
            faceConfig: faceConfigCopy,
            faceIndex: overrideChosenIndex,
            sectionIndex,
            stateStoreProps,
          });
        }}
      >
        {overrideList.map((overrideToRun) => {
          return (
            <SelectItem
              key={overrideToRun.display as string}
              value={overrideToRun.display as string}
            >
              {overrideToRun.display}
            </SelectItem>
          );
        })}
      </Select>
    );
  } else if (gallerySectionConfig.selectionType === "range") {
    const handleChange = (val: number) => {
      let chosenValue = roundTwoDecimals(val);
      let overrideChosenIndex: number = overrideList.findIndex(
        (overrideListItem: OverrideListItem) =>
          getFromDict(
            overrideListItem.override,
            gallerySectionConfig?.key || "",
          ) === chosenValue,
      );
      if (!chosenValue) return;

      let faceConfigCopy = newFaceConfigFromOverride(
        faceConfig,
        gallerySectionConfig,
        chosenValue,
      );
      updateStores({
        faceConfig: faceConfigCopy,
        faceIndex: overrideChosenIndex,
        sectionIndex,
        stateStoreProps,
      });
    };

    return (
      <Slider
        label={gallerySectionConfig.text}
        step={
          gallerySectionConfig?.renderOptions?.rangeConfig?.sliderStep || 0.01
        }
        maxValue={gallerySectionConfig?.renderOptions?.rangeConfig?.max}
        minValue={gallerySectionConfig?.renderOptions?.rangeConfig?.min}
        defaultValue={0.4}
        value={(selectedVal as number) || 0}
        className="max-w-md"
        onChange={(e) => {
          handleChange(e as number);
        }}
      ></Slider>
    );
  } else if (gallerySectionConfig.selectionType == "boolean") {
    return (
      <Switch
        isSelected={(selectedVal as boolean) || false}
        onValueChange={(e: boolean) => {
          let chosenValue = e || false;
          let overrideChosenIndex: number = overrideList.findIndex(
            (overrideListItem: OverrideListItem) =>
              getFromDict(
                overrideListItem.override,
                gallerySectionConfig?.key || "",
              ) === chosenValue,
          );

          let faceConfigCopy = newFaceConfigFromOverride(
            faceConfig,
            gallerySectionConfig,
            chosenValue,
          );
          updateStores({
            faceConfig: faceConfigCopy,
            faceIndex: overrideChosenIndex,
            sectionIndex,
            stateStoreProps,
          });
        }}
      />
    );
  } else if (gallerySectionConfig.selectionType == "color") {
    let numColors = gallerySectionConfig?.renderOptions?.colorCount || 1;
    let initialValidArr: (undefined | "invalid" | "valid")[] = Array.from({
      length: numColors,
    }).map(() => "valid");
    const [inputValidationArr, setInputValidationArr] =
      useState<(undefined | "invalid" | "valid")[]>(initialValidArr);

    const updateValidationAtIndex = (
      indexToUpdate: number,
      newValue: "invalid" | "valid" | undefined,
    ) => {
      const newArr = [...inputValidationArr]; // Copy the array
      newArr[indexToUpdate] = newValue; // Update the specific element
      setInputValidationArr(newArr); // Set the new array as the state
    };

    return (
      <div className="flex flex-col gap-2">
        {gallerySectionConfig &&
          Array.from({ length: numColors }).map((_, index) => {
            let hasMultipleColors = numColors > 1;
            let selectedColor =
              // @ts-ignore TS doesnt like conditional array vs string
              (hasMultipleColors ? selectedVal[index] : selectedVal) ||
              "#000000";

            return (
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={selectedColor}
                  label={`${gallerySectionConfig?.text} Picker`}
                  onValueChange={(e) => {
                    let chosenValue = e || "#000000";
                    let overrideChosenIndex: number = overrideList.findIndex(
                      (overrideListItem: OverrideListItem) =>
                        getFromDict(
                          overrideListItem.override,
                          gallerySectionConfig?.key || "",
                        ) === chosenValue,
                    );
                    let faceConfigCopy: FaceConfig = deepCopy(faceConfig);

                    let colorToOverride = getFromDict(
                      faceConfigCopy,
                      gallerySectionConfig?.key || "",
                    );
                    if (hasMultipleColors) {
                      colorToOverride[index] = chosenValue;
                    } else {
                      colorToOverride = chosenValue;
                    }

                    faceConfigCopy = newFaceConfigFromOverride(
                      faceConfig,
                      gallerySectionConfig,
                      chosenValue,
                    );
                    updateStores({
                      faceConfig: faceConfigCopy,
                      faceIndex: overrideChosenIndex,
                      sectionIndex,
                      stateStoreProps,
                    });
                  }}
                />
                <Input
                  value={selectedColor}
                  isInvalid={inputValidationArr[index] === "invalid"}
                  errorMessage={
                    inputValidationArr[index] === "invalid"
                      ? "Color format must be #RRGGBB"
                      : null
                  }
                  label={`${gallerySectionConfig?.text} Hex`}
                  onChange={(e) => {
                    let chosenValue = e.target.value;

                    updateValidationAtIndex(
                      index,
                      doesStrLookLikeColor(chosenValue) ? "valid" : "invalid",
                    );

                    let overrideChosenIndex: number = overrideList.findIndex(
                      (overrideListItem: OverrideListItem) =>
                        getFromDict(
                          overrideListItem.override,
                          gallerySectionConfig?.key || "",
                        ) === chosenValue,
                    );
                    let faceConfigCopy: FaceConfig = deepCopy(faceConfig);

                    let colorToOverride = getFromDict(
                      faceConfigCopy,
                      gallerySectionConfig?.key || "",
                    );
                    if (hasMultipleColors) {
                      colorToOverride[index] = chosenValue;
                    } else {
                      colorToOverride = chosenValue;
                    }

                    faceConfigCopy = newFaceConfigFromOverride(
                      faceConfig,
                      gallerySectionConfig,
                      chosenValue,
                    );
                    updateStores({
                      faceConfig: faceConfigCopy,
                      faceIndex: overrideChosenIndex,
                      sectionIndex,
                      stateStoreProps,
                    });
                  }}
                />
              </div>
            );
          })}
      </div>
    );
  } else {
    return <> </>;
  }
};

const updateStores = ({
  faceConfig,
  faceIndex,
  sectionIndex,
  stateStoreProps,
}: {
  faceConfig: FaceConfig;
  faceIndex: number;
  sectionIndex: number;
  stateStoreProps: any;
}) => {
  let { setFaceStore, setLastClickedSectionIndex, setLastSelectedFaceIndex } =
    stateStoreProps;
  setFaceStore(faceConfig);
  setLastClickedSectionIndex(sectionIndex);
  setLastSelectedFaceIndex(faceIndex);
};

const EditorPageGallery = (): JSX.Element => {
  let stateStoreProps = useStateStore();

  let {
    faceConfig,
    setFaceStore,
    gallerySize,
    gallerySectionConfigList,
    lastSelectedFaceIndex,
    lastClickedSectionIndex,
    setRandomizeEnabledForSection,
  } = stateStoreProps;

  let lastSelectedSectionConfig =
    gallerySectionConfigList[lastClickedSectionIndex];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!lastSelectedSectionConfig) return;
      if (lastClickedSectionIndex === -1) return;

      let overrideList = getOverrideListForItem(lastSelectedSectionConfig);

      let num_columns = gallerySize == "lg" ? 4 : overrideList.length;

      let nextIndex = lastClickedSectionIndex;
      let listLength = overrideList.length;
      let isLeftBound = lastClickedSectionIndex % num_columns === 0;
      let isRightBound =
        lastClickedSectionIndex % num_columns === num_columns - 1;
      let isTopBound = lastClickedSectionIndex < num_columns;
      let isBottomBound =
        lastClickedSectionIndex >= overrideList.length - num_columns;

      let elementsOnBottomRow = listLength % num_columns;
      let isBottomRow =
        lastClickedSectionIndex > listLength - elementsOnBottomRow;

      switch (event.key) {
        case "ArrowUp":
          if (!isTopBound) nextIndex -= num_columns;
          break;
        case "ArrowDown":
          if (!isBottomBound) nextIndex += num_columns;
          break;
        case "ArrowLeft":
          if (!isLeftBound) nextIndex -= 1;
          if (isLeftBound && !isTopBound) nextIndex -= 1;
          break;
        case "ArrowRight":
          if (!isRightBound) nextIndex += 1;
          else if (isRightBound && !isBottomRow) nextIndex += 1;
          break;
        default:
          return;
      }

      // TODO revisit
      // if (
      //     nextIndex !== lastClickedSectionIndex ||
      //     selectedItem.key !== currentIndexObj.feature_name
      // ) {
      //     event.preventDefault();
      //     setCurrentIndexObj({
      //         index: nextIndex,
      //         feature_name: selectedItem.key || "",
      //     });

      //     let faceConfigCopy = deepCopy(faceConfig);
      //     override(faceConfigCopy, overrideList[nextIndex]?.override);
      //     setFaceStore(faceConfigCopy);
      // }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lastClickedSectionIndex, lastSelectedFaceIndex, faceConfig]);

  return (
    <div className="md:w-1/2 w-full h-1/2 md:h-screen flex flex-col overflow-y-scroll pb-20 pr-3">
      {gallerySectionConfigList &&
        gallerySectionConfigList.map(
          (
            gallerySectionConfig: GallerySectionConfig,
            sectionIndex: number,
          ) => {
            let overrideList = getOverrideListForItem(gallerySectionConfig);

            return (
              <div className="py-6  border-t-2 border-t-slate-500">
                <div className="my-1 mx-1 flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span>Choose {gallerySectionConfig.text}</span>
                    <span
                      onClick={() => {
                        shuffleOptions(
                          gallerySectionConfig,
                          setFaceStore,
                          faceConfig,
                        );
                      }}
                    >
                      <Shuffle
                        size={28}
                        weight="bold"
                        className="cursor-pointer hover:text-white hover:bg-slate-800 rounded-full p-1 active:scale-90 transition-transform ease-in-out"
                      />
                    </span>
                    <Tooltip
                      key={`tooltip-${sectionIndex}`}
                      placement={"right"}
                      content={"Enable to lock section when shuffling Face"}
                    >
                      <span
                        onClick={() => {
                          setRandomizeEnabledForSection(
                            sectionIndex,
                            !gallerySectionConfig.randomizeEnabled,
                          );
                        }}
                      >
                        {gallerySectionConfig.randomizeEnabled ? (
                          <LockSimpleOpen
                            size={28}
                            weight="bold"
                            className="cursor-pointer hover:text-white hover:bg-slate-800 rounded-full p-1 active:scale-80 transition-transform ease-in-out"
                          />
                        ) : (
                          <LockSimple
                            size={28}
                            weight="bold"
                            className="cursor-pointer bg-slate-500 text-white hover:text-white hover:bg-slate-800 rounded-full p-1 active:scale-80 transition-transform ease-in-out"
                          />
                        )}
                      </span>
                    </Tooltip>
                  </div>

                  <div className="w-1/2 my-2 text-end">
                    <FeatureSelector
                      gallerySectionConfig={gallerySectionConfig}
                      overrideList={overrideList}
                      stateStoreProps={stateStoreProps}
                      sectionIndex={sectionIndex}
                    />
                  </div>
                </div>
                {gallerySize != "sm" && (
                  <div
                    className={concatClassNames(
                      "w-full overflow-y-scroll flex justify-start overflow-scroll gap-8",
                      gallerySize == "lg" ? `flex-wrap` : "",
                    )}
                  >
                    {overrideList.map(
                      (overrideToRun: OverrideListItem, faceIndex) => {
                        let faceConfigCopy = deepCopy(faceConfig);
                        override(faceConfigCopy, overrideToRun.override);

                        let isThisItemTheSelectedOne =
                          gallerySectionConfig.selectedValue ==
                          overrideToRun.display;

                        return (
                          <div
                            key={faceIndex}
                            className={` rounded-lg cursor-pointer hover:bg-slate-100 hover:border-slate-500 border-2 border-inherit flex justify-center active:scale-90 transition-transform ease-in-out ${isThisItemTheSelectedOne ? "bg-slate-200 hover:border-slate-500 " : ""}`}
                            onClick={() => {
                              updateStores({
                                faceConfig: faceConfigCopy,
                                faceIndex,
                                sectionIndex,
                                stateStoreProps,
                              });
                            }}
                          >
                            <Face
                              faceConfig={faceConfigCopy}
                              width={
                                gallerySize == "md"
                                  ? 100
                                  : gallerySize == "sm"
                                    ? 50
                                    : 150
                              }
                            />
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
              </div>
            );
          },
        )}
    </div>
  );
};

const doToast = (message: string) => {
  const toast = useToast();

  toast.add({
    id: "face-config-copy-toast",
    closeOnClick: true,
    color: "green",
    description: "",
    duration: 3000,
    iconType: "success",
    pauseOnHover: true,
    radius: "lg",
    shadow: "none",
    shadowColor: "green",
    showProgress: false,
    title: message,
    tone: "solid",
  });
};

const copyStringToClipboard = async (str: string, message: string) => {
  try {
    await navigator.clipboard.writeText(str);
    doToast(message);
  } catch (err) {
    console.error("Failed to copyStringToClipboard: ", err);
  }
};

function getCurrentTimestamp(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hour = now.getHours().toString().padStart(2, "0");
  const minute = now.getMinutes().toString().padStart(2, "0");
  const second = now.getSeconds().toString().padStart(2, "0");

  return `${year}${month}${day}${hour}${minute}${second}`;
}

const shuffleEntireFace = (
  faceConfig: FaceConfig,
  gallerySectionConfigList: GallerySectionConfig[],
  setFaceStore: any,
) => {
  let faceConfigCopy = deepCopy(faceConfig);

  for (let gallerySectionConfig of gallerySectionConfigList) {
    if (gallerySectionConfig.randomizeEnabled) {
      deleteFromDict(faceConfigCopy, gallerySectionConfig.key);
    }
  }

  let newFace = generate(faceConfigCopy);
  setFaceStore(newFace);
};

const shuffleOptions = (
  gallerySectionConfig: GallerySectionConfig,
  setFaceStore: any,
  faceConfig: FaceConfig,
) => {
  let faceConfigCopy = deepCopy(faceConfig);
  faceConfigCopy = deleteFromDict(faceConfigCopy, gallerySectionConfig.key);
  let newFace = generate(faceConfigCopy);
  setFaceStore(newFace);
};

const EditorPageTopBar = () => {
  let {
    setFaceStore,
    faceConfig,
    gallerySize,
    setGallerySize,
    gallerySectionConfigList,
  } = useStateStore();
  const navigate = useNavigate();

  return (
    <div className="bg-slate-800 text-white flex justify-between w-full">
      <div className="flex text-xl p-2 justify-around w-2/12 items-center">
        <span className="cursor-pointer rounded-full p-1 m-0.5 hover:bg-slate-50 hover:text-slate-900">
          <House weight="fill" size={24} onClick={() => navigate("/")} />
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
          onClick={() =>
            shuffleEntireFace(
              faceConfig,
              gallerySectionConfigList,
              setFaceStore,
            )
          }
        >
          <Shuffle size={24} />
        </span>
      </div>
      <div className="flex items-center">
        <Tabs
          aria-label="Options"
          selectedKey={gallerySize}
          // @ts-ignore
          onSelectionChange={setGallerySize}
          className="[data-selected=true]:bg-slate-800 "
          css={{
            "& [data-selected='true']": {
              backgroundColor: "#1e293b",
              color: "white",
            },
          }}
        >
          <Tab key="sm" title={<List size={20} />}></Tab>
          <Tab key="md" title={<Rows size={20} />}></Tab>
          <Tab key="lg" title={<Square size={20} />}></Tab>
        </Tabs>
      </div>
    </div>
  );
};

const EditJSONModal = ({ modalDisclosure }: { modalDisclosure: any }) => {
  let { setFaceStore } = useStateStore();
  const { isOpen, onOpenChange } = modalDisclosure;

  const [textAreaValue, setTextAreaValue] = useState("");
  const [textAreaValid, setTextAreaValid] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  let errorMessage = (
    <>
      <span>Invalid JSON. Refer to the </span>
      <Link
        className="font-bold underline"
        to="https://www.json.org/json-en.html"
      >
        JSON spec
      </Link>
    </>
  );

  return (
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
            <ModalHeader className="flex flex-col gap-1">
              Paste JSON to Render Face
            </ModalHeader>
            <ModalBody>
              <Textarea
                value={textAreaValue}
                isInvalid={!textAreaValid}
                ref={textRef}
                // errorMessage={!textAreaValid ? ("Invalid JSON. Refer to the <a src='https://www.json.org/json-en.html'>JSON spec</a>") : null}
                errorMessage={!textAreaValid ? errorMessage : null}
                onValueChange={(e) => setTextAreaValue(e)}
                placeholder="Input Face JSON"
                size="lg"
                className="my-6 min-h-90"
              />
            </ModalBody>
            <ModalFooter>
              <Button
                onClick={() => {
                  let isValid = isValidJSON(textAreaValue);
                  setTextAreaValid(isValid);

                  if (!isValid) {
                    doToast("Invalid JSON");
                  } else {
                    let faceConfigCopy: FaceConfig = JSON.parse(textAreaValue);
                    setFaceStore(faceConfigCopy);
                    onOpenChange();
                  }
                }}
                size="md"
              >
                Draw
              </Button>
              <Button onClick={onOpenChange} size="md">
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const DownloadFaceAsPng = async (faceConfig: FaceConfig) => {
  const faceSvg = faceToSvgString(faceConfig);

  const downloadPng = async () => {
    const canvas = document.createElement("canvas");
    const ctx: any = canvas.getContext("2d");
    const v = await Canvg.from(ctx, faceSvg);

    v.resize(600, 900, "xMidYMid meet");
    await v.render();

    canvas.toBlob((blob: any) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facesjs_render_${getCurrentTimestamp()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  await downloadPng();
};

const DownloadFaceAsSvg = (faceConfig: FaceConfig) => {
  const faceSvg = faceToSvgString(faceConfig);
  const blob = new Blob([faceSvg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `facesjs_render_${getCurrentTimestamp()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
};

const DownloadFaceAsJSON = (faceConfig: FaceConfig) => {
  const faceConfigString = JSON.stringify(faceConfig, null, 2);
  const blob = new Blob([faceConfigString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `facesjs_render_${getCurrentTimestamp()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
};
