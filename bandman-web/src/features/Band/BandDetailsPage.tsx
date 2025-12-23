import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
	useGetBandByIdQuery,
	useGetBandMembersQuery,
	useGetBandSongsQuery,
	useDeleteBandMutation,
	useRemoveBandMemberMutation,
	useRemoveBandSongMutation,
} from "@/store/api/bandApi";
import { useGetSetsByBandQuery } from "@/store/api/setApi";
import { useGetGigsByBandQuery } from "@/store/api/gigApi";
import Header from "@/components/Header";
import { Tabs, type TabsOption } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import type { BandMemberWithUser, Song, Set, Gig, BandRole } from "@/types";

type TabValue = "members" | "songs" | "sets" | "gigs";

const tabOptions: TabsOption<TabValue>[] = [
	{ label: "Members", value: "members" },
	{ label: "Songs", value: "songs" },
	{ label: "Sets", value: "sets" },
	{ label: "Gigs", value: "gigs" },
];

// Role badge component
const RoleBadge = ({ role }: { role: BandRole }) => {
	const roleStyles: Record<BandRole, string> = {
		owner: "bg-amber-500/20 text-amber-400 border-amber-500/30",
		admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
		member: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
	};

	return (
		<span className={`text-xs px-2 py-0.5 rounded-full border ${roleStyles[role]}`}>
			{role.charAt(0).toUpperCase() + role.slice(1)}
		</span>
	);
};

