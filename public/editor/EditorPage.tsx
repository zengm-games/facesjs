import React, { RefObject, useRef, useState } from "react";
import override from "../../src/override";
import { Face as FaceType, Gender, Overrides, Race } from "../../src/types";
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
  Sliders,
  Rows,
  Square,
} from "@phosphor-icons/react";
import {
  Select,
  SelectItem,
  Input,
  CheckboxGroup,
  Checkbox,
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
  Popover,
  PopoverTrigger,
  PopoverContent,
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
  capitalizeFirstLetter,
} from "./utils";

import {
  downloadFaceJson,
  downloadFacePng,
  downloadFaceSvg,
} from "./downloadFace";
import { shuffleEntireFace, shuffleOptions } from "./shuffleFace";
import {
  getOverrideListForItem,
  newFaceConfigFromOverride,
} from "./overrideList";
import { CombinedState, GallerySectionConfig, OverrideList } from "./types";
import { Face } from "./Face";

export const EditorPage = () => {
  const modalDisclosure = useDisclosure();

  return (
    <>
      <EditorPageTopBar />
      <div className="flex flex-col-reverse md:flex-row items-center pt-16">
        <EditorPageGallery />
        <MainFaceDisplay modalDisclosure={modalDisclosure} />
      </div>
      <EditJSONModal modalDisclosure={modalDisclosure} />
    </>
  );
};

