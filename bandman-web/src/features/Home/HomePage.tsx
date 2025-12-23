import { Link } from "react-router";
import { Plus } from "@mynaui/icons-react";
import { AnimatedBackgroundLines } from "../../components/AnimatedBackgroundLines";

import { useAuth } from "@/hooks";
import type { Band } from "@/types";
import { useGetBandsQuery } from "@/store";

const BandCard = ({ band }: { band: Band }) => {
	return (
		<Link
			to={`/bands/${band.id}`}
			className="w-96 h-52 bg-zinc-900/30 backdrop-blur-2xl rounded-xl flex flex-col items-start justify-end p-5 gap-1 hover:bg-zinc-900/50 transition-colors cursor-pointer"
		>
			{band.image_url ? (
				<img src={band.image_url} alt={band.name} className="mb-auto w-12 h-12 rounded-full object-cover" />
			) : (
				<div className="mb-auto w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center font-heading font-bold text-lg">
					{band.name.charAt(0).toUpperCase()}
				</div>
			)}
			<div className="font-heading text-2xl font-bold text-white">{band.name}</div>
			{band.description && <div className="text-zinc-500 text-sm line-clamp-1">{band.description}</div>}
		</Link>
	);
};

const CreateBandCard = () => {
	return (
		<Link
			to="/bands/new"
			className="w-96 h-52 bg-zinc-900/30 backdrop-blur-2xl rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-zinc-900/50 transition-colors cursor-pointer border-2 border-dashed border-zinc-800 hover:border-zinc-600"
		>
			<div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
				<Plus className="w-6 h-6 text-zinc-400" />
			</div>
			<div className="text-zinc-400 font-medium">Create a Band</div>
		</Link>
	);
};

const EmptyState = () => {
	return (
		<div className="flex flex-col items-center justify-center gap-6">
			<div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center">
				<Plus className="w-10 h-10 text-zinc-600" />
			</div>
			<div className="text-center">
				<h2 className="text-2xl font-heading font-bold text-white mb-2">No bands yet</h2>
				<p className="text-zinc-400 mb-6">Let's create your first band to get started</p>
				<Link
					to="/bands/new"
					className="inline-flex items-center gap-2 px-6 py-3 bg-white text-zinc-900 rounded-full font-medium hover:bg-zinc-200 transition-colors"
				>
					<Plus className="w-5 h-5" />
					Create your first band
				</Link>
			</div>
		</div>
	);
};

const LoadingState = () => {
	return (
		<div className="flex items-stretch mt-12">
			{Array.from({ length: 3 }).map((_, idx) => (
				<div
					key={idx}
					className="w-96 h-52 bg-zinc-900/30 backdrop-blur-2xl rounded-xl mx-4 flex flex-col items-start justify-end p-5 gap-1 animate-pulse"
				>
					<div className="mb-auto w-12 h-12 bg-zinc-800 rounded-full" />
					<div className="h-7 w-32 bg-zinc-800 rounded" />
					<div className="h-4 w-20 bg-zinc-800 rounded" />
				</div>
			))}
		</div>
	);
};

const HomePage = () => {
	const { user } = useAuth();
	const { data: bandsResponse, isLoading, error } = useGetBandsQuery(undefined, { skip: !user?.id });

	const bands = bandsResponse?.data ?? [];
	const hasBands = bands.length > 0;

	return (
		<div className="flex flex-col items-center justify-center w-full min-h-full gap-4">
			<div className="absolute top-0 w-full h-full pointer-events-none">
				<AnimatedBackgroundLines />
			</div>
			<img src="/images/logo-full.svg" alt="Banner" className="h-3 opacity-50" />
			<h1 className="text-7xl font-heading">Pick a Band</h1>
			<p className="text-zinc-400">Choose one of your Bands to manage</p>

			{isLoading ? (
				<LoadingState />
			) : error ? (
				<div className="mt-12 text-red-400">Failed to load bands. Please try again.</div>
			) : !hasBands ? (
				<div className="mt-12">
					<EmptyState />
				</div>
			) : (
				<div className="flex flex-wrap items-stretch justify-center mt-12 gap-8">
					{bands.map((band) => (
						<BandCard key={band.id} band={band} />
					))}
					<CreateBandCard />
				</div>
			)}
		</div>
	);
};

export default HomePage;