// Status badge component for gigs
const GigStatusBadge = ({ status }: { status: Gig["status"] }) => {
	const statusStyles = {
		scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
		completed: "bg-green-500/20 text-green-400 border-green-500/30",
		cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
	};

	return (
		<span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyles[status]}`}>
			{status.charAt(0).toUpperCase() + status.slice(1)}
		</span>
	);
};

// Members Section
const MembersSection = ({
	members,
	isLoading,
	bandId,
}: {
	members?: BandMemberWithUser[];
	isLoading: boolean;
	bandId: string;
}) => {
	const [removeMember, { isLoading: isRemoving }] = useRemoveBandMemberMutation();

	const handleRemoveMember = async (userId: string) => {
		if (confirm("Are you sure you want to remove this member?")) {
			await removeMember({ bandId, userId });
		}
	};

	if (isLoading) {
		return <LoadingState text="Loading members..." />;
	}

	if (!members || members.length === 0) {
		return (
			<EmptyState
				title="No members yet"
				description="Add members to your band to collaborate"
				actionLabel="Add Member"
				actionHref={`/bands/${bandId}/members/add`}
			/>
		);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between mb-4">
				<p className="text-zinc-400 text-sm">{members.length} member(s)</p>
				<Link to={`/bands/${bandId}/members/add`}>
					<Button variant="secondary" size="sm">
						Add Member
					</Button>
				</Link>
			</div>
			{members.map((member) => (
				<motion.div
					key={member.user_id}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
				>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-300">
							{member.user?.name?.[0]?.toUpperCase() || member.user?.email?.[0]?.toUpperCase() || "?"}
						</div>
						<div>
							<p className="text-white font-medium">{member.user?.name || "Unknown User"}</p>
							<p className="text-zinc-500 text-sm">{member.user?.email}</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<RoleBadge role={member.role} />
						{member.role !== "owner" && (
							<button
								onClick={() => handleRemoveMember(member.user_id)}
								disabled={isRemoving}
								className="text-zinc-500 hover:text-red-400 transition-colors p-1"
								title="Remove member"
							>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path
										fillRule="evenodd"
										d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						)}
					</div>
				</motion.div>
			))}
		</div>
	);
};

// Songs Section
const SongsSection = ({ songs, isLoading, bandId }: { songs?: Song[]; isLoading: boolean; bandId: string }) => {
	const [removeSong, { isLoading: isRemoving }] = useRemoveBandSongMutation();

	const handleRemoveSong = async (songId: string) => {
		if (confirm("Are you sure you want to remove this song from the band?")) {
			await removeSong({ bandId, songId });
		}
	};

	if (isLoading) {
		return <LoadingState text="Loading songs..." />;
	}

	if (!songs || songs.length === 0) {
		return (
			<EmptyState
				title="No songs yet"
				description="Add songs to your band's repertoire"
				actionLabel="Add Song"
				actionHref={`/bands/${bandId}/songs/add`}
			/>
		);
	}

	const formatDuration = (seconds: number | null) => {
		if (!seconds) return "--:--";
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between mb-4">
				<p className="text-zinc-400 text-sm">{songs.length} song(s)</p>
				<Link to={`/bands/${bandId}/songs/add`}>
					<Button variant="secondary" size="sm">
						Add Song
					</Button>
				</Link>
			</div>
			{songs.map((song) => (
				<motion.div
					key={song.id}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-zinc-700 transition-colors"
				>
					<Link to={`/bands/${bandId}/songs/${song.id}`} className="flex-1 min-w-0">
						<p className="text-white font-medium truncate hover:text-amber-400 transition-colors">{song.title}</p>
						<div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
							{song.artist && <span>{song.artist}</span>}
							{song.tempo_bpm && <span>{song.tempo_bpm} BPM</span>}
							{song.key && <span>Key: {song.key}</span>}
							<span>{formatDuration(song.duration_seconds)}</span>
						</div>
					</Link>
					<button
						onClick={(e) => {
							e.preventDefault();
							handleRemoveSong(song.id);
						}}
						disabled={isRemoving}
						className="text-zinc-500 hover:text-red-400 transition-colors p-1 ml-4"
						title="Remove song from band"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path
								fillRule="evenodd"
								d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
				</motion.div>
			))}
		</div>
	);
};

// Sets Section
const SetsSection = ({ sets, isLoading, bandId }: { sets?: Set[]; isLoading: boolean; bandId: string }) => {
	if (isLoading) {
		return <LoadingState text="Loading sets..." />;
	}

	if (!sets || sets.length === 0) {
		return (
			<EmptyState
				title="No sets yet"
				description="Create sets to organize your songs for performances"
				actionLabel="Create Set"
				actionHref={`/bands/${bandId}/sets/create`}
			/>
		);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between mb-4">
				<p className="text-zinc-400 text-sm">{sets.length} set(s)</p>
				<Link to={`/bands/${bandId}/sets/create`}>
					<Button variant="secondary" size="sm">
						Create Set
					</Button>
				</Link>
			</div>
			{sets.map((set) => (
				<Link key={set.id} to={`/bands/${bandId}/sets/${set.id}`}>
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors cursor-pointer"
					>
						<p className="text-white font-medium">{set.name}</p>
						{set.description && <p className="text-zinc-500 text-sm mt-1 line-clamp-2">{set.description}</p>}
						<p className="text-zinc-600 text-xs mt-2">Created {new Date(set.created_at).toLocaleDateString()}</p>
					</motion.div>
				</Link>
			))}
		</div>
	);
};

// Gigs Section
const GigsSection = ({ gigs, isLoading, bandId }: { gigs?: Gig[]; isLoading: boolean; bandId: string }) => {
	if (isLoading) {
		return <LoadingState text="Loading gigs..." />;
	}

	if (!gigs || gigs.length === 0) {
		return (
			<EmptyState
				title="No gigs yet"
				description="Schedule your upcoming performances"
				actionLabel="Schedule Gig"
				actionHref={`/bands/${bandId}/gigs/create`}
			/>
		);
	}

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatTime = (time: string | null) => {
		if (!time) return null;
		return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
		});
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between mb-4">
				<p className="text-zinc-400 text-sm">{gigs.length} gig(s)</p>
				<Link to={`/bands/${bandId}/gigs/create`}>
					<Button variant="secondary" size="sm">
						Schedule Gig
					</Button>
				</Link>
			</div>
			{gigs.map((gig) => (
				<Link key={gig.id} to={`/bands/${bandId}/gigs/${gig.id}`}>
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors cursor-pointer"
					>
						<div className="flex items-start justify-between">
							<div className="flex-1 min-w-0">
								<p className="text-white font-medium">{gig.name}</p>
								{gig.venue && <p className="text-zinc-400 text-sm mt-1">{gig.venue}</p>}
								<div className="flex items-center gap-2 mt-2 text-sm text-zinc-500">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
										<path
											fillRule="evenodd"
											d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
											clipRule="evenodd"
										/>
									</svg>
									<span>{formatDate(gig.date)}</span>
									{gig.start_time && (
										<>
											<span>•</span>
											<span>{formatTime(gig.start_time)}</span>
										</>
									)}
								</div>
							</div>
							<GigStatusBadge status={gig.status} />
						</div>
					</motion.div>
				</Link>
			))}
		</div>
	);
};

// Loading State Component
const LoadingState = ({ text }: { text: string }) => (
	<div className="flex flex-col items-center justify-center py-12">
		<div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mb-4" />
		<p className="text-zinc-500">{text}</p>
	</div>
);

// Empty State Component
const EmptyState = ({
	title,
	description,
	actionLabel,
	actionHref,
}: {
	title: string;
	description: string;
	actionLabel: string;
	actionHref: string;
}) => (
	<div className="flex flex-col items-center justify-center py-12 text-center">
		<div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="h-8 w-8 text-zinc-600"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
			</svg>
		</div>
		<h3 className="text-white font-medium mb-1">{title}</h3>
		<p className="text-zinc-500 text-sm mb-4">{description}</p>
		<Link to={actionHref}>
			<Button variant="secondary" size="sm">
				{actionLabel}
			</Button>
		</Link>
	</div>
);

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
			<div className="min-h-screen bg-zinc-950 text-white">
				<Header />
				<main className="max-w-4xl mx-auto px-6 py-12">
					<div className="text-center">
						<h1 className="text-2xl font-bold mb-4">Band not found</h1>
						<Link to="/">
							<Button variant="secondary">Go back home</Button>
						</Link>
					</div>
				</main>
			</div>
		);
	}

	return (
		<main className="max-w-4xl mx-auto px-6 py-8">
			{/* Band Header */}
			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
				<div className="flex items-start gap-6">
					{/* Band Image/Avatar */}
					<div className="w-24 h-24 rounded-2xl bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
						{band.image_url ? (
							<img src={band.image_url} alt={band.name} className="w-full h-full object-cover" />
						) : (
							<span className="text-4xl font-bold text-zinc-600">{band.name[0].toUpperCase()}</span>
						)}
					</div>

					{/* Band Info */}
					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h1 className="text-3xl font-bold text-white">{band.name}</h1>
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
						<div className="flex items-center gap-4 mt-4 text-sm text-zinc-500">
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

