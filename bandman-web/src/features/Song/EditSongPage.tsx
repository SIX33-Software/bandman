import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { TextArea } from "@/components/ui/TextArea";
import { Select, type SelectOption } from "@/components/ui/Select";
import { ChordLyrics, ChordBadge } from "@/components/ui/ChordLyrics";
import { extractChords } from "@/utils/chords";
import { useGetSongByIdQuery, useUpdateSongMutation } from "@/store/api/songApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { Song } from "@/types";

const keyOptions: SelectOption[] = [
	{ label: "Select key...", value: "" },
	{ label: "C Major", value: "C" },
	{ label: "C# / Db Major", value: "C#" },
	{ label: "D Major", value: "D" },
	{ label: "D# / Eb Major", value: "D#" },
	{ label: "E Major", value: "E" },
	{ label: "F Major", value: "F" },
	{ label: "F# / Gb Major", value: "F#" },
	{ label: "G Major", value: "G" },
	{ label: "G# / Ab Major", value: "G#" },
	{ label: "A Major", value: "A" },
	{ label: "A# / Bb Major", value: "A#" },
	{ label: "B Major", value: "B" },
	{ label: "C Minor", value: "Cm" },
	{ label: "C# / Db Minor", value: "C#m" },
	{ label: "D Minor", value: "Dm" },
	{ label: "D# / Eb Minor", value: "D#m" },
	{ label: "E Minor", value: "Em" },
	{ label: "F Minor", value: "Fm" },
	{ label: "F# / Gb Minor", value: "F#m" },
	{ label: "G Minor", value: "Gm" },
	{ label: "G# / Ab Minor", value: "G#m" },
	{ label: "A Minor", value: "Am" },
	{ label: "A# / Bb Minor", value: "A#m" },
	{ label: "B Minor", value: "Bm" },
];

export const EditSongPage = () => {
	const { id: songId, bandId } = useParams<{ id: string; bandId?: string }>();
	const navigate = useNavigate();
	const user = useSelector((state: RootState) => state.auth.user);

	const { data: songData, isLoading: isLoadingSong } = useGetSongByIdQuery(songId!, { skip: !songId });
	const song = songData?.data;

	const isOwner = user?.id === song?.owner_id;

	if (isLoadingSong) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
			</div>
		);
	}

	if (!song) {
		return (
			<div className="text-center py-20">
				<h1 className="text-2xl font-bold text-white mb-4">Song Not Found</h1>
				<p className="text-zinc-400 mb-6">The song you're trying to edit doesn't exist.</p>
				<Link to={bandId ? `/bands/${bandId}` : "/"}>
					<Button variant="primary">Go Back</Button>
				</Link>
			</div>
		);
	}

	if (!isOwner) {
		return (
			<div className="text-center py-20">
				<h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
				<p className="text-zinc-400 mb-6">You don't have permission to edit this song.</p>
				<Link to={bandId ? `/bands/${bandId}/songs/${songId}` : `/songs/${songId}`}>
					<Button variant="primary">View Song</Button>
				</Link>
			</div>
		);
	}

	return <EditSongForm key={songId} song={song} songId={songId!} bandId={bandId} navigate={navigate} />;
};

