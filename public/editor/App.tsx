import React from "react";
import { NextUIProvider, useDisclosure } from "@nextui-org/react";
import { FeatureGallery } from "./FeatureGallery";
import { TopBar } from "./TopBar";
import { MainFace } from "./MainFace";
import { EditJsonModal } from "./EditJsonModal";

const App = () => {
  const modalDisclosure = useDisclosure();

  return (
    <NextUIProvider>
      <TopBar />
      <div className="flex flex-col-reverse md:flex-row items-center md:items-start pt-16 gap-2 mx-2">
        <FeatureGallery />
        <MainFace
          className="md:sticky md:top-16"
          modalDisclosure={modalDisclosure}
        />
      </div>
      <EditJsonModal modalDisclosure={modalDisclosure} />
    </NextUIProvider>
  );
};

export default App;
