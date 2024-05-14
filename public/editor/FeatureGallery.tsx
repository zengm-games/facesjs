import { useState, useEffect } from "react";
import override from "../../src/override";
import { FaceConfig } from "../../src/types";
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
import { getFromDict, roundTwoDecimals, doesStrLookLikeColor } from "./utils";
import { shuffleFeature } from "./shuffleFace";
import {
  getOverrideListForItem,
  newFaceConfigFromOverride,
} from "./overrideList";
import { CombinedState, GallerySectionConfig, OverrideListItem } from "./types";
import { Face } from "../../src/Face";
import { deepCopy } from "../../src/utils";
import { ColorPicker } from "./ColorPicker";

const inputOnChange = ({
  chosenValue,
  faceConfig,
  key,
  overrideList,
  sectionIndex,
  stateStoreProps,
}: {
  chosenValue: unknown;
  faceConfig: FaceConfig;
  key: string;
  overrideList: OverrideListItem[];
  sectionIndex: number;
  stateStoreProps: CombinedState;
}) => {
  const overrideChosenIndex = overrideList.findIndex(
    (overrideListItem) =>
      getFromDict(overrideListItem.override, key) === chosenValue,
  );

  const faceConfigCopy = newFaceConfigFromOverride(
    faceConfig,
    key,
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
      className="px-1 py-0.5 w-12 text-right text-small text-default-700 font-medium bg-default-100 outline-none transition-colors rounded-sm border-medium border-transparent hover:border-primary focus:border-primary"
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
    const flip = gallerySectionConfig.flip;

    return (
      <div key={sectionIndex} className="w-full max-w-md flex gap-4">
        <Select
          label={gallerySectionConfig.text}
          selectedKeys={[gallerySectionConfig.selectedValue]}
          onChange={(e) => {
            const chosenValue = e.target.value;
            inputOnChange({
              chosenValue,
              faceConfig,
              key: gallerySectionConfig.key,
              overrideList,
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
        {flip ? (
          <Switch
            isSelected={flip.selectedValue}
            onValueChange={(chosenValue) => {
              inputOnChange({
                chosenValue,
                faceConfig,
                key: flip.key,
                overrideList: [],
                sectionIndex,
                stateStoreProps,
              });
            }}
          >
            Flip
          </Switch>
        ) : null}
      </div>
    );
  } else if (gallerySectionConfig.selectionType === "range") {
    const inputValue = (selectedVal as number) || 0;

    const onChange = (newValue: number) => {
      const chosenValue = roundTwoDecimals(newValue);
      inputOnChange({
        chosenValue,
        faceConfig,
        key: gallerySectionConfig.key,
        overrideList,
        sectionIndex,
        stateStoreProps,
      });
    };

    return (
      <Slider
        key={sectionIndex}
        className="max-w-md"
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
        // @ts-expect-error
        onChange={onChange}
        renderValue={({ children, ...props }) => (
          <output {...props}>
            <SliderOverrideInput onChange={onChange} value={inputValue} />
          </output>
        )}
      ></Slider>
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
        key: gallerySectionConfig.key,
        overrideList,
        sectionIndex,
        stateStoreProps,
      });
    };

    let colorFormat = gallerySectionConfig.colorFormat
      ? gallerySectionConfig.colorFormat
      : "hex";

    return (
      <div
        key={sectionIndex}
        className="flex gap-2 flex-wrap justify-end items-end"
      >
        {Array.from({ length: Math.min(numColors) }).map((_, colorIndex) => {
          const hasMultipleColors =
            gallerySectionConfig.selectionType == "colors";
          const selectedColor =
            // @ts-expect-error TS doesnt like conditional array vs string
            hasMultipleColors ? selectedVal[colorIndex] : selectedVal;

          let presetColors = hasMultipleColors
            ? gallerySectionConfig.renderOptions.valuesToRender.map(
                (colorList: string[]) => colorList[colorIndex],
              )
            : gallerySectionConfig.renderOptions.valuesToRender;

          return (
            <div key={colorIndex} className="w-fit">
              {colorIndex === 0 ? (
                <label className="text-xs text-foreground-600 mb-2">
                  {gallerySectionConfig.text}
                </label>
              ) : null}
              <div key={colorIndex} className="flex gap-2">
                <ColorPicker
                  onChange={(color) => {
                    colorInputOnChange({
                      newColorValue: color,
                      hasMultipleColors,
                      colorIndex,
                    });
                  }}
                  colorFormat={colorFormat}
                  presetColors={presetColors}
                  allowAlpha={gallerySectionConfig.allowAlpha}
                  value={selectedColor}
                />
                <Input
                  value={selectedColor}
                  isInvalid={!inputValidationArr[colorIndex]}
                  className="min-w-52"
                  onChange={(e) => {
                    colorInputOnChange({
                      newColorValue: e.target.value,
                      hasMultipleColors,
                      colorIndex,
                    });
                  }}
                />
              </div>
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
    gallerySize,
    gallerySectionConfigList,
    setRandomizeEnabledForSection,
  } = stateStoreProps;

  return (
    <div className="w-full flex flex-col overflow-hidden">
      {gallerySectionConfigList.map((gallerySectionConfig, sectionIndex) => {
        const overrideList = getOverrideListForItem(gallerySectionConfig);

        return (
          <div
            key={sectionIndex}
            className={`${sectionIndex === 0 ? "pb-6" : "py-6 border-t-2 border-t-slate-400"}`}
          >
            <div className="m-1 flex gap-4 justify-between items-center">
              <div className="flex items-center gap-1 shrink-0">
                <span className="hidden sm:block">
                  {gallerySectionConfig.text}
                </span>
                <Tooltip
                  content={`Randomize ${gallerySectionConfig.text}`}
                  delay={500}
                >
                  <button
                    onClick={() => {
                      shuffleFeature(
                        gallerySectionConfig,
                        stateStoreProps,
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
                  content={`Lock current ${gallerySectionConfig.text} when randomizing whole face`}
                  delay={500}
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

              <div className="mb-2 flex justify-end grow">
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
                className={`w-full flex justify-start gap-8${gallerySize === "lg" ? " flex-wrap" : ""}${gallerySize === "md" ? " overflow-x-auto" : ""}`}
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
                        face={faceConfig}
                        overrides={overrideToRun.override}
                        style={{
                          width: faceWidth,
                        }}
                        lazy
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
