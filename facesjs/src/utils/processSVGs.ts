import fs from 'fs';
import path from 'path';
import { optimize } from 'svgo';
import genders from './genders';

const warning = "// THIS IS A GENERATED FILE, DO NOT EDIT BY HAND!\n// See utils/processSVGs.ts";

const processSVGs = async () => {
    const svgFolder = path.join(__dirname, '..', 'public', 'svgs');
    const folders = fs.readdirSync(svgFolder);
    const svgs: { [key: string]: any } = {};

    for (const folder of folders) {
        if (folder === ".DS_Store") continue;
        svgs[folder] = {};

        const subfolder = path.join(svgFolder, folder);
        const files = fs.readdirSync(subfolder);
        for (const file of files) {
            if (!file.endsWith(".svg")) continue;
            const key = path.basename(file, ".svg");
            const contents = fs.readFileSync(path.join(subfolder, file), "utf8");
            const result = await optimize(contents, { multipass: true, plugins: ["preset-default", "inlineStyles"] });

            svgs[folder][key] = result.data.replace(/.*<svg.*?>/, "").replace("</svg>", "");
        }
    }

    fs.writeFileSync(path.join(__dirname, '..', 'lib', 'svgs.ts'), `${warning}\n\nexport default ${JSON.stringify(svgs)};`);

    const svgsIndex: { [key: string]: any } = Object.keys(svgs).reduce((acc, key) => ({
        ...acc,
        [key]: Object.keys(svgs[key])
    }), {});

    const svgsGenders = Object.keys(svgsIndex).reduce((acc, key) => {
        const keyGenders = svgsIndex[key].map((featureName: any) => genders[key]?.[featureName] || 'female');
        return { ...acc, [key]: keyGenders };
    }, {});

    fs.writeFileSync(path.join(__dirname, '..', 'lib', 'svgs-index.ts'), `${warning}\n\nexport const svgsIndex = ${JSON.stringify(svgsIndex)};\n\nexport const svgsGenders = ${JSON.stringify(svgsGenders)};`);
};

export default processSVGs;
