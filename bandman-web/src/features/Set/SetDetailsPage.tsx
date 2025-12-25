import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Reorder, useDragControls } from "framer-motion";
import { ArrowLeft, EditOne, Delete, Plus, Check, X, MenuSolid, Play } from "@mynaui/icons-react";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import {
	useGetSetByIdQuery,
	useGetSetSongsQuery,
	useDeleteSetMutation,
	useRemoveSetSongMutation,
	useUpdateSetSongMutation,
	useReorderSetSongsMutation,
} from "@/store/api/setApi";
import { useGetActiveSessionByBandQuery, useCreateSessionMutation } from "@/store/api/sessionApi";
import type { SetSong } from "@/types";

const SetSongItem = ({
	setSong,
	index,
	onRemove,
	isRemoving,
	setId,
	onDragEnd,
}: {
	setSong: SetSong;
	index: number;
	onRemove: (id: string) => void;
	isRemoving: boolean;
	setId: string;
	onDragEnd: () => void;
}) => {
	const dragControls = useDragControls();
	const [isEditingNote, setIsEditingNote] = useState(false);
	const [note, setNote] = useState(setSong.note || "");
	const [updateSong, { isLoading: isUpdating }] = useUpdateSetSongMutation();

	const handleSaveNote = async () => {
		if (note.trim() === setSong.note) {
			setIsEditingNote(false);
			return;
		}

		try {
			await updateSong({
				setId,
				songId: setSong.song_id,
				data: { note: note.trim() || undefined },
			}).unwrap();
			setIsEditingNote(false);
		} catch (error) {
			console.error("Failed to update note:", error);
		}
	};

	const formatDuration = (seconds: number | null) => {
		if (!seconds) return "--:--";
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<Reorder.Item
			value={setSong}
			id={setSong.id}
			dragListener={false}
			dragControls={dragControls}
			onDragEnd={onDragEnd}
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group hover:border-zinc-700 transition-colors relative"
		>
			<div className="flex items-center gap-4 flex-1 min-w-0">
				<div
					onPointerDown={(e) => dragControls.start(e)}
					className="cursor-grab text-zinc-600 hover:text-zinc-400 p-1 -ml-2 touch-none"
				>
					<MenuSolid className="w-5 h-5" />
				</div>
				<span className="text-zinc-500 font-mono w-6 text-center">{index + 1}</span>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<p className="text-white font-medium truncate">{setSong.song?.title || "Unknown Song"}</p>
						{!isEditingNote && setSong.note && (
							<button
								onClick={() => {
									setNote(setSong.note || "");
									setIsEditingNote(true);
								}}
								className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 hover:bg-amber-500/20 transition-colors text-left"
							>
								{setSong.note}
							</button>
						)}
						{!isEditingNote && !setSong.note && (
							<button
								onClick={() => setIsEditingNote(true)}
								className="text-xs text-zinc-600 hover:text-zinc-400 px-2 py-0.5 rounded border border-dashed border-zinc-700 hover:border-zinc-500 transition-colors opacity-0 group-hover:opacity-100"
							>
								+ Note
							</button>
						)}
					</div>

					{isEditingNote && (
						<div className="mt-2 flex items-center gap-2 max-w-md">
							<InputField
								value={note}
								onChange={setNote}
								placeholder="Add a note..."
								autoFocus
								className="h-8 text-sm"
							/>
							<Button size="sm" onClick={handleSaveNote} disabled={isUpdating} className="h-8 px-2">
								<Check className="w-4 h-4" />
							</Button>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => {
									setNote(setSong.note || "");
									setIsEditingNote(false);
								}}
								className="h-8 px-2"
							>
								<X className="w-4 h-4" />
							</Button>
						</div>
					)}

					<div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 mt-1">
						{setSong.song?.artist && <span>{setSong.song.artist}</span>}
						{setSong.song?.key && <span>Key: {setSong.song.key}</span>}
						{setSong.song?.duration_seconds && <span>{formatDuration(setSong.song.duration_seconds)}</span>}
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
				<button
					onClick={() => onRemove(setSong.song_id)}
					disabled={isRemoving}
					className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex items-center justify-center"
					title="Remove from set"
				>
					<Delete className="w-4 h-4" />
				</button>
			</div>
		</Reorder.Item>
	);
};

