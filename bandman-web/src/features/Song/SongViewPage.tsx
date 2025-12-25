import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ChordLyrics, ChordBadge } from "@/components/ui/ChordLyrics";
import { extractChords, type NotationSystem } from "@/utils/chords";
import { useGetSongByIdQuery, useDeleteSongMutation } from "@/store/api/songApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export const SongViewPage = () => {
	const { id: songId, bandId } = useParams<{ id: string; bandId?: string }>();
	const navigate = useNavigate();
	const user = useSelector((state: RootState) => state.auth.user);

	const { data: songData, isLoading, error } = useGetSongByIdQuery(songId!, { skip: !songId });
	const song = songData?.data;

	const [deleteSong, { isLoading: isDeleting }] = useDeleteSongMutation();
	const [showChords, setShowChords] = useState(true);
	const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
	const [transpose, setTranspose] = useState(0);
	const [notation, setNotation] = useState<NotationSystem>(() => {
		return (localStorage.getItem("notationSystem") as NotationSystem) || "standard";
	});

	useEffect(() => {
		localStorage.setItem("notationSystem", notation);
	}, [notation]);

	const isOwner = user?.id === song?.owner_id;
	const detectedChords = song?.lyrics ? extractChords(song.lyrics) : [];

	const formatDuration = (seconds: number | null) => {
		if (!seconds) return null;
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const handleDelete = async () => {
		if (!songId) return;
		if (!confirm("Are you sure you want to delete this song? This action cannot be undone.")) return;

		try {
			await deleteSong(songId).unwrap();
			if (bandId) {
				navigate(`/bands/${bandId}?tab=songs`);
			} else {
				navigate("/");
			}
		} catch (err) {
			console.error("Failed to delete song:", err);
		}
	};

	const fontSizeClasses = {
		sm: "text-sm leading-relaxed",
		base: "text-base leading-relaxed",
		lg: "text-lg leading-loose",
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
			</div>
		);
	}

	if (error || !song) {
		return (
			<div className="text-center py-20">
				<h1 className="text-2xl font-bold text-white mb-4">Song Not Found</h1>
				<p className="text-zinc-400 mb-6">The song you're looking for doesn't exist or has been deleted.</p>
				<Link to={bandId ? `/bands/${bandId}` : "/"}>
					<Button variant="primary">Go Back</Button>
				</Link>
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="max-w-4xl mx-auto pb-16"
		>
			{/* Breadcrumb */}
			<div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
				<Link to="/" className="hover:text-zinc-300 transition-colors">
					Home
				</Link>
				<span>/</span>
				{bandId && (
					<>
						<Link to={`/bands/${bandId}`} className="hover:text-zinc-300 transition-colors">
							Band
						</Link>
						<span>/</span>
					</>
				)}
				<span className="text-zinc-300">{song.title}</span>
			</div>

			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
				<div className="w-full sm:w-auto">
					<h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 wrap-break-word">{song.title}</h1>
					{song.artist && <p className="text-lg sm:text-xl text-zinc-400">{song.artist}</p>}
				</div>
				{isOwner && (
					<div className="flex items-center gap-2 w-full sm:w-auto">
						<Link
							to={bandId ? `/bands/${bandId}/songs/${songId}/edit` : `/songs/${songId}/edit`}
							className="flex-1 sm:flex-none"
						>
							<Button variant="secondary" size="sm" className="w-full sm:w-auto">
								Edit
							</Button>
						</Link>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleDelete}
							isLoading={isDeleting}
							className="flex-1 sm:flex-none"
						>
							Delete
						</Button>
					</div>
				)}
			</div>

			{/* Song Info */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
				{song.key && (
					<div>
						<p className="text-zinc-500 text-sm mb-1">Key</p>
						<p className="text-white font-medium">{song.key}</p>
					</div>
				)}
				{song.tempo_bpm && (
					<div>
						<p className="text-zinc-500 text-sm mb-1">Tempo</p>
						<p className="text-white font-medium">{song.tempo_bpm} BPM</p>
					</div>
				)}
				{song.duration_seconds && (
					<div>
						<p className="text-zinc-500 text-sm mb-1">Duration</p>
						<p className="text-white font-medium">{formatDuration(song.duration_seconds)}</p>
					</div>
				)}
				{detectedChords.length > 0 && (
					<div>
						<p className="text-zinc-500 text-sm mb-1">Chords</p>
						<p className="text-white font-medium">{detectedChords.length} unique</p>
					</div>
				)}
			</div>

			{/* Chord Summary */}
			{detectedChords.length > 0 && (
				<div className="mb-8">
					<h2 className="text-zinc-500 text-sm mb-2">Chords Used</h2>
					<div className="flex flex-wrap gap-2">
						{detectedChords.map((chord) => (
							<ChordBadge key={chord} chord={chord} />
						))}
					</div>
				</div>
			)}

			{/* Notes */}
			{song.notes && (
				<div className="mb-8">
					<h2 className="text-amber-500 text-sm mb-2">Notes</h2>
					<p className="text-zinc-300 whitespace-pre-wrap">{song.notes}</p>
				</div>
			)}

			<div className="border-t border-zinc-800 my-12" />

			{/* Lyrics Display Controls */}
			{song.lyrics && (
				<div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden mb-6">
					{/* Controls */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-800 bg-zinc-900/80 gap-4">
						<h2 className="text-lg font-semibold text-white">Lyrics & Chords</h2>
						<div className="flex items-center gap-4 flex-wrap w-full sm:w-auto">
							{/* Transpose controls */}
							<div className="flex items-center gap-2">
								<span className="text-zinc-500 text-sm">Key:</span>
								<div className="flex items-center bg-zinc-800 rounded-lg overflow-hidden">
									<button
										onClick={() => setTranspose((t) => t - 1)}
										className="px-3 py-1 text-sm text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
									>
										-
									</button>
									<span className="px-2 text-sm text-zinc-300 min-w-[3ch] text-center">
										{transpose > 0 ? `+${transpose}` : transpose}
									</span>
									<button
										onClick={() => setTranspose((t) => t + 1)}
										className="px-3 py-1 text-sm text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
									>
										+
									</button>
								</div>
							</div>

							{/* Notation toggle */}
							<div className="flex items-center gap-2">
								<span className="text-zinc-500 text-sm">System:</span>
								<div className="flex items-center bg-zinc-800 rounded-lg overflow-hidden">
									<button
										onClick={() => setNotation("standard")}
										className={`px-3 py-1 text-sm transition-colors ${
											notation === "standard" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
										}`}
										title="Standard (B, Bb)"
									>
										Std
									</button>
									<button
										onClick={() => setNotation("european")}
										className={`px-3 py-1 text-sm transition-colors ${
											notation === "european" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
										}`}
										title="European (H, B)"
									>
										Eur
									</button>
								</div>
							</div>

							{/* Font size controls */}
							<div className="flex items-center gap-2">
								<span className="text-zinc-500 text-sm">Size:</span>
								<div className="flex items-center bg-zinc-800 rounded-lg overflow-hidden">
									{(["sm", "base", "lg"] as const).map((size) => (
										<button
											key={size}
											onClick={() => setFontSize(size)}
											className={`px-3 py-1 text-sm transition-colors ${
												fontSize === size ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
											}`}
										>
											{size === "sm" ? "S" : size === "base" ? "M" : "L"}
										</button>
									))}
								</div>
							</div>

							{/* Show/hide chords */}
							<button
								onClick={() => setShowChords(!showChords)}
								className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
									showChords
										? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
										: "bg-zinc-800 text-zinc-400 border border-zinc-700"
								}`}
							>
								<span>{showChords ? "Chords On" : "Chords Off"}</span>
							</button>
						</div>
					</div>

					{/* Lyrics content */}
					<div className="p-4 sm:p-6 pt-6 sm:pt-8 overflow-x-auto">
						<ChordLyrics
							content={song.lyrics}
							showChords={showChords}
							className={fontSizeClasses[fontSize]}
							transpose={transpose}
							notation={notation}
						/>
					</div>
				</div>
			)}

			{/* Back button */}
			<div className="mt-8 w-fit mx-auto">
				<Link to={bandId ? `/bands/${bandId}?tab=songs` : "/"}>
					<Button variant="ghost">
						<span className="mr-2">←</span> Back
					</Button>
				</Link>
			</div>
		</motion.div>
	);
};

export default SongViewPage;

