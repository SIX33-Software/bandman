import { AnimatedBackgroundLines } from "../../components/AnimatedBackgroundLines";

const HomePage = () => {
	return (
		<div className="flex flex-col items-center justify-center w-full min-h-full gap-4">
			<div className="absolute -top-1/3 w-full h-full">
				<AnimatedBackgroundLines />
			</div>
			<img src="/images/logo-full.svg" alt="Banner" className="h-3 opacity-50" />
			<h1 className="text-7xl font-heading">Pick a Band</h1>
			<p className="text-zinc-400">Choose one of your Bands to manage</p>

			<div className="flex items-stretch mt-12">
				{Array.from({ length: 3 }).map((_, idx) => (
					<div
						key={idx}
						className="w-96 h-52 bg-zinc-900/30 backdrop-blur-2xl rounded-xl mx-4 flex flex-col items-start justify-end p-5 gap-1"
					>
						<div className="mb-auto w-12 h-12 bg-zinc-900 rounded-full" />
						<div className="font-heading text-2xl font-bold text-white">My Band {idx + 1}</div>
						<div className="text-zinc-500 text-sm">3 Members</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default HomePage;

