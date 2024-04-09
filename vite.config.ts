import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";
import chokidar from 'chokidar';
import path from 'path';

export default defineConfig({
	plugins: [
		react(),
		{
			name: 'watch-for-svg-changes',
			configureServer(server) {
				let processSVGs;
				if (typeof window === 'undefined') {
					processSVGs = require('./tools/process-svgs.js').processSVGs;
				}

				const delayMs = 1_000;
				let timeoutId: NodeJS.Timeout | undefined = undefined;

				chokidar
					.watch([path.join(__dirname, "svgs")], {
						ignoreInitial: false,
					})
					.on("all", (event, filePath) => {
						console.log(`Detected change in SVGs: ${event} ${filePath}`);
						if (timeoutId !== null) {
							clearTimeout(timeoutId);
						}

						timeoutId = setTimeout(() => {
							console.log('Processing SVGs due to recent changes');
							processSVGs();
						}, delayMs);
					});
			},
		},
	],
	server: {
		host: true,
		strictPort: true,
	},
});
