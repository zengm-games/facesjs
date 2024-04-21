import { useState, useEffect } from "react";
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
  doesStrLookLikeColor,
  deepCopy,
} from "./utils";
import { shuffleOptions } from "./shuffleFace";
import {
  getOverrideListForItem,
  newFaceConfigFromOverride,
} from "./overrideList";
import { CombinedState, GallerySectionConfig, OverrideListItem } from "./types";
import { Face } from "./Face";

const inputOnChange = ({
  chosenValue,
  faceConfig,
  overrideList,
  gallerySectionConfig,
  sectionIndex,
  stateStoreProps,
}: {
  chosenValue: unknown;
  faceConfig: FaceType;
  overrideList: OverrideListItem[];
  gallerySectionConfig: GallerySectionConfig;
  sectionIndex: number;
  stateStoreProps: CombinedState;
}) => {
  const overrideChosenIndex: number = overrideList.findIndex(
    (overrideListItem) =>
      getFromDict(overrideListItem.override, gallerySectionConfig.key) ===
      chosenValue,
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

const SliderOverrideInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => {
  const [valueString, setValueString] = useState(String(value));

  useEffect(() => {
    setValueString(String(value));
  }, [value]);

  return (
    <input
      className="px-1 py-0.5 w-12 text-right text-small text-default-700 font-medium bg-default-100 outline-none transition-colors rounded-small border-medium border-transparent hover:border-primary focus:border-primary"
      type="text"
      value={valueString}
      onChange={(e) => {
        setValueString(e.target.value);
        const parsedValue = parseFloat(e.target.value);
        if (!Number.isNaN(parsedValue)) {
          onChange(parsedValue);
        }
      }}
    />
  );
};

const FeatureSelector = ({
  gallerySectionConfig,
  overrideList,
  stateStoreProps,
  sectionIndex,
}: {
  gallerySectionConfig: GallerySectionConfig;
  overrideList: OverrideListItem[];
  stateStoreProps: CombinedState;
  sectionIndex: number;
}) => {
  const { faceConfig } = stateStoreProps;

  if (!gallerySectionConfig) {
    return <div>Select a feature</div>;
  }

  const selectedVal: string | number | boolean = getFromDict(
    faceConfig,
    gallerySectionConfig.key,
  );

  if (gallerySectionConfig.selectionType === "svgs") {
    return (
      <Select
        key={`select-${sectionIndex}`}
        label={gallerySectionConfig.text}
        className="max-w-xs"
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
              key={String(overrideToRun.value)}
              value={String(overrideToRun.value)}
            >
              {overrideToRun.value}
            </SelectItem>
          );
        })}
      </Select>
    );
  } else if (gallerySectionConfig.selectionType === "range") {
    const inputValue = (selectedVal as number) || 0;

    const onChange = (newValue: number) => {
      const chosenValue = roundTwoDecimals(newValue);
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
      <Slider
        key={`Slider-${sectionIndex}`}
        label={
          <span className="text-xs text-foreground-600">
            {gallerySectionConfig.text}
          </span>
        }
        step={gallerySectionConfig.renderOptions.rangeConfig.sliderStep}
        maxValue={gallerySectionConfig.renderOptions.rangeConfig.max}
        minValue={gallerySectionConfig.renderOptions.rangeConfig.min}
        defaultValue={0.4}
        value={inputValue}
        className="max-w-md"
        // @ts-expect-error
        onChange={onChange}
        renderValue={({ children, ...props }) => (
          <output {...props}>
            <SliderOverrideInput onChange={onChange} value={inputValue} />
          </output>
        )}
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
  } else if (
    gallerySectionConfig.selectionType == "color" ||
    gallerySectionConfig.selectionType === "colors"
  ) {
    const numColors =
      gallerySectionConfig.selectionType == "color"
        ? 1
        : gallerySectionConfig.renderOptions.colorCount;
    const [inputValidationArr, setInputValidationArr] = useState<boolean[]>(
      Array(numColors).fill(true),
    );

    const updateValidationAtIndex = (
      indexToUpdate: number,
      newValue: boolean,
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
      updateValidationAtIndex(colorIndex, doesStrLookLikeColor(newColorValue));

      let chosenValue = getFromDict(faceConfig, gallerySectionConfig.key);
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
        <label className="text-xs text-foreground-600">
          {gallerySectionConfig.text}
        </label>
        {Array.from({ length: Math.min(numColors) }).map((_, colorIndex) => {
          const hasMultipleColors =
            gallerySectionConfig.selectionType == "colors";
          const selectedColor =
            // @ts-expect-error TS doesnt like conditional array vs string
            hasMultipleColors ? selectedVal[colorIndex] : selectedVal;

          return (
            <div
              key={`color-${sectionIndex}-${colorIndex}`}
              className="flex gap-2"
            >
              <Input
                key={`Input-color-${sectionIndex}-${colorIndex}`}
                type="color"
                value={selectedColor}
                onValueChange={(e) => {
                  colorInputOnChange({
                    newColorValue: e,
                    hasMultipleColors,
                    colorIndex,
                  });
                }}
              />
              <Input
                key={`Input-${sectionIndex}-${colorIndex}`}
                value={selectedColor}
                isInvalid={!inputValidationArr[colorIndex]}
                onChange={(e) => {
                  colorInputOnChange({
                    newColorValue: e.target.value,
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
  stateStoreProps: CombinedState;
  overrideList: OverrideListItem[];
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
      {gallerySectionConfigList.map((gallerySectionConfig, sectionIndex) => {
        const overrideList = getOverrideListForItem(gallerySectionConfig);

        return (
          <div
            key={`section-${sectionIndex}`}
            className={`${sectionIndex === 0 ? "pb-6" : "py-6 border-t-2 border-t-slate-400"}`}
          >
            <div className="m-1 flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span>{gallerySectionConfig.text}</span>
                <Tooltip
                  key={`tooltip1-${sectionIndex}`}
                  placement={"right"}
                  content={`Randomize ${gallerySectionConfig.text}`}
                >
                  <button
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
                  </button>
                </Tooltip>
                <Tooltip
                  key={`tooltip2-${sectionIndex}`}
                  placement={"right"}
                  content={`Lock current ${gallerySectionConfig.text} when shuffling whole face`}
                >
                  <button
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
                  </button>
                </Tooltip>
              </div>

              <div className="w-1/2 mb-2 flex justify-end">
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
                  const selected =
                    gallerySectionConfig.selectedValue == overrideToRun.value;

                  const faceWidth = gallerySize == "md" ? 100 : 150;

                  return (
                    <div
                      key={faceIndex}
                      className={`rounded-lg cursor-pointer hover:bg-slate-100 hover:border-slate-500 border-2 border-inherit flex justify-center active:scale-90 transition-transform ease-in-out${selected ? " bg-slate-200 hover:border-slate-500" : ""}`}
                      onClick={() => {
                        const faceConfigCopy = deepCopy(faceConfig);
                        override(faceConfigCopy, overrideToRun.override);

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
                        faceConfig={faceConfig}
                        overrides={overrideToRun.override}
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
