import { useState } from "react";
import { Gender, Race } from "../../src/types";
import { useStateStore } from "./stateStore";
import {
  House,
  Shuffle,
  List,
  Sliders,
  Rows,
  Square,
} from "@phosphor-icons/react";
import {
  CheckboxGroup,
  Checkbox,
  Button,
  ButtonGroup,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tabs,
  Tab,
  Tooltip,
} from "@nextui-org/react";
import { capitalizeFirstLetter } from "./utils";
import { shuffleEntireFace } from "./shuffleFace";
import { OtherSetting } from "./types";

export const TopBar = () => {
  const stateStore = useStateStore();
  const {
    faceConfig,
    gallerySize,
    setGallerySize,
    gallerySectionConfigList,
    shuffleGenderSettingObject,
    shuffleRaceSettingObject,
    shuffleOtherSettingObject,
    setShuffleGenderSettingObject,
    setShuffleRaceSettingObject,
    setShuffleOtherSettingObject,
  } = stateStore;
  const genders: Gender[] = ["male", "female"];
  const races: Race[] = ["white", "black", "brown", "asian"];

  const [genderInvalidOptions, setGenderInvalidOptions] = useState(false);
  const [raceInvalidOptions, setRaceInvalidOptions] = useState(false);

  return (
    <div className="bg-slate-800 text-white flex justify-between w-full fixed z-50">
      <div className="flex text-xl p-2 justify-around items-center">
        <a
          href=".."
          className="hidden sm:inline cursor-pointer rounded-full p-1 m-0.5 hover:bg-slate-50 hover:text-slate-900 mr-3"
        >
          <House weight="fill" size={24} href="/" />
        </a>
        <span className="hidden md:inline mr-4">faces.js editor</span>
        <ButtonGroup>
          <Popover placement="bottom" showArrow offset={10}>
            <PopoverTrigger>
              <Button
                className="bg-slate-800 text-white border-2 border-r-0 border-white"
                title="Randomization settings"
              >
                <Sliders size={24} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="">
              {(titleProps) => (
                <div className="px-1 py-2 w-full">
                  <p
                    className="text-medium font-bold text-foreground-500 mb-1"
                    {...titleProps}
                  >
                    Randomization settings
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
                      onValueChange={(genderList) => {
                        setShuffleGenderSettingObject(genderList as Gender[]);
                        setGenderInvalidOptions(genderList.length < 1);
                      }}
                    >
                      {genders.map((gender) => {
                        return (
                          <Checkbox key={gender} value={gender}>
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
                      onValueChange={(raceList) => {
                        setShuffleRaceSettingObject(raceList as Race[]);
                        setRaceInvalidOptions(raceList.length < 1);
                      }}
                    >
                      {races.map((race) => {
                        return (
                          <Checkbox key={race} value={race}>
                            {capitalizeFirstLetter(race)}
                          </Checkbox>
                        );
                      })}
                    </CheckboxGroup>
                    <CheckboxGroup
                      label="Other"
                      value={shuffleOtherSettingObject}
                      onValueChange={(otherList) => {
                        setShuffleOtherSettingObject(
                          otherList as OtherSetting[],
                        );
                      }}
                    >
                      <Checkbox value="relative">Relative</Checkbox>
                    </CheckboxGroup>
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <Tooltip content="Randomize all unlocked features" delay={500}>
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
          </Tooltip>
        </ButtonGroup>
      </div>
      <div className="flex items-center mr-2">
        <Tabs
          aria-label="Options"
          selectedKey={gallerySize}
          // @ts-expect-error
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
