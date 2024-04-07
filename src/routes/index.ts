import { createRoute, createRouter, createRootRoute } from "@tanstack/react-router";
import { Home } from "../pages/Home";
import { EditorPage } from "../pages/EditorPage";
import { decompressFromEncodedURIComponent } from "lz-string";

export const rootRoute = createRootRoute();

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/',
	component: Home,
})

const editorRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/editor',
	component: EditorPage,
	async loader({ params, location }) {
		// Access search parameters
		const searchParams = new URLSearchParams(location.search);
		const faceConfigCompressed: string | null = searchParams.get('faceConfig') as string | null;

		if (!faceConfigCompressed) return;

		const faceConfig = JSON.parse(decompressFromEncodedURIComponent(faceConfigCompressed));

		console.log('loader:', { faceConfig, faceConfigCompressed, searchParams, tommy: searchParams.get('tommy') });

		// Potentially update Zustand store here or return data to be used in component
		return { faceConfig };
	},
});


const routeTree = rootRoute.addChildren([indexRoute, editorRoute])

export const router = createRouter({ routeTree })