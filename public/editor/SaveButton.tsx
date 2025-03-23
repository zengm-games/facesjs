import { Button } from "@nextui-org/react";
import { useStateStore } from "./stateStore";

export const SaveButton = () => {
  const { faceConfig } = useStateStore();

  if (!window.opener) {
    return null;
  }

  return (
    <Button
      onClick={() => {
        console.log(JSON.stringify(faceConfig));
        window.opener.postMessage(
          {
            type: "face",
            value: faceConfig,
          },
          "*",
        );
        window.close();
      }}
      size="lg"
      color="primary"
      style={{
        position: "fixed",
        right: "0.5rem",
        bottom: "0.5rem",
      }}
    >
      Save changes
    </Button>
  );
};
