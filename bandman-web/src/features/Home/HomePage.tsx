import { Link } from "react-router";
import { Plus } from "@mynaui/icons-react";
import { AnimatedBackgroundLines } from "../../components/AnimatedBackgroundLines";

import { useAuth } from "@/hooks";
import type { Band } from "@/types";
import { useGetBandsQuery } from "@/store";
import { useGetUpcomingGigsForUserQuery } from "@/store/api/gigApi";

const BandCard = ({ band }: { band: Band }) => {
	return (
		<Link
			to={`/bands/${band.id}`}
			className="w-full sm:w-96 h-52 border-2 border-zinc-900 relative bg-zinc-900/30 backdrop-blur-2xl overflow-hidden rounded-xl flex flex-col items-start justify-end p-5 gap-1 hover:bg-zinc-900/50 transition-colors cursor-pointer"
		>
			{band.image_url && (
				<img
					src={band.image_url}
					alt={band.name}
					className="absolute w-full h-full top-0 left-0 object-cover -z-1 mask-b-from-0% opacity-50 mask-t-from-0%"
				/>
			)}

			{band.image_url ? (
				<img src={band.image_url} alt={band.name} className="mb-auto w-12 h-12 rounded-full object-cover" />
			) : (
				<div className="mb-auto w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center font-heading font-bold text-lg">
					{band.name.charAt(0).toUpperCase()}
				</div>
			)}
			<div className="font-heading text-2xl text-white">{band.name}</div>
			{band.description && <div className="text-zinc-500 text-sm line-clamp-1">{band.description}</div>}
		</Link>
	);
};

const CreateBandCard = () => {
	return (
		<Link
			to="/bands/new"
			className="w-full sm:w-96 h-52 bg-zinc-900/30 backdrop-blur-2xl rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-zinc-900/50 transition-colors cursor-pointer border-2 border-dashed border-zinc-800 hover:border-zinc-600"
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
		<div className="flex flex-col sm:flex-row flex-wrap justify-center items-stretch mt-12 gap-4 w-full max-w-6xl">
			{Array.from({ length: 3 }).map((_, idx) => (
				<div
					key={idx}
					className="w-full sm:w-96 h-52 bg-zinc-900/30 backdrop-blur-2xl rounded-xl flex flex-col items-start justify-end p-5 gap-1 animate-pulse"
				>
					<div className="mb-auto w-12 h-12 bg-zinc-800 rounded-full" />
					<div className="h-7 w-32 bg-zinc-800 rounded" />
					<div className="h-4 w-20 bg-zinc-800 rounded" />
				</div>
			))}
		</div>
	);
};

const UpcomingGigs = () => {
	const { data: gigsResponse, isLoading } = useGetUpcomingGigsForUserQuery();
	const gigs = gigsResponse?.data || [];

	if (isLoading) return null;
	if (gigs.length === 0) return null;

	return (
		<div className="w-full max-w-6xl mt-12">
			<h2 className="text-xl font-bold text-white mb-4">Upcoming Gigs</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{gigs.map((gig) => (
					<Link
						key={gig.id}
						to={`/bands/${gig.band_id}/gigs/${gig.id}`}
						className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2 hover:bg-zinc-900/50 transition-colors hover:border-zinc-700"
					>
						<div className="flex justify-between items-start">
							<div>
								<div className="text-white font-medium text-lg">{gig.name}</div>
								<div className="text-amber-500 text-sm font-medium">{gig.bands?.name}</div>
							</div>
							<div className="text-zinc-400 font-medium bg-zinc-800/50 px-2 py-1 rounded text-sm">
								{gig.price
									? new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(gig.price)
									: "TBD"}
							</div>
						</div>
						<div className="text-zinc-500 text-sm mt-auto pt-2 border-t border-zinc-800/50 flex items-center gap-2">
							<span>{new Date(gig.date).toLocaleDateString()}</span>
							{gig.venue && (
								<>
									<span>•</span>
									<span className="truncate">{gig.venue}</span>
								</>
							)}
						</div>
					</Link>
				))}
			</div>
		</div>
	);
};

const HomePage = () => {
	const { user } = useAuth();
	const { data: bandsResponse, isLoading, error } = useGetBandsQuery(undefined, { skip: !user?.id });

	const bands = bandsResponse?.data ?? [];
	const hasBands = bands.length > 0;

	return (
		<div className="flex flex-col items-center justify-center w-full min-h-full gap-4 pb-24">
			<div className="absolute top-0 w-full h-full pointer-events-none">
				<img
					src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
					alt=""
					className="absolute top-0 left-0 w-full h-full object-cover -z-1 mask-b-from-0% mask-t-from-0% opacity-30 "
				/>
				<AnimatedBackgroundLines />
			</div>
			<img src="/images/logo-full.svg" alt="Banner" className="h-3 opacity-50" />
			<h1 className="text-5xl sm:text-7xl font-heading text-center">Pick a Band</h1>
			<p className="text-zinc-400 text-center">Choose one of your Bands to manage</p>

			{isLoading ? (
				<LoadingState />
			) : error ? (
				<div className="mt-12 text-red-400">Failed to load bands. Please try again.</div>
			) : !hasBands ? (
				<div className="mt-12">
					<EmptyState />
				</div>
			) : (
				<div className="flex flex-wrap items-stretch justify-center mt-12 gap-4 sm:gap-8 w-full">
					{bands.map((band) => (
						<BandCard key={band.id} band={band} />
					))}
					<CreateBandCard />
				</div>
			)}

			<UpcomingGigs />
		</div>
	);
};

export default HomePage;

