import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, type createRouter } from "@tanstack/react-router";
import type { FunctionComponent } from "./common/types";
import { NextUIProvider } from "@nextui-org/react";

const queryClient = new QueryClient();

type AppProps = { router: ReturnType<typeof createRouter> };

const App = ({ router }: AppProps): FunctionComponent => {

	return (
		<NextUIProvider>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</NextUIProvider>
	);
};

export default App;
