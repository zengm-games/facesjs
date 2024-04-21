import React, { useState } from "react";
import { Gender, Race } from "../../src/types";
import { useStateStore } from "./stateStore";
import { Shuffle, List, Sliders, Rows, Square } from "@phosphor-icons/react";
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
} from "@nextui-org/react";
import { capitalizeFirstLetter } from "./utils";
import { shuffleEntireFace } from "./shuffleFace";

export const TopBar = () => {
  const stateStore = useStateStore();
  const {
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
        <span className="hidden md:inline">faces.js editor</span>
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
