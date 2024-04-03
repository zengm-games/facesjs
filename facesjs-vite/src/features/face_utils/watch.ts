// utils/watch.ts
import * as chokidar from 'chokidar';
import * as path from 'path';
import processSVGs from './processSVGs';

// Assuming processSVGs is an async function
processSVGs().then(() => console.log('Initial SVG processing done'));

let watchPath = path.join(__dirname, '..', '..', 'svgs');
console.log(`Watching for changes in: ${watchPath}`);

chokidar.watch([watchPath], {
    ignoreInitial: true,
}).on('all', async (event, filePath) => {
    console.log(`Detected change in: ${filePath}`);
    await processSVGs();
    console.log('SVGs processed after change');
});
