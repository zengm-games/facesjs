import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Face } from "./Face";
import override from "../src/override";
import {
  CombinedState,
  FaceConfig,
  GallerySectionConfig,
  OverrideList,
  OverrideListItem,
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
import {
  getFromDict,
  roundTwoDecimals,
  deepCopy,
  concatClassNames,
  doesStrLookLikeColor,
  isValidJSON,
  encodeJSONForUrl,
  decodeFromUrlToJSON,
  objStringifyInOrder,
} from "./utils";

import { ToastContainer, useToast } from "@rewind-ui/core";

import {
  DownloadFaceAsJSON,
  DownloadFaceAsPng,
  DownloadFaceAsSvg,
} from "./downloadFace";
import { shuffleEntireFace, shuffleOptions } from "./shuffleFace";
import {
  getOverrideListForItem,
  newFaceConfigFromOverride,
} from "./overrideList";

export const EditorPage = () => {
  let { setFaceStore, faceConfig } = useStateStore();
  const navigate = useNavigate();
  const modalDisclosure = useDisclosure();

  const location = useLocation();
  const paramHash = location.hash;
  const paramPathname = location.pathname;

  useEffect(() => {
    if (paramHash || paramPathname) {
      const decodedFaceConfig = decodeFromUrlToJSON(
        paramHash,
        paramPathname,
      ) as FaceConfig;
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
  }, [paramHash, paramPathname, setFaceStore]);

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

const inputOnChange = ({
  chosenValue,
  faceConfig,
  overrideList,
  gallerySectionConfig,
  sectionIndex,
  stateStoreProps,
}: {
  chosenValue: any;
  faceConfig: FaceConfig;
  overrideList: OverrideList;
  gallerySectionConfig: GallerySectionConfig;
  sectionIndex: number;
  stateStoreProps: any;
}) => {
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
          inputOnChange({
            chosenValue,
            faceConfig,
            overrideList,
            gallerySectionConfig,
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
          let chosenValue = roundTwoDecimals(e as number);
          inputOnChange({
            chosenValue,
            faceConfig,
            overrideList,
            gallerySectionConfig,
            sectionIndex,
            stateStoreProps,
          });
        }}
      ></Slider>
    );
  } else if (gallerySectionConfig.selectionType == "boolean") {
    return (
      <Switch
        isSelected={(selectedVal as boolean) || false}
        onValueChange={(e: boolean) => {
          let chosenValue = e || false;
          inputOnChange({
            chosenValue,
            faceConfig,
            overrideList,
            gallerySectionConfig,
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

    const colorInputOnChange = ({
      newColorValue,
      hasMultipleColors,
      colorIndex,
    }: {
      newColorValue: string;
      hasMultipleColors: boolean;
      colorIndex: number;
    }) => {
      updateValidationAtIndex(
        colorIndex,
        doesStrLookLikeColor(newColorValue) ? "valid" : "invalid",
      );

      let chosenValue: any = getFromDict(
        faceConfig,
        gallerySectionConfig?.key || "",
      );
      if (hasMultipleColors) {
        chosenValue[colorIndex] = newColorValue;
      } else {
        chosenValue = newColorValue;
      }

      inputOnChange({
        chosenValue,
        faceConfig,
        overrideList,
        gallerySectionConfig,
        sectionIndex,
        stateStoreProps,
      });
    };

    return (
      <div className="flex flex-col gap-2">
        {gallerySectionConfig &&
          Array.from({ length: numColors }).map((_, colorIndex) => {
            let hasMultipleColors = numColors > 1;
            let selectedColor =
              // @ts-ignore TS doesnt like conditional array vs string
              (hasMultipleColors ? selectedVal[colorIndex] : selectedVal) ||
              "#000000";

            return (
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={selectedColor}
                  label={`${gallerySectionConfig?.text} Picker`}
                  onValueChange={(e) => {
                    colorInputOnChange({
                      newColorValue: e || "#000000",
                      hasMultipleColors,
                      colorIndex,
                    });
                  }}
                />
                <Input
                  value={selectedColor}
                  isInvalid={inputValidationArr[colorIndex] === "invalid"}
                  errorMessage={
                    inputValidationArr[colorIndex] === "invalid"
                      ? "Color format must be #RRGGBB"
                      : null
                  }
                  label={`${gallerySectionConfig?.text} Hex`}
                  onChange={(e) => {
                    colorInputOnChange({
                      newColorValue: e.target.value || "#000000",
                      hasMultipleColors,
                      colorIndex,
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

const EditorPageGallery = () => {
  let stateStoreProps = useStateStore();

  let {
    faceConfig,
    setFaceStore,
    gallerySize,
    gallerySectionConfigList,
    setRandomizeEnabledForSection,
  } = stateStoreProps;

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
                              lazyLoad={true}
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
