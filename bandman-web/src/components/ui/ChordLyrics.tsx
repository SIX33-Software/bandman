import { useMemo } from "react";
import classNames from "classnames";
import { transformChord, type NotationSystem } from "@/utils/chords";

interface ChordLyricsProps {
	content: string;
	className?: string;
	chordClassName?: string;
	showChords?: boolean;
	transpose?: number;
	notation?: NotationSystem;
}

interface Chunk {
	text: string;
	chord: string | null;
}

interface Word {
	chunks: Chunk[];
}

// Regex to match chords in brackets: {Am}, [G], {F#m7}, etc.
const CHORD_REGEX = /[{[]([A-GH][#b]?(?:m|maj|min|dim|aug|sus[24]?|add[0-9]+|[0-9]+)?(?:\/[A-GH][#b]?)?)[}\]]/gi;

function parseLineToChunks(line: string): Chunk[] {
	const chunks: Chunk[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	let currentChord: string | null = null;

	CHORD_REGEX.lastIndex = 0;

	while ((match = CHORD_REGEX.exec(line)) !== null) {
		const textBefore = line.slice(lastIndex, match.index);

		chunks.push({
			text: textBefore,
			chord: currentChord,
		});

		currentChord = match[1];
		lastIndex = match.index + match[0].length;
	}

	// Add remaining text
	chunks.push({
		text: line.slice(lastIndex),
		chord: currentChord,
	});

	// Filter out empty chunks at the start if they have no chord
	if (chunks.length > 0 && chunks[0].text === "" && chunks[0].chord === null) {
		chunks.shift();
	}

	return chunks;
}

function parseLineToWords(line: string): Word[] {
	const chunks = parseLineToChunks(line);
	const words: Word[] = [];
	let currentWordChunks: Chunk[] = [];

	for (const chunk of chunks) {
		const parts = chunk.text.split(/(\s+)/);
		let isFirstPart = true;

		for (const part of parts) {
			if (part === "") continue;

			const chordForPart = isFirstPart ? chunk.chord : null;
			if (isFirstPart) isFirstPart = false;

			if (/^\s+$/.test(part)) {
				// It's whitespace
				currentWordChunks.push({ text: part, chord: chordForPart });
				words.push({ chunks: currentWordChunks });
				currentWordChunks = [];
			} else {
				// It's text
				currentWordChunks.push({ text: part, chord: chordForPart });
			}
		}
	}

	if (currentWordChunks.length > 0) {
		words.push({ chunks: currentWordChunks });
	}

	return words;
}

/**
 * ChordLyrics component displays lyrics with chords positioned above.
 * Use chord syntax: {Am}lyrics or [G]lyrics
 *
 * The chord will appear directly above the text that follows it.
 * Supports text wrapping by words.
 */
export const ChordLyrics = ({
	content,
	className,
	chordClassName,
	showChords = true,
	transpose = 0,
	notation = "standard",
}: ChordLyricsProps) => {
	const lines = useMemo(() => {
		if (!content) return [];
		return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
	}, [content]);

	return (
		<div className={classNames("font-mono", className)}>
			{lines.map((line, lineIndex) => {
				if (line.trim() === "") {
					return <div key={lineIndex} className="h-[1.5em]" />;
				}

				const words = parseLineToWords(line);

				return (
					<div key={lineIndex} className="flex flex-wrap items-end leading-[3]">
						{words.map((word, wordIndex) => (
							<div key={wordIndex} className="inline-block whitespace-pre-wrap">
								{word.chunks.map((chunk, chunkIndex) => {
									const transformedChord = chunk.chord ? transformChord(chunk.chord, transpose, notation) : null;

									return (
										<span key={chunkIndex} className="relative inline-block">
											{showChords && transformedChord && (
												<span
													className={classNames(
														"absolute bottom-[1.7em] left-0 font-bold text-amber-400 whitespace-nowrap",
														chordClassName
													)}
													style={{ fontSize: "0.9em" }}
												>
													{transformedChord}
												</span>
											)}
											<span className="text-zinc-300">{chunk.text}</span>
										</span>
									);
								})}
							</div>
						))}
					</div>
				);
			})}
		</div>
	);
};

/**
 * Simple chord badge component
 */
export const ChordBadge = ({ chord, className }: { chord: string; className?: string }) => (
	<span
		className={classNames(
			"inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30",
			className
		)}
	>
		{chord}
	</span>
);

export default ChordLyrics;

