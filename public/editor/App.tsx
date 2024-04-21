import React from "react";
import { NextUIProvider, useDisclosure } from "@nextui-org/react";
import { FeatureGallery } from "./FeatureGallery";
import { TopBar } from "./TopBar";
import { MainFace } from "./MainFace";
import { EditJsonModal } from "./EditJsonModal";
import { Credits } from "./Credits";

const App = () => {
  const modalDisclosure = useDisclosure();

  return (
    <NextUIProvider>
      <TopBar />
      <div className="flex flex-col-reverse md:flex-row items-center md:items-start pt-16 gap-2 mx-2">
        <FeatureGallery />
        <div className="md:sticky md:top-16 flex-shrink-0 w-[280px] lg:w-[350px] xl:w-[400px] flex flex-col h-full">
          <MainFace modalDisclosure={modalDisclosure} />

          <div className="hidden md:block mt-3">
            <Credits />
          </div>
        </div>
      </div>
      <EditJsonModal modalDisclosure={modalDisclosure} />
      <div className="md:hidden mb-3 mx-2">
        <Credits />
      </div>
    </NextUIProvider>
  );
};

export default App;
