import { useState } from "react";
import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Plus } from "@mynaui/icons-react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { useGetBandSongsQuery } from "@/store/api/bandApi";
import { useGetSetSongsQuery, useAddSetSongMutation } from "@/store/api/setApi";

export default function AddSongToSetPage() {
	const { bandId, id: setId } = useParams<{ bandId: string; id: string }>();
	const [searchTerm, setSearchTerm] = useState("");

	const { data: bandSongsData, isLoading: isBandSongsLoading } = useGetBandSongsQuery(
		{ bandId: bandId! },
		{ skip: !bandId }
	);
	const { data: setSongsData, isLoading: isSetSongsLoading } = useGetSetSongsQuery(setId!, {
		skip: !setId,
	});

	const [addSong, { isLoading: isAdding }] = useAddSetSongMutation();

	const bandSongs = bandSongsData?.data || [];
	const setSongs = setSongsData?.data || [];
	const existingSongIds = new Set(setSongs.map((s) => s.song_id));

	const filteredSongs = bandSongs.filter((song) => {
		const matchesSearch =
			song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(song.artist && song.artist.toLowerCase().includes(searchTerm.toLowerCase()));
		return matchesSearch && !existingSongIds.has(song.id);
	});

	const handleAddSong = async (songId: string) => {
		if (!setId) return;
		try {
			// Calculate next position (last + 1)
			const nextPosition = setSongs.length > 0 ? Math.max(...setSongs.map((s) => s.position)) + 1 : 0;

			await addSong({
				setId,
				data: {
					song_id: songId,
					position: nextPosition,
				},
			}).unwrap();
			// We don't navigate away, allowing multiple adds
		} catch (error) {
			console.error("Failed to add song:", error);
		}
	};

	const isLoading = isBandSongsLoading || isSetSongsLoading;

	return (
		<div className="max-w-2xl mx-auto">
			<Link
				to={`/bands/${bandId}/sets/${setId}`}
				className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
			>
				<ArrowLeft className="w-5 h-5" />
				Back to Set
			</Link>

			<div className="mb-8">
				<h1 className="text-3xl font-heading font-bold mb-2">Add Songs to Set</h1>
				<p className="text-zinc-400">Select songs from your band's repertoire to add to this set</p>
			</div>

			<div className="mb-6">
				<InputField placeholder="Search songs..." value={searchTerm} onChange={setSearchTerm} />
			</div>

			{isLoading ? (
				<div className="text-center py-12">
					<div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
					<p className="text-zinc-500">Loading songs...</p>
				</div>
			) : filteredSongs.length === 0 ? (
				<div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800 border-dashed">
					<p className="text-zinc-400 mb-4">
						{searchTerm
							? "No songs found matching your search"
							: "No available songs to add (all band songs are already in this set)"}
					</p>
					{!searchTerm && (
						<Link to={`/bands/${bandId}/songs/add`}>
							<Button variant="secondary" size="sm">
								Add New Song to Band
							</Button>
						</Link>
					)}
				</div>
			) : (
				<div className="space-y-2">
					{filteredSongs.map((song) => (
						<motion.div
							key={song.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-zinc-700 transition-colors"
						>
							<div className="flex-1 min-w-0">
								<p className="text-white font-medium truncate">{song.title}</p>
								<div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 mt-1">
									{song.artist && <span>{song.artist}</span>}
									{song.key && <span>Key: {song.key}</span>}
								</div>
							</div>
							<Button
								size="sm"
								variant="secondary"
								onClick={() => handleAddSong(song.id)}
								disabled={isAdding}
								className="shrink-0"
							>
								<Plus className="w-4 h-4 mr-2" />
								Add
							</Button>
						</motion.div>
					))}
				</div>
			)}
		</div>
	);
}

