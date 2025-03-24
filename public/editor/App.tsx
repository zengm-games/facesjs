import { NextUIProvider, useDisclosure } from "@nextui-org/react";
import { FeatureGallery } from "./FeatureGallery";
import { TopBar } from "./TopBar";
import { MainFace } from "./MainFace";
import { EditJsonModal } from "./EditJsonModal";
import { Credits } from "./Credits";
import { SaveButton } from "./SaveButton";

const App = () => {
  const showSaveButton = window.opener !== undefined;

  const modalDisclosure = useDisclosure();

  return (
    <NextUIProvider>
      <TopBar />
      <div className="flex flex-col-reverse md:flex-row items-center md:items-start pt-16 gap-2 mx-2">
        <FeatureGallery />
        <div className="md:sticky md:top-16 flex-shrink-0 w-[280px] lg:w-[350px] xl:w-[400px] flex flex-col h-full">
          <MainFace modalDisclosure={modalDisclosure} />

          <div className="hidden md:block mt-6">
            <Credits />
          </div>
        </div>
      </div>
      <EditJsonModal modalDisclosure={modalDisclosure} />
      <div
        className={`md:hidden mx-2 ${showSaveButton ? "mb-[64px]" : "mb-2"}`}
      >
        <Credits />
      </div>
      <SaveButton />
    </NextUIProvider>
  );
};

export default App;
