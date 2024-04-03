import React, { useState } from "react";
import { Face } from "../components/Face";
import { generate } from "../features/face_utils/generate";

const MoreSection = () => {

	return (
		<>
			<h2>More</h2>
			<p>
				<span>See all the available facial features in</span>
				<a href="editor.html">the faces.js editor</a>.
			</p>
			<p>
				For more documentation and information (additional options, SVG export, CLI),
				<a href="https://github.com/zengm-games/facesjs">
					see the README on GitHub
				</a>
			</p>
		</>
	)
}

const FaceWrapper = ({ index }: { index: number }) => {
	const [faceConfig, setFaceConfig] = useState(generate());
	const isLargeFace = index === 3;

	return (
		<span
			className={(isLargeFace ? 'col-span-2 row-span-2' : '')}
			style={{ width: isLargeFace ? 240 : 120 }}
			onClick={() => setFaceConfig(generate())}>
			<Face faceConfig={faceConfig} width={isLargeFace ? 240 : 120} />
		</span>
	);
};

const BunchOfFaces = ({ stateKey }: { stateKey: number }) => {
	return (
		<div className="flex justify-center">
			<div id="faces" className='cursor-pointer grid grid-rows-3 grid-cols-5 gap-5 w-fit'>
				{[...Array(12)].map((_, ind) => (
					<FaceWrapper key={ind} index={ind} />
				))}
			</div>
		</div>
	);
};

export const Home = (): JSX.Element => {
	const [stateKey, setStateKey] = useState(0);

	return (
		<body style={{ backgroundColor: '#ddd', fontFamily: 'Avro' }} className="flex justify-center h-full">
			<div id="container" className="w-[608px] text-center">
				<h1 className="text-xl font-bold">faces.js</h1>
				<h3>A JavaScript library for generating vector-based cartoon faces</h3>
				<BunchOfFaces stateKey={stateKey} />

				<p>
					<i>
						To load new random faces,
						<span className="cursor-pointer mx-1 font-bold	" onClick={() => setStateKey(prevKey => prevKey + 1)}>
							click here
						</span>
						or press "r" on your keyboard.
					</i>
				</p>
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
				<h2>Usage</h2>
				<p>1. Install from npm:</p>
				<pre><code>$ npm install --save facesjs</code></pre>
				<p>Or yarn:</p>
				<pre>
					<code>
						$ yarn add facesjs
					</code>
				</pre>
				<p>
					2. Display a randomly-generated face (the size of the
					<code>#my-div-id</code> div determines the size of the displayed face):
				</p>
				<pre><code>import {"{display, generate}"} from "facesjs";

					// Generate a random face \n
					const face = generate();

					// Display in a div with id "my-div-id"
					display("my-div-id", face);
				</code></pre>

				<MoreSection />
			</div>

			<a href="https://github.com/zengm-games/facesjs"
			>
				<img
					style={{ position: 'absolute', top: 0, right: 0, border: 0 }}
					src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png"
					alt="Fork me on GitHub"
				/></a>

		</body>

	)
}
