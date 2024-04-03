import { createRoute, createRouter, createRootRoute } from "@tanstack/react-router";
import { Home } from "../pages/Home";
import { EditorPage } from "../pages/EditorPage";

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
});


const routeTree = rootRoute.addChildren([indexRoute, editorRoute])

export const router = createRouter({ routeTree })