const EditSongForm = ({
	song,
	songId,
	bandId,
	navigate,
}: {
	song: Song;
	songId: string;
	bandId?: string;
	navigate: ReturnType<typeof useNavigate>;
}) => {
	const [updateSong, { isLoading: isUpdating }] = useUpdateSongMutation();

	const [title, setTitle] = useState(song.title);
	const [artist, setArtist] = useState(song.artist ?? "");
	const [key, setKey] = useState(song.key ?? "");
	const [tempoBpm, setTempoBpm] = useState(song.tempo_bpm?.toString() ?? "");
	const [notes, setNotes] = useState(song.notes ?? "");
	const [lyrics, setLyrics] = useState(song.lyrics ?? "");
	const [showPreview, setShowPreview] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const initialDurationMinutes = song.duration_seconds ? Math.floor(song.duration_seconds / 60).toString() : "";
	const initialDurationSeconds = song.duration_seconds ? (song.duration_seconds % 60).toString() : "";
	const [durationMinutes, setDurationMinutes] = useState(initialDurationMinutes);
	const [durationSeconds, setDurationSeconds] = useState(initialDurationSeconds);

	const detectedChords = extractChords(lyrics);

	const calculateDurationSeconds = (): number | null => {
		const mins = parseInt(durationMinutes) || 0;
		const secs = parseInt(durationSeconds) || 0;
		if (mins === 0 && secs === 0) return null;
		return mins * 60 + secs;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!title.trim()) {
			setError("Title is required");
			return;
		}

		try {
			const payload = {
				title: title.trim(),
				artist: artist.trim() || null,
				key: key || null,
				tempo_bpm: tempoBpm ? parseInt(tempoBpm) : null,
				duration_seconds: calculateDurationSeconds(),
				notes: notes.length ? notes : null,
				lyrics: lyrics.length ? lyrics : null,
			};

			await updateSong({ id: songId, data: payload }).unwrap();

			if (bandId) {
				navigate(`/bands/${bandId}/songs/${songId}`);
			} else {
				navigate(`/songs/${songId}`);
			}
		} catch (err) {
			console.error("Failed to update song:", err);
			setError("Failed to update song. Please try again.");
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="max-w-4xl mx-auto"
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
				<Link
					to={bandId ? `/bands/${bandId}/songs/${songId}` : `/songs/${songId}`}
					className="hover:text-zinc-300 transition-colors"
				>
					{song.title}
				</Link>
				<span>/</span>
				<span className="text-zinc-300">Edit</span>
			</div>

			<h1 className="text-3xl font-heading text-white mb-2">Edit Song</h1>
			<p className="text-zinc-400 mb-8">Update song details, lyrics and chords</p>

			{error && <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 text-red-400">{error}</div>}

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Basic Info */}
				<div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
					<h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<InputField label="Song Title" placeholder="Enter song title" value={title} onChange={setTitle} required />
						<InputField
							label="Artist / Original Artist"
							placeholder="Enter artist name"
							value={artist}
							onChange={setArtist}
						/>

						<div>
							<label className="mb-2 block text-sm font-medium text-zinc-100">Key</label>
							<Select
								placeholder="Select key"
								options={keyOptions}
								value={key}
								onChange={(value) => setKey(String(value))}
							/>
						</div>

						<InputField
							label="Tempo (BPM)"
							type="number"
							placeholder="e.g., 120"
							value={tempoBpm}
							onChange={setTempoBpm}
						/>
						<div>
							<label className="block text-sm font-medium text-zinc-300 mb-2">Duration</label>
							<div className="flex items-center gap-2">
								<InputField
									type="number"
									placeholder="min"
									value={durationMinutes}
									onChange={setDurationMinutes}
									className="w-20"
								/>
								<span className="text-zinc-500">:</span>
								<InputField
									type="number"
									placeholder="sec"
									value={durationSeconds}
									onChange={setDurationSeconds}
									className="w-20"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Lyrics and Chords */}
				<div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h2 className="text-lg font-semibold text-white">Lyrics & Chords</h2>
							<p className="text-zinc-400 text-sm mt-1">
								Use <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-400">{"{Am}"}</code> or{" "}
								<code className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-400">{"[G]"}</code> syntax for chords
							</p>
						</div>
						<Button
							type="button"
							variant={showPreview ? "secondary" : "ghost"}
							size="sm"
							onClick={() => setShowPreview((prev) => !prev)}
						>
							{showPreview ? "Hide Preview" : "Show Preview"}
						</Button>
					</div>

					<div className={showPreview ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : ""}>
						<TextArea
							label="Lyrics with Chords"
							placeholder={`Enter lyrics with chord notations...

Example:
{Am}Hello, {G}world
{F}This is a {C}song`}
							value={lyrics}
							onChange={setLyrics}
							rows={14}
						/>

						{showPreview && (
							<div className="bg-zinc-950/40 border border-zinc-800 rounded-xl p-4">
								<p className="text-sm font-medium text-zinc-100 mb-2">Preview</p>
								<ChordLyrics content={lyrics} className="pt-4" />
							</div>
						)}
					</div>

					{/* Detected chords */}
					{detectedChords.length > 0 && (
						<div className="mt-4">
							<p className="text-sm text-zinc-400 mb-2">Detected chords:</p>
							<div className="flex flex-wrap gap-2">
								{detectedChords.map((chord) => (
									<ChordBadge key={chord} chord={chord} />
								))}
							</div>
						</div>
					)}
				</div>

				{/* Notes */}
				<div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
					<h2 className="text-lg font-semibold text-white mb-4">Additional Notes</h2>
					<TextArea
						label="Notes"
						placeholder="Any additional notes about the song (arrangement, cues, etc.)"
						value={notes}
						onChange={setNotes}
						rows={4}
					/>
				</div>

				{/* Actions */}
				<div className="flex items-center justify-between pt-4">
					<Link to={bandId ? `/bands/${bandId}/songs/${songId}` : `/songs/${songId}`}>
						<Button type="button" variant="ghost">
							← Cancel
						</Button>
					</Link>
					<Button type="submit" variant="primary" isLoading={isUpdating}>
						Save Changes
					</Button>
				</div>
			</form>
		</motion.div>
	);
};

export default EditSongPage;

