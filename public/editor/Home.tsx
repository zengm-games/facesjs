import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Face } from "./Face";
import { generate } from "../../src/generate";
import { GithubLogo } from "@phosphor-icons/react";

import { Snippet, Kbd, Button } from "@nextui-org/react";
import { encodeJSONForUrl } from "./utils";
import { FaceConfig } from "../../src/types";

const FaceWrapper = ({
  index,
  stateKey,
}: {
  index: number;
  stateKey: number;
}) => {
  const [faceConfig, setFaceConfig] = useState<FaceConfig>(
    generate() as FaceConfig,
  );

  // Upon face click, take that face to the Editor
  const navigate = useNavigate();
  const handleNavigate = () => {
    const encodedValue = encodeJSONForUrl(faceConfig);
    navigate(`/${encodedValue}`);
  };

  // Use statekey to trigger refresh upon clicking of R or refresh button
  useEffect(() => {
    setFaceConfig(generate() as FaceConfig);
  }, [stateKey]);

  let faceRef = useRef(null);

  const isLargeFace = index === 4;

  return (
    <div
      className={`cursor-pointer rounded-lg hover:bg-[#ccc] w-full ${isLargeFace ? " col-span-2 row-span-2" : ""}`}
      onClick={handleNavigate}
    >
      <Face
        faceConfig={faceConfig}
        maxWidth={isLargeFace ? 400 : 200}
        ref={faceRef}
      />
    </div>
  );
};

const BunchOfFaces = ({ stateKey }: { stateKey: number }) => {
  return (
    <div className="flex justify-center">
      <div id="faces" className="grid grid-rows-3 grid-cols-6 gap-5 w-fit">
        {[...Array(15)].map((_, ind) => (
          <FaceWrapper key={ind} index={ind} stateKey={stateKey} />
        ))}
      </div>
    </div>
  );
};

export const Home = () => {
  const [stateKey, setStateKey] = useState(0);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "r" || event.key === "R") {
        setStateKey((prevKey) => prevKey + 1);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <div
      style={{ backgroundColor: "#ddd", fontFamily: "Avro" }}
      className="flex justify-center w-svw"
    >
      <div
        id="container"
        className=" h-full w-screen md:w-3/5 lg:1/2 text-lg text-left mb-20"
      >
        <h1 className="text-6xl font-bold">faces.js</h1>
        <h3>A JavaScript library for generating vector-based cartoon faces</h3>
        <BunchOfFaces stateKey={stateKey} />

        <div className="my-4">
          <p className="italic">Click on a face to take it to the Editor</p>
          <p>
            To load new random faces,
            <Button
              className="font-bold mx-2 bg-none"
              size="sm"
              color="default"
              onClick={() => setStateKey((prevKey) => prevKey + 1)}
            >
              <span className="text-lg">click here</span>
            </Button>
            or press <Kbd>R</Kbd> on your keyboard.
          </p>
          <p>
            <span>See all the available facial features in</span>
            <Link to="editor" className="text-blue-900 ml-1.5 font-bold">
              the faces.js editor
            </Link>
            .
          </p>
        </div>
        <p className="py-1">
          <span className="font-bold">faces.js</span> is a JavaScript library
          that generates and displays cartoon faces, somewhat reminiscent of how
          the Nintendo Wii generates random Miis. Faces are drawn as scalable
          vector graphics (SVG). Each face can also be represented by a small
          JavaScript object, which allows you to store that object and then draw
          the same face again later.
        </p>
        <p className="py-1">
          Options for each feature (eyes, nose, mouth, etc.) are all drawn by
          users and maintainers, and contributions are always welcome! If you're
          interested in contibuting,
          <span className="mx-1 font-bold text-blue-900">
            <Link to="https://github.com/zengm-games/facesjs">
              fork it on GitHub
            </Link>
          </span>
          and add some new options!
        </p>
        <h2 className="text-3xl  mt-4">Usage</h2>
        <p className="font-bold mt-4">1. Install from npm:</p>
        <Snippet
          size="md"
          className="border-2 border-black overflow-x-scroll w-full"
        >
          npm install --save facesjs{" "}
        </Snippet>
        <p className="mt-2">Or yarn:</p>
        <Snippet
          size="md"
          className="border-2 border-black overflow-x-scroll w-full"
        >
          yarn add facesjs
        </Snippet>
        <p className="font-bold mt-4">
          2. Use the functions to generate & draw faces:
        </p>
        <Snippet
          size="md"
          className="border-2 border-black overflow-x-scroll w-full"
        >
          <span>{`import {display, generate} from "facesjs";`}</span>
          <span></span>
          <span>{"// Generate a random face"}</span>
          <span>{"const face = generate();"}</span>
          <span>{""}</span>
          <span>{'// Display in a div with id "my-div-id"'}</span>
          <span>{'display("my-div-id", face);'}</span>
        </Snippet>
        <p className="mt-2">Or use the element in React</p>
        <Snippet
          size="md"
          className="border-2 border-black language-jsx overflow-x-scroll w-full"
        >
          <span>{'import {Face} from "facesjs";'}</span>
          <span></span>
          <span>{"export const ExampleFaceElement = () => {"}</span>
          <span className="pl-4">{"// Generate a random face"}</span>
          <span className="pl-4">{"const faceConfig = generate();"}</span>
          <span></span>
          <span className="pl-4">{"// Display in a Face component"}</span>
          <span className="pl-4">
            {
              "// width determines the size of the displayed face, and is optional"
            }
          </span>
          <span className="pl-4">{"return ("}</span>
          <span className="pl-8">
            {"<Face faceConfig={faceConfig} width={200}>"}
          </span>
          <span className="pl-4">{");"}</span>
          <span>{"}"}</span>
        </Snippet>
        <Link
          className="flex md:absolute md:top-0 md:right-0 p-4 font-bold items-center"
          to="https://github.com/zengm-games/facesjs"
        >
          <GithubLogo size={24} weight="fill" />
          <span>Fork faces.js on Github!</span>
        </Link>
      </div>
    </div>
  );
};
