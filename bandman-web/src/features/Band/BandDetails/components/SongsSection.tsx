import { Link } from "react-router";
import { motion } from "framer-motion";
import { useRemoveBandSongMutation } from "@/store/api/bandApi";
import { Button } from "@/components/ui/Button";
import type { Song } from "@/types";
import { LoadingState, EmptyState } from "./shared";

export const SongsSection = ({ songs, isLoading, bandId }: { songs?: Song[]; isLoading: boolean; bandId: string }) => {
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

