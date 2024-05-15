import { type CSSProperties } from "react";
import { Sketch } from "./Sketch";
import {
  Button,
  PopoverTrigger,
  PopoverContent,
  Popover,
} from "@nextui-org/react";
import { ColorFormat } from "./types";

const rgbaObjToRgbaStr = (rgbaObj: {
  r: number;
  g: number;
  b: number;
  a: number;
}): string => {
  return `rgba(${rgbaObj.r}, ${rgbaObj.g}, ${rgbaObj.b}, ${rgbaObj.a})`;
};

export const ColorPicker = ({
  onClick,
  onChange,
  style,
  value,
  colorFormat = "hex",
  presetColors,
}: {
  onClick?: () => void;
  onChange: (hex: string) => void;
  style?: CSSProperties;
  value: string;
  colorFormat: ColorFormat;
  presetColors: string[];
}) => {
  return (
    <Popover showArrow placement="bottom">
      <PopoverTrigger>
        <Button
          onClick={onClick}
          className="border-2"
          style={{
            ...style,
            backgroundColor: value,
          }}
        />
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Sketch
          color={value}
          presetColors={presetColors}
          colorFormat={colorFormat}
          onChange={(color) => {
            if (colorFormat === "rgba") {
              onChange(rgbaObjToRgbaStr(color.rgba));
            } else {
              onChange(color.hex);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
