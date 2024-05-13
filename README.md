# faces.js

A JavaScript library for generating vector-based cartoon faces

[![](examples.png)](https://zengm.com/facesjs/)

[See a live demo here.](https://zengm.com/facesjs/)

faces.js is a JavaScript library that generates and displays cartoon faces, somewhat reminiscent of Nintendo's Miis. Faces are drawn as SVGs and are also be represented by a small JavaScript object, which allows you to store that object and then draw the same face again later. There is also a [fancy web-based editor](https://zengm.com/facesjs/editor/) you can use to design faces.

Originally faces.js was made for [Basketball GM](https://basketball-gm.com/) and other games by [ZenGM](https://zengm.com/), but now it is used in several other projects.

## Installation

    npm install --save facesjs

## Use

Import it with ES modules:

    import { display, generate } from "facesjs";

or CommonJS:

    const { display, generate } = require("facesjs");

Then, generate a random face:

    const face = generate();

And display it:

    // Display in a div with id "my-div-id"
    display("my-div-id", face);

    // Display in a div you already have a reference to
    const element = document.getElementById("my-div-id");
    display(element, face);

If you'd like a non-random face, look inside the `face` variable and you'll see all the available options for a manually constructed face.

### Overrides

Both `display` and `generate` accept an optional argument, specifying values to override either the randomly generated face (for `generate`) or the supplied face (for `display`). For instance:

    # Generate a random face that always has blue skin
    const face = generate({ body: { color: "blue" } });

    # Display a face, but impose that it has blue skin
    display("my-div-id", face, { body: { color: "blue" } });

### Options

The `generate` function takes a second optional argument, which takes in extra parameters for player creation, in the form of an object.

Generate a female/male face (default is male):

    const face = generate(undefined, { gender: "female" });

Assign a race attribute that can be white, black, asian, or brown (default is random):

    const face = generate(undefined, { race: "white" });

Or both together:

    const face = generate(undefined, { gender: "female", race: "asian" });

## Exporting SVGs

### API

You can use `faceToSvgString` to convert a face object to an SVG string.

    import { faceToSvgString, generate } from "facesjs";

    const face = generate();
    const svg = faceToSvgString(face);

You can also specify overrides, similar to `display`:

    const svg = faceToSvgString(face, { body: { color: "blue" } });

`faceToSvgString` is intended to be used in Node.js If you are doing client-side JS, it would be more efficient to render a face to the DOM using `display` and then [convert it to a blob like this](https://github.com/zengm-games/facesjs/blob/19ce236af6adbf76db29c4e669210b30e1de0e1a/public/editor/downloadFace.ts#L61-L64).

### React integration

You can use the `display` function within any frontend JS framework, but for ease of use with the most popular one, this package includes a `Face` component for React.

    import { Face, generate } from "facesjs";
    import { useEffect } from "react";

    export const My = ({ face }) => {
        return <Face
            face={face}
            lazy
            style={{
                width: 100,
            }}
        >;
    };

Props of the `Face` component:

| Prop | Required | Type | Default | Description |
| - | - | - | - | - |
|`face` | Y | `FaceConfig` || Face object, output of `generate`. |
|`overrides` || `Overrides` || Optional overrides object, as described above. |
|`ignoreDisplayErrors` || `boolean` | `false` | If true, then any errors when internally running `display` will be suppressed. This is useful if you accept user-defined faces and you don't want errors from them to clog up your error logs. |
|`lazy` || `boolean` | `false` | If true, then application of overrides and rendering of the face will be delayed until this component is actually visible (as determined by an intersection observer). |
|`className` || `string` || If provided, will be put on the wrapper div. |
|`style` || `CSSProperties` || If provided, will be put on the wrapper div. |

### CLI

You can also use `facesjs` as a CLI program. All of the functionality from `generate` and `display` are available on the CLI too.

#### Examples

Output a random face to stdout:

    $ npx facesjs

Generate a blue female face and output to stdout:

    $ npx facesjs -j '{"body":{"color":"blue"}}' -g female

Generate a male white face and save it to test.svg:

    $ npx facesjs -r white -o test.svg

#### Options

    -h, --help          Prints this help
    -o, --output        Output filename to use rather than stdout
    -f, --input-file    Path to a faces.js JSON file to convert to SVG
    -j, --input-json    String faces.js JSON object to convert to SVG
    -r, --race          Race - white/black/asian/brown, default is random
    -g, --gender        Gender - male/female, default is male

`--input-file` and `--input-json` can specify either an entire face object or a partial face object. If it's a partial face object, the other features will be random.

## Development

Running `yarn run dev` will do a few things:

1. Give you a URL to open the face editor UI in your browser
2. Watch for changes to the code
3. Watch for changes to the facial feature SVG files
4. Update the face editor UI when any code or SVG changes

This lets you immediately see your changes as you work.

## Adding new facial features

Each face is assembled from multiple SVGs. You can see them within the "svg" folder. If you want to add another feature, just create an SVG (using a vector graphics editor like [Inkscape](https://inkscape.org/)) and put it in the appropriate folder. It should automatically work. If not, it's a bug, please let me know!

When creating SVGs, assume the size of the canvas is 400x600. For most features, it doesn't matter where you draw on the canvas because it will automatically identify your object and position it in the appropriate place. But for head and hair SVGs, position does matter. For those you do need to make sure they are in the correct place on a 400x600 canvas, same as the existing head and hair SVGs. Otherwise it won't know where to place the other facial features relative to the head and hair.

If you find it not quite placing a facial feature exactly where you want, it's because by default it finds the center of the eye/eyebrow/mouth/nose SVG and places that in a specific location. If that's not good for a certain facial feature, that behavior can be overridden in code. For instance, see how it's done in display.js for the "pinocchio" nose which uses the left side of the SVG rather than the center to place it.

If you want a brand new "class" of facial features (like facial hair, or earrings, or hats) you'll have to create a new subfolder within the "svg" folder and edit the code to recognize your new feature.

If you find any of this confusing, feel free to reach out to me for help! I would love for someone to help me make better looking faces :)

## Credits

[dumbmatter](https://github.com/dumbmatter) wrote most of the code, [TravisJB89](https://github.com/TravisJB89) made most of the graphics, [Lia Cui](https://liacui.carrd.co/) made most of the female graphics, [gurushida](https://github.com/gurushida) wrote the code to export faces as SVG strings, and [tomkennedy22](https://github.com/tomkennedy22) wrote most of the editor UI code.
