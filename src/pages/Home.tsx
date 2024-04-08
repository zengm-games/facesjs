import React, { useEffect, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { Face } from "../components/Face";
import { generate } from "../tools/generate";
import { GithubLogo } from "@phosphor-icons/react";

import { Snippet, Kbd, Button } from '@nextui-org/react'
import { encodeJSONForUrl } from "../tools/utils";

const FaceWrapper = ({ index, stateKey }: { index: number, stateKey: number }) => {
	const [faceConfig, setFaceConfig] = useState(generate());

	// Upon face click, take that face to the Editor
	const navigate = useNavigate();
	const handleNavigate = () => {
		const encodedValue = encodeJSONForUrl(faceConfig);
		navigate(`/editor/${encodedValue}`);
	};

	// Use statekey to trigger refresh upon clicking of R or refresh button
	useEffect(() => {
		setFaceConfig(generate());
	}, [stateKey]);

	const isLargeFace = index === 3;

	return (
		<div
			className={`cursor-pointer rounded-lg hover:bg-[#ccc] ${isLargeFace ? 'col-span-2 row-span-2' : ''}`}
			style={{ width: isLargeFace ? '254px' : '120px' }}
			onClick={handleNavigate}
		>
			<Face faceConfig={faceConfig} width={isLargeFace ? 254 : 120} />
		</div >
	);
};

const BunchOfFaces = ({ stateKey }: { stateKey: number }) => {
	return (
		<div className="flex justify-center">
			<div id="faces" className='grid grid-rows-3 grid-cols-5 gap-5 w-fit'>
				{[...Array(12)].map((_, ind) => (
					<FaceWrapper key={ind} index={ind} stateKey={stateKey} />
				))}
			</div>
		</div>
	);
};

export const Home = (): JSX.Element => {
	const [stateKey, setStateKey] = useState(0);

	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (event.key === "r" || event.key === "R") {
				console.log('R key pressed');
				setStateKey(prevKey => prevKey + 1);
			}
		};

		window.addEventListener('keydown', handleKeyPress);

		return () => {
			window.removeEventListener('keydown', handleKeyPress);
		};
	}, []);

	return (
		<body style={{ backgroundColor: '#ddd', fontFamily: 'Avro' }} className="flex justify-center h-full text-lg">
			<div id="container" className="w-[608px] text-left">
				<h1 className="text-6xl font-bold">faces.js</h1>
				<h3>A JavaScript library for generating vector-based cartoon faces</h3>
				<BunchOfFaces stateKey={stateKey} />

				<div className="my-4">
					<p className="italic">
						Click on a face to take it to the Editor
					</p>
					<p>
						To load new random faces,
						<Button
							className="font-bold mx-2 bg-none"
							size="sm"
							color="default"
							onClick={() => setStateKey((prevKey) => prevKey + 1)}
						>
							<span className="text-lg">
								click here
							</span>
						</Button>
						or press <Kbd>R</Kbd> on your keyboard.
					</p>
					<p>
						<span>See all the available facial features in</span>
						<Link to="editor" className="text-blue-900 ml-1.5 font-bold">the faces.js editor</Link>.
					</p>
				</div>
				<p className="py-1">
					faces.js is a JavaScript library that generates and displays cartoon
					faces, somewhat reminiscent of how the Nintendo Wii generates random
					Miis. Faces are drawn as scalable vector graphics (SVG). Each face can
					also be represented by a small JavaScript object, which allows you to
					store that object and then draw the same face again later.
				</p>
				<p className="py-1">
					As you can probably tell, the number of options for each facial feature
					(eyes, nose, mouth, etc.) is fairly limited, and some of the current
					options are fairly crude.
				</p>
				<p className="py-1">
					So
					<span className="mx-1 font-bold">
						<Link to="https://github.com/zengm-games/facesjs">
							fork it on GitHub
						</Link>
					</span>
					and add some new options!
				</p>
				<h2 className="text-3xl  mt-4">
					Usage
				</h2>
				<p className='font-bold mt-4'>1. Install from npm:</p>
				<Snippet size='md'>npm install --save facesjs </Snippet>
				<p>Or yarn:</p>
				<Snippet size='md'>yarn add facesjs</Snippet>
				<p className='font-bold mt-4'>
					2. Use the functions to generate & draw faces:
				</p>
				<Snippet size='md'>
					<span>{`import {display, generate} from "facesjs";`}</span>
					<span></span>
					<span>{'// Generate a random face'}</span>
					<span>{'const face = generate();'}</span>
					<span>{''}</span>
					<span>{'// Display in a div with id "my-div-id"'}</span>
					<span>{'display("my-div-id", face);'}</span>
				</Snippet>
				<p>
					Or use the element in React
				</p>
				<Snippet size='md'  >
					<span>{'import {Face} from "facesjs";'}</span>
					<span></span>
					<span>{'export const ExampleReactElement = (): JSX.Element => {'}</span>
					<span className="pl-4">{'// Generate a random face'}</span>
					<span className="pl-4">{'const faceConfig = generate();'}</span>
					<span></span>
					<span className="pl-4">{'// Display in a Face component'}</span>
					<span className="pl-4">{'// width determines the size of the displayed face, and is optional'}</span>
					<span className="pl-4">{'return ('}</span>
					<span className="pl-8">{'<Face faceConfig={faceConfig} width={200}>'}</span>
					<span className="pl-4">{');'}</span>
					<span>{'}'}</span>
				</Snippet>
			</div>

			<Link
				className="flex absolute top-0 right-0 p-4 font-bold items-center"
				to="https://github.com/zengm-games/facesjs"
			>
				<GithubLogo
					size={24}
					weight="fill"
				/>
				<span>Fork faces.js on Github!</span>
			</Link>

		</body>

	)
}