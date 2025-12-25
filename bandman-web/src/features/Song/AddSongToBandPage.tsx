import { useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import debounce from "lodash/debounce";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { useSearchSongsQuery } from "@/store/api/songApi";
import { useAddBandSongMutation, useGetBandByIdQuery } from "@/store/api/bandApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { Song } from "@/types";

export const AddSongToBandPage = () => {
	const { id: bandId } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const user = useSelector((state: RootState) => state.auth.user);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	const { data: bandData } = useGetBandByIdQuery(bandId!, { skip: !bandId });
	const band = bandData?.data;

	const { data: searchResults, isLoading: isSearching } = useSearchSongsQuery(
		{ q: debouncedSearch },
		{ skip: debouncedSearch.length < 2 }
	);

	const [addSong, { isLoading: isAdding }] = useAddBandSongMutation();

	// Debounced search handler
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedSetSearch = useCallback(
		debounce((value: string) => {
			setDebouncedSearch(value);
		}, 300),
		[]
	);

	const handleSearchChange = (value: string) => {
		setSearchTerm(value);
		debouncedSetSearch(value);
	};

	const handleAddSong = async (songId: string) => {
		if (!bandId || !user?.id) return;
		try {
			await addSong({ bandId, data: { song_id: songId, added_by: user.id } }).unwrap();
			navigate(`/bands/${bandId}?tab=songs`);
		} catch (error) {
			console.error("Failed to add song:", error);
		}
	};

	const formatDuration = (seconds: number | null) => {
		if (!seconds) return "--:--";
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="max-w-2xl mx-auto"
		>
					{/* Breadcrumb */}
					<div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
						<Link to="/" className="hover:text-zinc-300 transition-colors">
							Home
						</Link>
						<span>/</span>
						<Link to={`/bands/${bandId}`} className="hover:text-zinc-300 transition-colors">
							{band?.name || "Band"}
						</Link>
						<span>/</span>
						<span className="text-zinc-300">Add Song</span>
					</div>

					<h1 className="text-3xl font-bold text-white mb-2">Add Song to Band</h1>
					<p className="text-zinc-400 mb-8">Search for an existing song or create a new one</p>

					{/* Search or Create */}
					<div className="space-y-6">
						{/* Search existing songs */}
						<div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
							<h2 className="text-lg font-semibold text-white mb-4">Search Existing Songs</h2>
							<InputField
								label="Search"
								placeholder="Search by song title or artist..."
								value={searchTerm}
								onChange={handleSearchChange}
							/>

							{/* Search Results */}
							<div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
								{isSearching && (
									<div className="flex items-center justify-center py-8">
										<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
									</div>
								)}

								{!isSearching && debouncedSearch.length >= 2 && searchResults?.data?.length === 0 && (
									<div className="text-center py-8 text-zinc-500">
										<p>No songs found matching "{debouncedSearch}"</p>
									</div>
								)}

								<AnimatePresence>
									{searchResults?.data?.map((song: Song) => (
										<motion.div
											key={song.id}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 flex items-center justify-between"
										>
											<div className="flex-1 min-w-0">
												<p className="text-white font-medium truncate">{song.title}</p>
												<div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 mt-1">
													{song.artist && <span>{song.artist}</span>}
													{song.key && <span>Key: {song.key}</span>}
													{song.tempo_bpm && <span>{song.tempo_bpm} BPM</span>}
													<span>{formatDuration(song.duration_seconds)}</span>
												</div>
											</div>
											<Button
												variant="secondary"
												size="sm"
												onClick={() => handleAddSong(song.id)}
												isLoading={isAdding}
											>
												Add
											</Button>
										</motion.div>
									))}
								</AnimatePresence>
							</div>
						</div>

						{/* Divider */}
						<div className="flex items-center gap-4">
							<div className="flex-1 border-t border-zinc-800"></div>
							<span className="text-zinc-500 text-sm">or</span>
							<div className="flex-1 border-t border-zinc-800"></div>
						</div>

						{/* Create new song */}
						<div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
							<h2 className="text-lg font-semibold text-white mb-2">Create a New Song</h2>
							<p className="text-zinc-400 text-sm mb-4">
								Can't find the song you're looking for? Create a new one with lyrics and chords.
							</p>
							<Link to={`/bands/${bandId}/songs/create`}>
								<Button variant="primary">Create New Song</Button>
							</Link>
						</div>
					</div>

			{/* Back button */}
			<div className="mt-8">
				<Link to={`/bands/${bandId}?tab=songs`}>
					<Button variant="ghost">← Back to Band</Button>
				</Link>
			</div>
		</motion.div>
	);
};

export default AddSongToBandPage;
