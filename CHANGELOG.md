# 5.0.2 (2025-09-09)

- Remove extra class names from some SVG elements, as they were not doing anything and had the potential to conflict with other class names (such as "outline" from Tailwind).

# 5.0.1 (2025-05-06)

- Remove extra files from build.

# 5.0.0 (2025-05-06)

- Got rid of CommonJS build and switched to ESM only, since Node 20+ can require(ESM).

# 4.3.3 (2025-03-23)

- Get rid of `generateRelative` export and instead just have a `relative` option on the normal `generate` function.

# 4.3.2 (2025-03-23)

- Don't override jersey/teamColors when making relatives, it just produces weird results.

# 4.3.1 (2025-03-23)

- Fix issue with some bundlers.

# 4.3.0 (2025-03-23)

- #58 - New `generateRelative` function to generate a face that is similar to an exisiting face, like a sibling/parent/child.

- #57 - faces.js recognizes if it has been opened from a ZenGM game, and in that case it displays a "Save" button in the bottom right corner that sends face data back to the page that opened it. (Other apps can use the same mechanism if they want, there's nothing specific to ZenGM in the code here.)

# 4.2.2 (2024-08-04)

- The `Face` React component should now be imported as:

  ```javascript
  // New correct way
  import { Face } from "facesjs/react";
  ```

  Rather than the way it was imported in version 4.2.0:

  ```javascript
  // Old wrong way
  import { Face } from "facesjs";
  ```

  The reason is because version 4.2.0 broke importing other facesjs exports in some non-React projects.

# 4.2.1 (2024-05-15)

- #47 - Restore the "shave" facial feature option to the editor, which was accidentally removed in v4.1.0.

# 4.2.0 (2024-05-13)

- Added a `Face` React component for easier integration with React.

- Renamed the `Face` type to `FaceConfig`.

# 4.1.1 (2024-05-06)

- Fixed the CommonJS build.

# 4.1.0 (2024-04-23)

- #35 - @tomkennedy22 rewrote the editor UI and added a ton of functionality. The main new features are a gallery of faces showing previews of all features you can select, and the ability to export a face in SVG or PNG format.

# 4.0.0 (2023-11-19)

- Added `faceToSvgString` function to output faces as SVG strings, rather than only rendering to the DOM via `display`.

- Added CLI for generating faces and outputting them as SVG strings.

# 3.8.2 (2023-03-15)

- Fixed the esm build.

# 3.8.1 (2023-02-25)

- Added back the "messy" and "messy-short" hairstyles which were accidentally deleted in v3.8.0.

# 3.8.0 (2023-02-25)

- Added a `gender` option to generate female faces, like `const face = faces.generate(null, { gender: "female" });`

# 3.7.4 (2022-07-08)

- Restore rate of accessories (such as headbands) being present.

# 3.7.3 (2022-06-16)

- Tweak baseball jersey/hat colors

# 3.7.2 (2022-03-28)

- Tweak baseball jersey/hat colors

# 3.7.1 (2022-03-27)

- Tweak baseball jersey/hat colors

# 3.7.0 (2022-03-25)

- Added baseball jerseys and hats from PR #2 - thank you @TravisJB89

# 3.6.0 (2021-08-18)

- Added new football jersey style from PR #20 - thank you @tomkennedy22

# 3.5.0 (2021-06-13)

- Added ability to select which facial features to randomize in the editor UI - thank you @gtabot

- Improved Asian skin tones - thank you /u/Duradello from Reddt

# 3.4.0 (2021-03-10)

- Added some additional jersey options for football and basketball - thank you @TravisJB89

# 3.3.1 (2021-02-20)

- Fixed bug where faces generated with v1 and displayed in the current version resulted in an error.

# 3.3.0 (2021-02-02)

- Added a hockey jersey and several new hair styles, head shapes, and body shapes - thank you @TravisJB89

# 3.2.0 (2020-12-24)

- Added 100+ new facial features - thank you @TravisJB89 and @domini7

- Added a new option "race" to generate a face with skin color corresponding to one of these four categories: asian, black, brown, white. Thank you @icedjuro

# 3.1.0 (2020-05-20)

- Added several new hair styles - thank you @TravisJB89
