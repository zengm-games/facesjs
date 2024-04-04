import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, type createRouter } from "@tanstack/react-router";
import type { FunctionComponent } from "./common/types";
// import { TanStackRouterDevelopmentTools } from "./components/utils/development-tools/TanStackRouterDevelopmentTools";
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/lara-light-cyan/theme.css";



const queryClient = new QueryClient();

type AppProps = { router: ReturnType<typeof createRouter> };

const App = ({ router }: AppProps): FunctionComponent => {
	return (
		<PrimeReactProvider>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
				{/* <TanStackRouterDevelopmentTools
				router={router}
				initialIsOpen={false}
				position="bottom-right"
			/>
			<ReactQueryDevtools initialIsOpen={false} /> */}
			</QueryClientProvider>
		</PrimeReactProvider>
	);
};

export default App;