export default function SetDetailsPage() {
	const { bandId, id: setId } = useParams<{ bandId: string; id: string }>();
	const navigate = useNavigate();

	const { data: setData, isLoading: isSetLoading } = useGetSetByIdQuery(setId!, {
		skip: !setId,
	});
	const { data: songsData, isLoading: isSongsLoading } = useGetSetSongsQuery(setId!, {
		skip: !setId,
	});

	const [deleteSet, { isLoading: isDeleting }] = useDeleteSetMutation();
	const [removeSong, { isLoading: isRemovingSong }] = useRemoveSetSongMutation();
	const [reorderSongs] = useReorderSetSongsMutation();

	const { data: activeSessionData } = useGetActiveSessionByBandQuery(bandId!, { skip: !bandId });
	const [createSession, { isLoading: isCreatingSession }] = useCreateSessionMutation();
	const activeSession = activeSessionData?.data;

	const set = setData?.data;
	const songs = songsData?.data;

	const [localSongs, setLocalSongs] = useState<SetSong[]>([]);

	useEffect(() => {
		if (songs) {
			setLocalSongs(songs);
		}
	}, [songs]);

	const handleReorder = (newOrder: SetSong[]) => {
		setLocalSongs(newOrder);
	};

	const handleDragEnd = async () => {
		if (!setId || localSongs.length === 0) return;

		const reorderedSongs = localSongs.map((s, index) => ({
			song_id: s.song_id,
			position: index,
		}));

		try {
			await reorderSongs({ setId, data: { songs: reorderedSongs } }).unwrap();
		} catch (error) {
			console.error("Failed to reorder songs:", error);
		}
	};

	const handleStartSession = async () => {
		if (!setId || !bandId || !set) return;

		if (activeSession) {
			// If there's an active session, check if it's for this set
			if (activeSession.set_id === setId) {
				navigate(`/sessions/${activeSession.id}/live`);
			} else {
				if (confirm("There is already an active session for another set. Do you want to join it?")) {
					navigate(`/sessions/${activeSession.id}/live`);
				}
			}
			return;
		}

		try {
			const result = await createSession({
				band_id: bandId,
				set_id: setId,
				name: `${set.name} - Live`,
			}).unwrap();

			if (result.success && result.data) {
				navigate(`/sessions/${result.data.id}/live`);
			}
		} catch (error) {
			console.error("Failed to create session:", error);
		}
	};

	const handleDeleteSet = async () => {
		if (!setId || !bandId) return;
		if (confirm("Are you sure you want to delete this set? This action cannot be undone.")) {
			const result = await deleteSet(setId);
			if (!("error" in result)) {
				navigate(`/bands/${bandId}?tab=sets`);
			}
		}
	};

	const handleRemoveSong = async (songId: string) => {
		if (!setId) return;
		if (confirm("Are you sure you want to remove this song from the set?")) {
			await removeSong({ setId, songId });
		}
	};

	if (isSetLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
			</div>
		);
	}

	if (!set) {
		return (
			<div className="max-w-4xl mx-auto py-12 text-center">
				<h1 className="text-2xl font-bold mb-4">Set not found</h1>
				<Link to={`/bands/${bandId}?tab=sets`}>
					<Button variant="secondary">Back to Band</Button>
				</Link>
			</div>
		);
	}

	return (
		<main className="max-w-4xl pb-20 mx-auto">
			<Link
				to={`/bands/${bandId}?tab=sets`}
				className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
			>
				<ArrowLeft className="w-5 h-5" />
				Back to Band
			</Link>

			{/* Set Header */}
			<div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
				<div className="w-full sm:w-auto">
					<h1 className="text-3xl font-bold text-white mb-2">{set.name}</h1>
					{set.description && <p className="text-zinc-400">{set.description}</p>}
					<div className="flex items-center gap-4 mt-4 text-sm text-zinc-500">
						<span>{localSongs.length} songs</span>
						<span>•</span>
						<span>Created {new Date(set.created_at).toLocaleDateString()}</span>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
					<Button
						variant="primary"
						size="sm"
						onClick={handleStartSession}
						disabled={isCreatingSession}
						className="bg-green-600 hover:bg-green-500 text-white border-green-500"
					>
						<Play className="w-4 h-4 mr-2" />
						{activeSession ? "Join Live Session" : "Start Live Session"}
					</Button>
					<Link to={`/bands/${bandId}/sets/${setId}/edit`}>
						<Button variant="secondary" size="sm">
							<EditOne className="w-4 h-4 mr-2" />
							Edit
						</Button>
					</Link>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleDeleteSet}
						disabled={isDeleting}
						className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
					>
						<Delete className="w-4 h-4 mr-2" />
						Delete
					</Button>
				</div>
			</div>

			{/* Songs List */}
			<div className="space-y-4">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-bold text-white">Songs</h2>
					<Link to={`/bands/${bandId}/sets/${setId}/songs/add`}>
						<Button size="sm">
							<Plus className="w-4 h-4 mr-2" />
							Add Song
						</Button>
					</Link>
				</div>

				{isSongsLoading ? (
					<div className="text-center py-8 text-zinc-500">Loading songs...</div>
				) : !songs || songs.length === 0 ? (
					<div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800 border-dashed">
						<p className="text-zinc-400 mb-4">No songs in this set yet</p>
						<Link to={`/bands/${bandId}/sets/${setId}/songs/add`}>
							<Button variant="secondary" size="sm">
								Add Song
							</Button>
						</Link>
					</div>
				) : (
					<Reorder.Group axis="y" values={localSongs} onReorder={handleReorder} className="space-y-2">
						{localSongs.map((setSong: SetSong, index: number) => (
							<SetSongItem
								key={setSong.id}
								setSong={setSong}
								index={index}
								onRemove={handleRemoveSong}
								isRemoving={isRemovingSong}
								setId={setId!}
								onDragEnd={handleDragEnd}
							/>
						))}
					</Reorder.Group>
				)}
			</div>
		</main>
	);
}

