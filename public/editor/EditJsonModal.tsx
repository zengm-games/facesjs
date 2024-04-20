import React, { useState } from "react";
import override from "../../src/override";
import { Overrides } from "../../src/types";
import { useStateStore } from "./stateStore";
import {
  Textarea,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { deepCopy, isValidJSON } from "./utils";

export const EditJsonModal = ({
  modalDisclosure,
}: {
  modalDisclosure: any;
}) => {
  const { setFaceStore, faceConfig } = useStateStore();
  const { isOpen, onOpenChange } = modalDisclosure;

  const [textAreaValue, setTextAreaValue] = useState<string>(() =>
    JSON.stringify(faceConfig),
  );
  const [textAreaValid, setTextAreaValid] = useState<boolean>(() =>
    isValidJSON(JSON.stringify(faceConfig)),
  );

  return (
    <Modal shadow="md" size="xl" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(_) => (
          <>
            <ModalHeader>JSON face object</ModalHeader>
            <ModalBody>
              <Textarea
                value={textAreaValue}
                isInvalid={!textAreaValid}
                description={!textAreaValid ? null : <div className="h-4" />}
                errorMessage={!textAreaValid ? "Invalid JSON" : null}
                onChange={(e) => {
                  setTextAreaValue(e.target.value);
                  const isValid = isValidJSON(e.target.value);
                  setTextAreaValid(isValid);
                }}
                size="lg"
                className="min-h-90"
              />
            </ModalBody>
            <ModalFooter>
              <Button onClick={onOpenChange} size="md" color="danger">
                Close
              </Button>
              <Button
                onClick={() => {
                  const isValid = isValidJSON(textAreaValue);
                  setTextAreaValid(isValid);

                  if (isValid) {
                    const faceConfigCopy = deepCopy(faceConfig);
                    const overrides: Overrides = JSON.parse(textAreaValue);
                    override(faceConfigCopy, overrides);
                    setFaceStore(faceConfigCopy);

                    // By running setTextAreaValue, we can write-back the JSON to text area, in the event user
                    // remove some features from JSON string, and we fill-in the missing features
                    setTextAreaValue(JSON.stringify(faceConfigCopy));
                    onOpenChange();
                  }
                }}
                size="md"
                color="primary"
                isDisabled={!textAreaValid}
              >
                Draw
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
