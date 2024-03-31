// utils/watch.ts
import chokidar from 'chokidar';
import path from 'path';
import processSVGs from './processSVGs';

// Assuming processSVGs is an async function
processSVGs().then(() => console.log('Initial SVG processing done'));

chokidar.watch([path.join(__dirname, '..', 'public', 'svgs')], {
    ignoreInitial: true,
}).on('all', async (event, filePath) => {
    console.log(`Detected change in: ${filePath}`);
    await processSVGs();
    console.log('SVGs processed after change');
});
