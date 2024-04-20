import React from "react";
import { NextUIProvider } from "@nextui-org/react";
import { EditorPage } from "./EditorPage";

const App = () => {
  return (
    <NextUIProvider>
      <EditorPage />
    </NextUIProvider>
  );
};

export default App;
