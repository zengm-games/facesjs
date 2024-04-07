import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { FunctionComponent } from "./common/types";
import { NextUIProvider } from "@nextui-org/react";
import { Home } from "./pages/Home";
import { EditorPage } from "./pages/EditorPage";



const App = (): FunctionComponent => {

	return (
		<NextUIProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/editor" element={<EditorPage />} />
					<Route path="/editor/:param" element={<EditorPage />} />
				</Routes>
			</BrowserRouter>
		</NextUIProvider>
	);
};

export default App;