const MainFaceDisplayActionBar = ({
  faceRef,
  modalDisclosure,
}: {
  faceRef: RefObject<HTMLDivElement>;
  modalDisclosure: any;
}) => {
  let { faceConfig } = useStateStore();

  const { onOpen } = modalDisclosure;

  const dropdownConfig = [
    {
      groupName: "Copy",
      groupIcon: LinkSimple,
      baseAction: async () => {
        await copyStringToClipboard(window.location.href);
      },
      items: [
        {
          key: "link",
          text: "Copy Link",
          description: "Copy link to FacesJS Editor to Clipboard",
          action: async () => {
            await copyStringToClipboard(window.location.href);
          },
        },
        {
          key: "json",
          text: "Copy JSON",
          description: "Copy Face JSON to Clipboard",
          action: async () => {
            await copyStringToClipboard(JSON.stringify(faceConfig));
          },
        },
      ],
    },
    {
      groupName: "Download",
      groupIcon: DownloadSimple,
      baseAction: async () => {
        if (faceRef.current) {
          await downloadFaceSvg(faceRef.current);
        }
      },
      items: [
        {
          key: "png",
          text: "Download PNG",
          description: "Download face as a PNG file",
          action: async () => {
            if (faceRef.current) {
              await downloadFacePng(faceRef.current);
            }
          },
        },
        {
          key: "svg",
          text: "Download SVG",
          description: "Download face as a SVG file",
          action: async () => {
            if (faceRef.current) {
              await downloadFaceSvg(faceRef.current);
            }
          },
        },
        {
          key: "json",
          text: "Download JSON",
          description: "Download face as a JSON file",
          action: async () => {
            await downloadFaceJson(faceConfig);
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
              key={`button-${group.groupName}`}
              onPress={group.baseAction}
              className="bg-slate-800 text-white border-2 border-white"
            >
              {group.groupName}
            </Button>
          );
        }

        return (
          <ButtonGroup key={`button-group-${group.groupName}`}>
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

const MainFaceDisplay = ({ modalDisclosure }: { modalDisclosure: any }) => {
  const { faceConfig } = useStateStore();
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="w-1/2 md:w-fit border-5 border-slate-800 rounded-md mx-2">
      <div className="px-2">
        <Face faceConfig={faceConfig} maxWidth={400} ref={ref} />
      </div>
      <MainFaceDisplayActionBar
        modalDisclosure={modalDisclosure}
        faceRef={ref}
      />
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
  faceConfig: FaceType;
  overrideList: OverrideList;
  gallerySectionConfig: GallerySectionConfig;
  sectionIndex: number;
  stateStoreProps: any;
}) => {
  let overrideChosenIndex: number = overrideList.findIndex(
    (overrideListItem) =>
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
    overrideList,
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

  let selectedVal: string | number | boolean = getFromDict(
    faceConfig,
    gallerySectionConfig?.key || "",
  );

  if (gallerySectionConfig.selectionType === "svgs") {
    return (
      <Select
        key={`select-${sectionIndex}`}
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
        key={`Slider-${sectionIndex}`}
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
        key={`Switch-${sectionIndex}`}
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
      const newArr = [...inputValidationArr];
      newArr[indexToUpdate] = newValue;
      setInputValidationArr(newArr);
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
          Array.from({ length: Math.min(numColors) }).map((_, colorIndex) => {
            let hasMultipleColors = numColors > 1;
            let selectedColor =
              // @ts-ignore TS doesnt like conditional array vs string
              (hasMultipleColors ? selectedVal[colorIndex] : selectedVal) ||
              "#000000";

            return (
              <div
                key={`color-${sectionIndex}-${colorIndex}`}
                className="flex gap-2"
              >
                <Input
                  key={`Input-color-${sectionIndex}-${colorIndex}`}
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
                  key={`Input-${sectionIndex}-${colorIndex}`}
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
  faceConfig: FaceType;
  faceIndex: number;
  sectionIndex: number;
  stateStoreProps: any;
  overrideList: OverrideList;
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
    <div className="w-full h-1/2 md:h-screen flex flex-col overflow-y-scroll pb-20 pr-3">
      {gallerySectionConfigList &&
        gallerySectionConfigList.map(
          (
            gallerySectionConfig: GallerySectionConfig,
            sectionIndex: number,
          ) => {
            let overrideList = getOverrideListForItem(gallerySectionConfig);

            return (
              <div
                key={`section-${sectionIndex}`}
                className="py-6  border-t-2 border-t-slate-500"
              >
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
                    {overrideList.map((overrideToRun, faceIndex) => {
                      let faceConfigCopy = deepCopy(faceConfig);
                      override(faceConfigCopy, overrideToRun.override);

                      let isThisItemTheSelectedOne =
                        gallerySectionConfig.selectedValue ==
                        overrideToRun.display;

                      let faceWidth = gallerySize == "md" ? 100 : 150;

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
                              overrideList,
                            });
                          }}
                        >
                          <Face
                            ref={overrideToRun.ref}
                            faceConfig={faceConfigCopy}
                            width={faceWidth}
                            lazyLoad={true}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          },
        )}
    </div>
  );
};

const copyStringToClipboard = async (str: string) => {
  try {
    await navigator.clipboard.writeText(str);
  } catch (err) {
    console.error("Failed to copyStringToClipboard: ", err);
  }
};

const EditorPageTopBar = () => {
  const stateStore = useStateStore();
  let {
    faceConfig,
    gallerySize,
    setGallerySize,
    gallerySectionConfigList,
    shuffleGenderSettingObject,
    shuffleRaceSettingObject,
    setShuffleGenderSettingObject,
    setShuffleRaceSettingObject,
  } = stateStore;
  const genders = ["male", "female"];
  const races = ["white", "black", "brown", "asian"];

  const [genderInvalidOptions, setGenderInvalidOptions] =
    useState<boolean>(false);
  const [raceInvalidOptions, setRaceInvalidOptions] = useState<boolean>(false);

  return (
    <div className="bg-slate-800 text-white flex justify-between w-full fixed z-50	">
      <div className="flex gap-4 text-xl p-2 justify-around items-center">
        <span className="cursor-pointer rounded-full p-1 m-0.5 hover:bg-slate-50 hover:text-slate-900">
          <House weight="fill" size={24} href="/" />
        </span>
        <span className="hidden md:inline">faces.js Editor</span>
        <ButtonGroup>
          <Button
            className="bg-slate-800 text-white border-2 border-white"
            onClick={() =>
              shuffleEntireFace(
                faceConfig,
                gallerySectionConfigList,
                stateStore,
              )
            }
          >
            <Shuffle size={24} />
          </Button>
          <Popover placement="bottom" showArrow offset={10}>
            <PopoverTrigger>
              <Button className="bg-slate-800 text-white border-t-2 border-r-2 border-b-2 border-white">
                <Sliders size={24} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="">
              {(titleProps) => (
                <div className="px-1 py-2 w-full">
                  <p
                    className="text-small font-bold text-foreground"
                    {...titleProps}
                  >
                    Customize Shuffle
                  </p>
                  <div className="flex gap-4">
                    <CheckboxGroup
                      label="Gender"
                      isInvalid={genderInvalidOptions}
                      value={shuffleGenderSettingObject}
                      style={{ maxWidth: "120px" }}
                      errorMessage={
                        genderInvalidOptions
                          ? "Defaults will be used if no option selected"
                          : null
                      }
                      onValueChange={(genderList: any[]) => {
                        setShuffleGenderSettingObject(genderList as Gender[]);
                        setGenderInvalidOptions(genderList.length < 1);
                      }}
                    >
                      {genders.map((gender: string) => {
                        return (
                          <Checkbox value={gender}>
                            {capitalizeFirstLetter(gender)}
                          </Checkbox>
                        );
                      })}
                    </CheckboxGroup>
                    <CheckboxGroup
                      label="Race"
                      value={shuffleRaceSettingObject}
                      isInvalid={raceInvalidOptions}
                      errorMessage={
                        raceInvalidOptions ? "Select at least one" : null
                      }
                      onValueChange={(raceList: any[]) => {
                        setShuffleRaceSettingObject(raceList as Race[]);
                        setRaceInvalidOptions(raceList.length < 1);
                      }}
                    >
                      {races.map((race: string) => {
                        return (
                          <Checkbox value={race}>
                            {capitalizeFirstLetter(race)}
                          </Checkbox>
                        );
                      })}
                    </CheckboxGroup>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </ButtonGroup>
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
  let { setFaceStore, faceConfig } = useStateStore();
  const { isOpen, onOpenChange } = modalDisclosure;

  const [textAreaValue, setTextAreaValue] = useState<string>(
    JSON.stringify(faceConfig),
  );
  const [textAreaValid, setTextAreaValid] = useState<boolean>(
    isValidJSON(JSON.stringify(faceConfig)),
  );
  const textRef = useRef<HTMLTextAreaElement>(null);

  let errorMessage = <span>Invalid JSON</span>;

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
                errorMessage={!textAreaValid ? errorMessage : null}
                onChange={(e) => {
                  setTextAreaValue(e.target.value);
                  let isValid = isValidJSON(e.target.value);
                  setTextAreaValid(isValid);
                }}
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

                  if (isValid) {
                    const faceConfigCopy = deepCopy(faceConfig);
                    const overrides: Overrides = JSON.parse(textAreaValue);
                    override(faceConfigCopy, overrides);
                    setFaceStore(faceConfigCopy);

                    // By running setTextAreaValue, we can write-back the JSON to text area, in the event user
                    // remove some features from JSON string, and we fill-in the missing features
                    setTextAreaValue(JSON.stringify(faceConfigCopy));
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
