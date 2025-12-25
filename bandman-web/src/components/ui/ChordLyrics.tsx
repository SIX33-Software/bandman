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

interface ChordPosition {
	chord: string;
	position: number; // character position in the lyrics line
}

interface ParsedLine {
	lyrics: string;
	chords: ChordPosition[];
	hasChords: boolean;
}

// Regex to match chords in brackets: {Am}, [G], {F#m7}, etc.
const CHORD_REGEX = /[{[]([A-GH][#b]?(?:m|maj|min|dim|aug|sus[24]?|add[0-9]+|[0-9]+)?(?:\/[A-GH][#b]?)?)[}\]]/gi;

/**
 * Parses a line with inline chord syntax: {Chord} or [Chord]
 * Returns the clean lyrics text and chord positions
 *
 * Example: "{Am}Hello {G}world" -> lyrics: "Hello world", chords: [{chord: "Am", position: 0}, {chord: "G", position: 6}]
 */
function parseLine(line: string): ParsedLine {
	const chords: ChordPosition[] = [];
	let lyrics = "";
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	CHORD_REGEX.lastIndex = 0;

	while ((match = CHORD_REGEX.exec(line)) !== null) {
		// Add text before the chord to lyrics
		const textBefore = line.slice(lastIndex, match.index);
		lyrics += textBefore;

		// Record chord at current position in the clean lyrics
		chords.push({
			chord: match[1],
			position: lyrics.length,
		});

		lastIndex = match.index + match[0].length;
	}

	// Add remaining text after last chord
	lyrics += line.slice(lastIndex);

	return {
		lyrics,
		chords,
		hasChords: chords.length > 0,
	};
}

/**
 * ChordLyrics component displays lyrics with chords positioned above.
 * Use chord syntax: {Am}lyrics or [G]lyrics
 *
 * The chord will appear directly above the character that follows it.
 * Example: "{Am}Hello {G}world" renders as:
 *   Am    G
 *   Hello world
 */
export const ChordLyrics = ({
	content,
	className,
	chordClassName,
	showChords = true,
	transpose = 0,
	notation = "standard",
}: ChordLyricsProps) => {
	const lines = useMemo<ParsedLine[]>(() => {
		if (!content) return [];
		return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").map(parseLine);
	}, [content]);

	const renderLine = (line: ParsedLine, lineIndex: number) => {
		const isEmptyLine = line.lyrics.trim() === "" && line.chords.length === 0;

		if (isEmptyLine) {
			return (
				<div key={lineIndex} className="h-6">
					{"\u00A0"}
				</div>
			);
		}

		// If no chords or chords are hidden, just render the lyrics
		if (!line.hasChords || !showChords) {
			return (
				<div key={lineIndex} className="text-zinc-300">
					{line.lyrics || "\u00A0"}
				</div>
			);
		}

		// Render with chords above - using relative positioning
		return (
			<div key={lineIndex} className="mb-1">
				{/* Chord line */}
				<div className="relative h-5 font-mono">
					{line.chords.map((chordPos, chordIndex) => {
						const transformedChord = transformChord(chordPos.chord, transpose, notation);
						return (
							<span
								key={chordIndex}
								className={classNames("absolute font-bold text-amber-400 whitespace-nowrap", chordClassName)}
								style={{
									left: `${chordPos.position}ch`,
								}}
							>
								{transformedChord}
							</span>
						);
					})}
				</div>
				{/* Lyrics line */}
				<div className="text-zinc-300 font-mono whitespace-pre">{line.lyrics || "\u00A0"}</div>
			</div>
		);
	};

	return <div className={classNames("font-mono", className)}>{lines.map(renderLine)}</div>;
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

