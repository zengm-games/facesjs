import * as fs from 'fs/promises';
import * as path from 'path';
import { optimize } from 'svgo';
import genders from './genders';
import { Feature } from './types';

const warning = "// THIS IS A GENERATED FILE, DO NOT EDIT BY HAND!\n// See utils/processSVGs.ts";

const processSVGs = async () => {
    const svgFolder = path.join(__dirname, '..', 'public', 'svgs');
    const folders = await fs.readdir(svgFolder);
    const svgs: { [key: string]: any } = {};

    for (const folder of folders) {
        if (folder === ".DS_Store") continue;
        svgs[folder] = {};

        const subfolder = path.join(svgFolder, folder);
        const files = await fs.readdir(subfolder);
        for (const file of files) {
            if (!file.endsWith(".svg")) continue;
            const key = path.basename(file, ".svg");
            const contents = await fs.readFile(path.join(subfolder, file), "utf8");
            const result = await optimize(contents, { multipass: true, plugins: ["preset-default", "inlineStyles"] });

            svgs[folder][key] = result.data.replace(/.*<svg.*?>/, "").replace("</svg>", "");
        }
    }

    await fs.writeFile(path.join(__dirname, '..', 'lib', 'svgs.ts'), `${warning}\n\nexport default ${JSON.stringify(svgs)};`);

    const svgsIndex: { [key in Feature]?: string[] } = Object.keys(svgs).reduce((acc, key) => ({
        ...acc,
        [key]: Object.keys(svgs[key])
    }), {});

    const svgsGenders = Object.keys(svgsIndex).reduce((acc, key) => {
        let faceSection = key as Feature;
        let sectionOptions = svgsIndex[faceSection] as string[];
        const keyGenders = sectionOptions.map((featureName: any) => genders[faceSection]?.[featureName] || 'female');
        return { ...acc, [faceSection]: keyGenders };
    }, {});

    await fs.writeFile(path.join(__dirname, '..', 'lib', 'svgs-index.ts'), `${warning}\n\nexport const svgsIndex = ${JSON.stringify(svgsIndex)};\n\nexport const svgsGenders = ${JSON.stringify(svgsGenders)};`);
};

export default processSVGs;
