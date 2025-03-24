import { Button } from "@nextui-org/react";
import { useStateStore } from "./stateStore";
import { useEffect } from "react";

export const SaveButton = () => {
  const { faceConfig, fromParent } = useStateStore();

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.data.type === "facesjs" && event.data.action === "close") {
        window.close();
      }
    };
    window.addEventListener("message", listener);

    return () => {
      window.removeEventListener("message", listener);
    };
  }, []);

  if (!fromParent) {
    return null;
  }

  return (
    <Button
      onClick={() => {
        fromParent.opener.postMessage(
          {
            type: "facesjs",
            key: fromParent.key,
            value: faceConfig,
          },
          "*",
        );
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
