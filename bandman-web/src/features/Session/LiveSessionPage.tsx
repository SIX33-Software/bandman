import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useGetSessionByIdQuery, sessionApi } from "@/store/api/sessionApi";
import { useGetSetByIdQuery, useGetSetSongsQuery } from "@/store/api/setApi";
import { useWebSocket } from "@/providers/WebSocketProvider";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";
import { ChordLyrics } from "@/components/ui/ChordLyrics";
import { Button } from "@/components/ui/Button";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, List, X, Music, XOctagonSolid } from "@mynaui/icons-react";
import classNames from "classnames";
import type { NotationSystem } from "@/utils/chords";

const LiveSessionPage = () => {
	const { id: sessionId } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { user } = useAuth();
	const { socket, joinSession, leaveSession } = useWebSocket();

	const {
		data: sessionResponse,
		isLoading: isSessionLoading,
		refetch: refetchSession,
	} = useGetSessionByIdQuery(sessionId!);
	const session = sessionResponse?.data;

	const { data: setResponse, isLoading: isSetLoading } = useGetSetByIdQuery(session?.set_id || "", {
		skip: !session?.set_id,
	});
	const set = setResponse?.data;

	const { data: songsResponse, isLoading: isSongsLoading } = useGetSetSongsQuery(session?.set_id || "", {
		skip: !session?.set_id,
	});
	const songsData = songsResponse?.data;

	const [isQuickListOpen, setIsQuickListOpen] = useState(false);
	const [transpose, setTranspose] = useState(0);
	const [fontSize, setFontSize] = useState(16);
	const [notation, setNotation] = useState<NotationSystem>(() => {
		return (localStorage.getItem("notationSystem") as NotationSystem) || "standard";
	});

	useEffect(() => {
		localStorage.setItem("notationSystem", notation);
	}, [notation]);

	// Sync local state with session
	const currentSongPosition = session?.current_song_position || 0;

	const songs = useMemo(() => {
		if (!songsData) return [];
		return [...songsData].sort((a, b) => a.position - b.position);
	}, [songsData]);

	const currentSong = useMemo(() => {
		if (!songs.length) return null;
		return songs.find((s) => s.position === currentSongPosition) || songs[0];
	}, [songs, currentSongPosition]);

	// WebSocket Event Handling
	useEffect(() => {
		if (sessionId) {
			joinSession(sessionId);

			if (socket) {
				const handleSessionEvent = (event: any) => {
					switch (event.type) {
						case "song:changed":
						case "song:next":
						case "song:previous":
						case "session:resumed":
						case "session:paused":
						case "session:updated":
							refetchSession();
							break;
						case "session:ended":
							if (session?.band_id) {
								dispatch(sessionApi.util.invalidateTags([{ type: "Session", id: `BAND_${session.band_id}_ACTIVE` }]));
							}
							if (event.triggeredBy !== user?.id) {
								alert("Session ended by host");
							}
							navigate(-1);
							break;
					}
				};

				socket.on("session:event", handleSessionEvent);

				return () => {
					socket.off("session:event", handleSessionEvent);
				};
			}

			return () => {
				leaveSession(sessionId);
			};
		}
	}, [sessionId, joinSession, leaveSession, socket, refetchSession, navigate, session?.band_id, dispatch, user?.id]);

	const handleNextSong = () => {
		if (!session || !socket) return;
		socket.emit("session:control", {
			sessionId: session.id,
			action: "next",
		});
		setTranspose(0);
	};

	const handlePrevSong = () => {
		if (!session || !socket) return;
		socket.emit("session:control", {
			sessionId: session.id,
			action: "previous",
		});
		setTranspose(0);
	};

	const handleSelectSong = (songId: string, position: number) => {
		if (!session || !socket) return;
		socket.emit("session:control", {
			sessionId: session.id,
			action: "changeSong",
			songId,
			position,
		});
		setIsQuickListOpen(false);
		setTranspose(0);
	};
	const handleEndSession = () => {
		if (!sessionId || !socket) return;
		if (confirm("Are you sure you want to end this session for everyone?")) {
			socket.emit("session:control", {
				sessionId,
				action: "end",
			});
		}
	};

	if (isSessionLoading || isSetLoading || isSongsLoading) {
		return <div className="flex items-center justify-center h-dvh text-white">Loading session...</div>;
	}

	if (!session || !set) {
		return <div className="flex items-center justify-center h-dvh text-white">Session or Set not found</div>;
	}

	const isOwner = session.started_by === user?.id;

	return (
		<div className="fixed inset-0 h-dvh w-full bg-zinc-950 flex flex-col overflow-hidden">
			{/* Header */}
			<header className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/10 backdrop-blur-lg z-10">
				<div className="flex items-center gap-3 flex-1 min-w-0">
					<Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="w-8 h-8 p-0 shrink-0">
						<X className="w-5 h-5" />
					</Button>
					<div className="min-w-0">
						<h1 className="font-bold text-white leading-none truncate pr-2">{set.name}</h1>
						<p className="text-xs text-zinc-400 mt-0.5">
							{currentSongPosition + 1} / {songs.length}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					{isOwner && (
						<Button
							variant="ghost"
							size="icon"
							onClick={handleEndSession}
							className="w-8 h-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
							title="End Session"
						>
							<XOctagonSolid className="w-5 h-5 text-red-400" />
						</Button>
					)}
					<Button variant="ghost" size="icon" onClick={() => setIsQuickListOpen(true)} className="w-8 h-8 p-0">
						<List className="w-5 h-5" />
					</Button>
				</div>
			</header>

			{/* Main Content - Swipeable Area */}
			<div className="flex-1 relative overflow-hidden">
				<AnimatePresence mode="wait">
					<motion.div
						key={currentSong?.id || "empty"}
						className="h-full w-full overflow-y-auto p-4 pb-48 pt-12"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.2 }}
					>
						{currentSong && currentSong.song ? (
							<div className="max-w-3xl mx-auto">
								<div className="mb-8">
									<h2 className="text-2xl font-bold text-white mb-1">{currentSong.song.title}</h2>
									<p className="text-zinc-400">{currentSong.song.artist}</p>
									{currentSong.note && (
										<div className="my-4 flex flex-col gap-2 text-zinc-300 text-sm">
											<p className="text-amber-400">Note</p>
											{currentSong.note}
										</div>
									)}
									<div className="w-full h-px bg-zinc-800" />
								</div>

								<div style={{ fontSize: `${fontSize}px` }}>
									<ChordLyrics content={currentSong.song.lyrics || ""} transpose={transpose} notation={notation} />
								</div>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center h-full text-zinc-500">
								<Music className="w-12 h-12 mb-4 opacity-50" />
								<p>No song selected</p>
							</div>
						)}
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Controls Footer */}
			<div className="fixed -bottom-1 left-0 right-0 bg-zinc-900/50 backdrop-blur-md border-t border-zinc-800 p-4 pb-8 z-20">
				<div className="max-w-3xl mx-auto flex items-center justify-between gap-5">
					<div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
						<div className="flex items-center bg-zinc-800 rounded-lg p-1 shrink-0">
							<Button variant="ghost" size="sm" className="h-10 w-10 p-0" onClick={() => setTranspose((t) => t - 1)}>
								-
							</Button>
							<span className="w-10 text-center text-sm font-medium text-zinc-300">
								{transpose > 0 ? `+${transpose}` : transpose}
							</span>
							<Button variant="ghost" size="sm" className="h-10 w-10 p-0" onClick={() => setTranspose((t) => t + 1)}>
								+
							</Button>
						</div>
						<div className="flex items-center bg-zinc-800 rounded-lg p-1 shrink-0">
							<Button
								variant="ghost"
								size="sm"
								className="h-10 w-10 p-0"
								onClick={() => setFontSize((s) => Math.max(12, s - 2))}
							>
								A-
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="h-10 w-10 p-0"
								onClick={() => setFontSize((s) => Math.min(32, s + 2))}
							>
								A+
							</Button>
						</div>
						<div className="flex items-center bg-zinc-800 rounded-lg p-1 shrink-0">
							<Button
								variant="ghost"
								size="sm"
								className={classNames("h-10 px-3 text-xs", {
									"bg-zinc-700 text-white": notation === "standard",
									"text-zinc-400": notation !== "standard",
								})}
								onClick={() => setNotation("standard")}
							>
								Std
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className={classNames("h-10 px-3 text-xs", {
									"bg-zinc-700 text-white": notation === "european",
									"text-zinc-400": notation !== "european",
								})}
								onClick={() => setNotation("european")}
							>
								Eur
							</Button>
						</div>
					</div>

					{isOwner && (
						<div className="flex items-center gap-4 shrink-0">
							<Button
								variant="secondary"
								size="icon"
								className="rounded-full h-12 w-12"
								onClick={handlePrevSong}
								disabled={currentSongPosition <= 0}
							>
								<ChevronLeft className="w-6 h-6" />
							</Button>
							<Button
								variant="secondary"
								size="icon"
								className="rounded-full h-12 w-12"
								onClick={handleNextSong}
								disabled={currentSongPosition >= songs.length - 1}
							>
								<ChevronRight className="w-6 h-6" />
							</Button>
						</div>
					)}
				</div>
			</div>

			{/* Quick List Drawer */}
			<AnimatePresence>
				{isQuickListOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black/50 z-30 backdrop-blur-lg"
							onClick={() => setIsQuickListOpen(false)}
						/>
						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="fixed top-0 right-0 bottom-0 w-full sm:w-80 bg-zinc-950/40 z-40 flex flex-col"
						>
							<div className="p-4 border-b border-zinc-800 flex items-center justify-between">
								<h3 className="font-bold text-white">Set List</h3>
								<Button variant="ghost" size="icon" onClick={() => setIsQuickListOpen(false)} className="w-8 h-8 p-0">
									<X className="w-5 h-5" />
								</Button>
							</div>
							<div className="flex-1 overflow-y-auto">
								{songs.map((setSong, index) => (
									<button
										key={setSong.id}
										onClick={() => handleSelectSong(setSong.song_id, setSong.position)}
										className={classNames(
											"w-full text-left p-4 border-b border-zinc-800/50 hover:bg-zinc-800 transition-colors flex items-center gap-3",
											{
												"bg-zinc-800/30": currentSong?.id === setSong.id,
												"text-primary-400": currentSong?.id === setSong.id,
												"text-zinc-300": currentSong?.id !== setSong.id,
											}
										)}
									>
										<span className="text-zinc-500 font-mono text-sm w-6">{index + 1}</span>
										<div className="flex-1 min-w-0">
											<div className="font-medium truncate">{setSong.song?.title || "Unknown"}</div>
											<div className="text-xs text-zinc-500 truncate">{setSong.song?.artist}</div>
										</div>
										{setSong.note && <div className="w-2 h-2 rounded-full bg-amber-500" title="Has note" />}
									</button>
								))}
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
};

export default LiveSessionPage;

