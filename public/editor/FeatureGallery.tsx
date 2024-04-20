import React, { useState } from "react";
import override from "../../src/override";
import { Face as FaceType } from "../../src/types";
import { useStateStore } from "./stateStore";
import { Shuffle, LockSimpleOpen, LockSimple } from "@phosphor-icons/react";
import {
  Select,
  SelectItem,
  Input,
  Slider,
  Switch,
  Tooltip,
} from "@nextui-org/react";
import {
  getFromDict,
  roundTwoDecimals,
  deepCopy,
  doesStrLookLikeColor,
} from "./utils";
import { shuffleOptions } from "./shuffleFace";
import {
  getOverrideListForItem,
  newFaceConfigFromOverride,
} from "./overrideList";
import { CombinedState, GallerySectionConfig, OverrideList } from "./types";
import { Face } from "./Face";

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
  const overrideChosenIndex: number = overrideList.findIndex(
    (overrideListItem) =>
      getFromDict(
        overrideListItem.override,
        gallerySectionConfig?.key ?? "",
      ) === chosenValue,
  );

  const faceConfigCopy = newFaceConfigFromOverride(
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
  const { faceConfig } = stateStoreProps;

  if (!gallerySectionConfig) {
    return <div>Select a feature</div>;
  }

  const selectedVal: string | number | boolean = getFromDict(
    faceConfig,
    gallerySectionConfig?.key ?? "",
  );

  if (gallerySectionConfig.selectionType === "svgs") {
    return (
      <Select
        key={`select-${sectionIndex}`}
        label={gallerySectionConfig.text}
        className="max-w-xs"
        // @ts-expect-error Annoying type issue
        selectedKeys={[gallerySectionConfig.selectedValue]}
        onChange={(e) => {
          const chosenValue = e.target.value;
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
          gallerySectionConfig?.renderOptions?.rangeConfig?.sliderStep ?? 0.01
        }
        maxValue={gallerySectionConfig?.renderOptions?.rangeConfig?.max}
        minValue={gallerySectionConfig?.renderOptions?.rangeConfig?.min}
        defaultValue={0.4}
        value={(selectedVal as number) || 0}
        className="max-w-md"
        onChange={(e) => {
          const chosenValue = roundTwoDecimals(e as number);
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
          const chosenValue = e || false;
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
    const numColors = gallerySectionConfig?.renderOptions?.colorCount ?? 1;
    const initialValidArr: (undefined | "invalid" | "valid")[] = Array.from({
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
        gallerySectionConfig?.key ?? "",
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
            const hasMultipleColors = numColors > 1;
            const selectedColor =
              // @ts-expect-error TS doesnt like conditional array vs string
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
  const { setFaceStore, setLastClickedSectionIndex, setLastSelectedFaceIndex } =
    stateStoreProps;

  setFaceStore(faceConfig);
  setLastClickedSectionIndex(sectionIndex);
  setLastSelectedFaceIndex(faceIndex);
};

export const FeatureGallery = () => {
  const stateStoreProps = useStateStore();

  const {
    faceConfig,
    setFaceStore,
    gallerySize,
    gallerySectionConfigList,
    setRandomizeEnabledForSection,
  } = stateStoreProps;

  return (
    <div className="w-full flex flex-col overflow-y-auto">
      {gallerySectionConfigList?.map((gallerySectionConfig, sectionIndex) => {
        const overrideList = getOverrideListForItem(gallerySectionConfig);

        return (
          <div
            key={`section-${sectionIndex}`}
            className={`${sectionIndex === 0 ? "pb-6" : "py-6 border-t-2 border-t-slate-500"}`}
          >
            <div className="my-1 mx-1 flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span>{gallerySectionConfig.text}</span>
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
                className={`w-full flex justify-start gap-8${gallerySize === "lg" ? " flex-wrap" : ""}${gallerySize === "md" ? " overflow-x-scroll" : ""}`}
              >
                {overrideList.map((overrideToRun, faceIndex) => {
                  const faceConfigCopy = deepCopy(faceConfig);
                  override(faceConfigCopy, overrideToRun.override);

                  const isThisItemTheSelectedOne =
                    gallerySectionConfig.selectedValue == overrideToRun.display;

                  const faceWidth = gallerySize == "md" ? 100 : 150;

                  return (
                    <div
                      key={faceIndex}
                      className={`rounded-lg cursor-pointer hover:bg-slate-100 hover:border-slate-500 border-2 border-inherit flex justify-center active:scale-90 transition-transform ease-in-out${isThisItemTheSelectedOne ? " bg-slate-200 hover:border-slate-500" : ""}`}
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
      })}
    </div>
  );
};
