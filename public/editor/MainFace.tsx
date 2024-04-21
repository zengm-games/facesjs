import React, { RefObject, useRef } from "react";
import {
  DownloadSimple,
  UploadSimple,
  LinkSimple,
  CaretDown,
} from "@phosphor-icons/react";
import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownMenu,
  DropdownTrigger,
  DropdownItem,
  type useDisclosure,
} from "@nextui-org/react";
import { Face } from "./Face";
import {
  downloadFacePng,
  downloadFaceSvg,
  downloadFaceJson,
} from "./downloadFace";
import { useStateStore } from "./stateStore";

const copyStringToClipboard = async (str: string) => {
  await navigator.clipboard.writeText(str);
};

const MainFaceActionBar = ({
  faceRef,
  modalDisclosure,
}: {
  faceRef: RefObject<HTMLDivElement>;
  modalDisclosure: ReturnType<typeof useDisclosure>;
}) => {
  const { faceConfig } = useStateStore();

  const { onOpen } = modalDisclosure;

  const dropdownConfig = [
    {
      groupName: "Copy",
      groupIcon: <LinkSimple size={24} />,
      baseAction: async () => {
        await copyStringToClipboard(JSON.stringify(faceConfig));
      },
      items: [
        {
          key: "json",
          text: "Copy JSON",
          description: "Copy current face JSON",
        },
        {
          key: "link",
          text: "Copy Link",
          description: "Copy the link to the editor with this face loaded",
          action: async () => {
            await copyStringToClipboard(window.location.href);
          },
        },
      ],
    },
    {
      groupName: "Download",
      groupIcon: <DownloadSimple size={24} />,
      baseAction: async () => {
        if (faceRef.current) {
          await downloadFacePng(faceRef.current);
        }
      },
      items: [
        {
          key: "png",
          text: "Download PNG",
          description: "Download face as a PNG file",
        },
        {
          key: "svg",
          text: "Download SVG",
          description: "Download face as an SVG file",
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
      groupIcon: <UploadSimple size={24} />,
      baseAction: onOpen,
    },
  ];

  return (
    <div className="flex gap-4 flex-wrap justify-center border-t-5 border-slate-800  bg-slate-800 text-white">
      {dropdownConfig.map((group) => {
        if (!group.items) {
          return (
            <Button
              key={`button-${group.groupName}`}
              isIconOnly
              onPress={group.baseAction}
              className="bg-slate-800 text-white border-2 border-white"
              title={group.groupName}
            >
              {group.groupIcon}
            </Button>
          );
        }

        return (
          <ButtonGroup key={`button-group-${group.groupName}`}>
            <Button
              isIconOnly
              onClick={group.baseAction}
              className="bg-slate-800 text-white border-2 border-white min-w-0"
              title={group.groupName}
            >
              {group.groupIcon}
            </Button>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  className="bg-slate-800 text-white border-2 border-l-0 border-white"
                >
                  <CaretDown size={24} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu disallowEmptySelection className="max-w-[300px]">
                {group.items.map((item) => (
                  <DropdownItem
                    key={item.key}
                    description={item.description}
                    onClick={item.action ?? group.baseAction}
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

export const MainFace = ({
  modalDisclosure,
}: {
  modalDisclosure: ReturnType<typeof useDisclosure>;
}) => {
  const { faceConfig } = useStateStore();
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="border-5 border-slate-800 rounded-md">
      <Face faceConfig={faceConfig} maxWidth={400} ref={ref} />
      <MainFaceActionBar modalDisclosure={modalDisclosure} faceRef={ref} />
    </div>
  );
};
