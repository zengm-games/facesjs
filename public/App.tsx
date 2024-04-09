import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NextUIProvider } from "@nextui-org/react";
import { Home } from "./Home";
import { EditorPage } from "./EditorPage";



const App = () => {

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
