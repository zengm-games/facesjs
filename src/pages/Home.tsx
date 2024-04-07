import React, { useEffect, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { Face } from "../components/Face";
import { generate } from "../tools/generate";
import { GithubLogo } from "@phosphor-icons/react";


import { Snippet, Tooltip } from '@nextui-org/react'
import { encodeJSONForUrl } from "../tools/utils";

const MoreSection = () => {

	return (
		<div className="mt-4 mb-20">
			<h2 className="text-3xl">More</h2>
			<p>
				For more documentation and information (additional options, SVG export, CLI),
				<Link to="https://github.com/zengm-games/facesjs">
					see the README on GitHub
				</Link>
			</p>
		</div>
	)
}

const FaceWrapper = ({ index, stateKey }: { index: number, stateKey: number }) => {
	// Using a key in the dependency array of useEffect to force regeneration
	const [faceConfig, setFaceConfig] = useState(generate());

	const navigate = useNavigate();

	const handleNavigate = () => {
		const encodedValue = encodeJSONForUrl(faceConfig);
		navigate(`/editor/${encodedValue}`);
	};

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

		// Add event listener for the key press
		window.addEventListener('keydown', handleKeyPress);

		// Cleanup the event listener on component unmount
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
					<p>
						<i>
							Click on a face to take it to the Editor
						</i>
					</p>
					<p>
						To load new random faces,
						<span
							className="cursor-pointer mx-1 font-bold	"
							onClick={() => setStateKey((prevKey) => prevKey + 1)}
						>
							click here
						</span>
						or press "r" on your keyboard.
						<p>
							<span>See all the available facial features in</span>
							<a href="editor" className="text-blue-900 ml-1.5 font-bold">the faces.js editor</a>.
						</p>
					</p>
				</div>
				<p>
					faces.js is a JavaScript library that generates and displays cartoon
					faces, somewhat reminiscent of how the Nintendo Wii generates random
					Miis. Faces are drawn as scalable vector graphics (SVG). Each face can
					also be represented by a small JavaScript object, which allows you to
					store that object and then draw the same face again later.
				</p>
				<p>
					As you can probably tell, the number of options for each facial feature
					(eyes, nose, mouth, etc.) is fairly limited, and some of the current
					options are fairly crude.</p>

				<p>
					So
					<span className="mx-1 font-bold">
						<a href="https://github.com/zengm-games/facesjs">
							fork it on GitHub
						</a>
					</span>
					and add some new options!
				</p>
				<h2 className="text-3xl  mt-4">
					Usage
				</h2>
				<p className='font-bold mt-4'>1. Install from npm:</p>
				<Snippet size='md' color="primary" >npm install --save facesjs </Snippet>
				<p>Or yarn:</p>
				<Snippet size='md' color="primary" >yarn add facesjs</Snippet>
				<p className='font-bold mt-4'>
					2. Use the functions to generate & draw faces:
				</p>
				<Snippet size='md' color="primary" >
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

				<Snippet size='md' color="primary" >
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

				<MoreSection />
			</div>

			<a
				className="flex absolute top-0 right-0 p-4 font-bold items-center"
				href="https://github.com/zengm-games/facesjs"
			>
				<GithubLogo
					size={24}
					weight="fill"
				/>
				<span>Fork faces.js on Github!</span>
			</a>

		</body>

	)
}