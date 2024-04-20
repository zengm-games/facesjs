import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";
import { EditorPage } from "./EditorPage";

const App = () => {
  return (
    <NextUIProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<EditorPage />} />
          <Route path="/:param" element={<EditorPage />} />
        </Routes>
      </BrowserRouter>
    </NextUIProvider>
  );
};

export default App;
