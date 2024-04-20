import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";
import { EditorPage } from "./EditorPage";

const App = () => {
  return (
    <NextUIProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexStaticHTML />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/editor/:param" element={<EditorPage />} />
        </Routes>
      </BrowserRouter>
    </NextUIProvider>
  );
};

const IndexStaticHTML = () => {
  return (
    <iframe
      src="/index.html"
      style={{ border: "none", width: "100%", height: "100vh" }}
      title="FacesJS Home"
    />
  );
};

export default App;
