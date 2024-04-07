import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";
import chokidar from 'chokidar';
import path from 'path';
import processSVGs from './src/tools/svg/processSVGs'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		TanStackRouterVite(),
		{
			name: 'watch-for-svg-changes',
			configureServer(server) {
				chokidar
					.watch([path.join(__dirname, "..", "svgs")], {
						ignoreInitial: true,
					})
					.on("all", (event, path) => {
						console.log(`Processing SVGs due to ${event} at ${path}`);
						processSVGs();
					});
			},
		},
	],
	server: {
		host: true,
		strictPort: true,
	},
});
