import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
	useGetBandByIdQuery,
	useGetBandMembersQuery,
	useGetBandSongsQuery,
	useDeleteBandMutation,
} from "@/store/api/bandApi";
import { useGetSetsByBandQuery } from "@/store/api/setApi";
import { useGetGigsByBandQuery } from "@/store/api/gigApi";
import { Tabs, type TabsOption } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { MembersSection } from "./components/MembersSection";
import { SongsSection } from "./components/SongsSection";
import { SetsSection } from "./components/SetsSection";
import { GigsSection } from "./components/GigsSection";

type TabValue = "members" | "songs" | "sets" | "gigs";

const tabOptions: TabsOption<TabValue>[] = [
	{ label: "Members", value: "members" },
	{ label: "Songs", value: "songs" },
	{ label: "Sets", value: "sets" },
	{ label: "Gigs", value: "gigs" },
];
export const BandDetailsPage = () => {
	const { id: bandId } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<TabValue>("members");

	// Queries
	const { data: bandData, isLoading: isBandLoading } = useGetBandByIdQuery(bandId!, {
		skip: !bandId,
	});
	const { data: membersData, isLoading: isMembersLoading } = useGetBandMembersQuery(bandId!, {
		skip: !bandId,
	});
	const { data: songsData, isLoading: isSongsLoading } = useGetBandSongsQuery({ bandId: bandId! }, { skip: !bandId });
	const { data: setsData, isLoading: isSetsLoading } = useGetSetsByBandQuery(
		{ bandId: bandId!, params: {} },
		{ skip: !bandId }
	);
	const { data: gigsData, isLoading: isGigsLoading } = useGetGigsByBandQuery({ bandId: bandId! }, { skip: !bandId });

	// Mutations
	const [deleteBand, { isLoading: isDeleting }] = useDeleteBandMutation();

	const band = bandData?.data;
	const members = membersData?.data;
	const songs = songsData?.data;
	const sets = setsData?.data;
	const gigs = gigsData?.data;

	const handleDeleteBand = async () => {
		if (!bandId) return;
		if (confirm("Are you sure you want to delete this band? This action cannot be undone.")) {
			const result = await deleteBand(bandId);
			if (!("error" in result)) {
				navigate("/");
			}
		}
	};

	if (isBandLoading) {
		return (
			<div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
				<div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
			</div>
		);
	}

	if (!band) {
		return (
			<main className="max-w-4xl mx-auto py-12">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Band not found</h1>
					<Link to="/">
						<Button variant="secondary">Go back home</Button>
					</Link>
				</div>
			</main>
		);
	}

	return (
		<main className="max-w-4xl mx-auto pb-20">
			{band.image_url && (
				<img
					src={band.image_url}
					alt={band.name}
					className="w-full h-96 object-cover absolute top-0 left-0 -z-1 mask-b-from-0% mask-t-from-0% opacity-20"
				/>
			)}
			{/* Band Header */}
			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
				<div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
					{/* Band Image/Avatar */}
					<div className="w-24 h-24 rounded-2xl bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
						{band.image_url ? (
							<img src={band.image_url} alt={band.name} className="w-full h-full object-cover" />
						) : (
							<span className="text-4xl font-bold text-zinc-600">{band.name[0].toUpperCase()}</span>
						)}
					</div>

					{/* Band Info */}
					<div className="flex-1 min-w-0 w-full">
						<div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
							<div>
								<h1 className="text-2xl sm:text-3xl font-bold text-white">{band.name}</h1>
								{band.description && <p className="text-zinc-400 mt-2 line-clamp-2">{band.description}</p>}
							</div>

							{/* Actions */}
							<div className="flex items-center gap-2 shrink-0">
								<Link to={`/bands/${bandId}/edit`}>
									<Button variant="secondary" size="sm">
										Edit
									</Button>
								</Link>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleDeleteBand}
									disabled={isDeleting}
									className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
								>
									{isDeleting ? "Deleting..." : "Delete"}
								</Button>
							</div>
						</div>

						{/* Stats */}
						<div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-2 mt-4 text-sm text-zinc-500">
							<span>{members?.length || 0} members</span>
							<span>•</span>
							<span>{songs?.length || 0} songs</span>
							<span>•</span>
							<span>{sets?.length || 0} sets</span>
							<span>•</span>
							<span>{gigs?.length || 0} gigs</span>
						</div>
					</div>
				</div>
			</motion.div>

			{/* Tabs */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="mb-6"
			>
				<Tabs options={tabOptions} value={activeTab} onChange={setActiveTab} />
			</motion.div>

			{/* Tab Content */}
			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
				<AnimatePresence mode="wait">
					{activeTab === "members" && (
						<motion.div
							key="members"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							transition={{ duration: 0.2 }}
						>
							<MembersSection members={members} isLoading={isMembersLoading} bandId={bandId!} />
						</motion.div>
					)}
					{activeTab === "songs" && (
						<motion.div
							key="songs"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							transition={{ duration: 0.2 }}
						>
							<SongsSection songs={songs} isLoading={isSongsLoading} bandId={bandId!} />
						</motion.div>
					)}
					{activeTab === "sets" && (
						<motion.div
							key="sets"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							transition={{ duration: 0.2 }}
						>
							<SetsSection sets={sets} isLoading={isSetsLoading} bandId={bandId!} />
						</motion.div>
					)}
					{activeTab === "gigs" && (
						<motion.div
							key="gigs"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							transition={{ duration: 0.2 }}
						>
							<GigsSection gigs={gigs} isLoading={isGigsLoading} bandId={bandId!} />
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</main>
	);
};

export default BandDetailsPage;

