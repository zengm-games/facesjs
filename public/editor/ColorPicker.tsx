import { type CSSProperties } from "react";
import { Sketch } from "./Sketch";
import {
  Button,
  PopoverTrigger,
  PopoverContent,
  Popover,
} from "@nextui-org/react";

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
  allowAlpha = false,
  presetColors,
}: {
  onClick?: () => void;
  onChange: (hex: string) => void;
  style?: CSSProperties;
  value: string;
  colorFormat: "hex" | "rgba";
  allowAlpha: boolean;
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
          allowAlpha={allowAlpha}
          presetColors={presetColors}
          onChange={(color) => {
            console.log("Sketch change", { color });

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
