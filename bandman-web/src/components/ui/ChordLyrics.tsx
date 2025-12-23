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

interface ParsedLine {
	type: "lyrics" | "chords-only";
	segments: Array<{
		text: string;
		chord?: string;
	}>;
}

type RenderRow =
	| { kind: "single"; line: ParsedLine }
	| { kind: "chords-above"; chordsLine: string; lyricsLine: string };

const CHORD_CORE = "[A-GH]([#b])?(?:m|maj|min|dim|aug|sus[24]?|add[0-9]+|[0-9]+)?(?:\\/[A-GH][#b]?)?";

const INLINE_CHORD_REGEX = new RegExp(`[{[](${CHORD_CORE})[}\\]]`, "gi");
const CHORD_TOKEN_REGEX = new RegExp(CHORD_CORE, "gi");

function parseChordOnlySegments(line: string): Array<{ text: string; isChord: boolean }> {
	const segments: Array<{ text: string; isChord: boolean }> = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = CHORD_TOKEN_REGEX.exec(line)) !== null) {
		const before = line.slice(lastIndex, match.index);
		if (before) segments.push({ text: before, isChord: false });
		segments.push({ text: match[0], isChord: true });
		lastIndex = match.index + match[0].length;
	}

	const remaining = line.slice(lastIndex);
	if (remaining) segments.push({ text: remaining, isChord: false });

	return segments.length ? segments : [{ text: line, isChord: false }];
}

function isChordLine(line: string): boolean {
	CHORD_TOKEN_REGEX.lastIndex = 0;
	const hasAnyChord = CHORD_TOKEN_REGEX.test(line);
	if (!hasAnyChord) return false;

	// If we remove chords, what's left should only be spacing/separators.
	const leftover = line
		.replace(CHORD_TOKEN_REGEX, "")
		.replace(/[\s|.-]/g, "")
		.trim();
	return leftover.length === 0;
}

/**
 * Parses lyrics with chord syntax: {Chord}lyrics or [Chord]lyrics
 * Example: "{Am}Hello {G}world" or "[Am]Hello [G]world"
 *
 * Supports both curly braces {} and square brackets []
 */
function parseChordLine(line: string): ParsedLine {
	// Match both {Chord} and [Chord] syntax
	const chordRegex = INLINE_CHORD_REGEX;
	chordRegex.lastIndex = 0;

	const segments: ParsedLine["segments"] = [];
	let lastIndex = 0;
	let hasLyrics = false;
	let match: RegExpExecArray | null;

	while ((match = chordRegex.exec(line)) !== null) {
		// Text before the chord (if any)
		const textBefore = line.slice(lastIndex, match.index);
		if (textBefore) {
			// Check if previous segment has a chord waiting for lyrics
			if (segments.length > 0 && segments[segments.length - 1].chord && !segments[segments.length - 1].text) {
				segments[segments.length - 1].text = textBefore;
				hasLyrics = hasLyrics || textBefore.trim().length > 0;
			} else {
				segments.push({ text: textBefore });
				hasLyrics = hasLyrics || textBefore.trim().length > 0;
			}
		}

		// Add the chord (it will grab the following text)
		segments.push({ text: "", chord: match[1] });
		lastIndex = match.index + match[0].length;
	}

	// Remaining text after last chord
	const remaining = line.slice(lastIndex);
	if (remaining) {
		if (segments.length > 0 && segments[segments.length - 1].chord && !segments[segments.length - 1].text) {
			segments[segments.length - 1].text = remaining;
			hasLyrics = hasLyrics || remaining.trim().length > 0;
		} else {
			segments.push({ text: remaining });
			hasLyrics = hasLyrics || remaining.trim().length > 0;
		}
	}

	// If no segments were created, just return the line as text
	if (segments.length === 0) {
		return { type: "lyrics", segments: [{ text: line }] };
	}

	// Determine if this is a chord-only line or has lyrics
	const type = hasLyrics ? "lyrics" : "chords-only";

	return { type, segments };
}

/**
 * ChordLyrics component displays lyrics with highlighted chords.
 * Use chord syntax: {Am}lyrics or [G]lyrics
 */
export const ChordLyrics = ({
	content,
	className,
	chordClassName,
	showChords = true,
	transpose = 0,
	notation = "standard",
}: ChordLyricsProps) => {
	const rows = useMemo<RenderRow[]>(() => {
		if (!content) return [];
		const rawLines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
		const nextRows: RenderRow[] = [];

		for (let index = 0; index < rawLines.length; index++) {
			const current = rawLines[index] ?? "";
			const next = rawLines[index + 1];

			if (next !== undefined && isChordLine(current)) {
				nextRows.push({ kind: "chords-above", chordsLine: current, lyricsLine: next });
				index++;
				continue;
			}

			nextRows.push({ kind: "single", line: parseChordLine(current) });
		}

		return nextRows;
	}, [content]);

	const renderParsedLine = (line: ParsedLine) => {
		const isBlank = line.segments.every((s) => s.text === "");
		if (isBlank) {
			return <span className="text-zinc-300">{"\u00A0"}</span>;
		}

		return (
			<>
				{line.segments.map((segment, segIndex) => (
					<span key={segIndex} className="inline">
						{showChords && segment.chord ? (
							<span className="inline-flex flex-col align-baseline">
								<span className={classNames("font-bold text-amber-400 leading-none mb-1", chordClassName)}>
									{transformChord(segment.chord, transpose, notation)}
								</span>
								<span className="text-zinc-100 leading-none h-0">{segment.text || "\u200B"}</span>
							</span>
						) : (
							<span className="text-zinc-300 leading-none">{segment.text}</span>
						)}
					</span>
				))}
			</>
		);
	};

	return (
		<div className={classNames("whitespace-pre-wrap", className)}>
			{rows.map((row, rowIndex) => {
				if (row.kind === "chords-above") {
					const chordSegments = parseChordOnlySegments(row.chordsLine);
					const lyricLine = parseChordLine(row.lyricsLine);

					return (
						<div key={rowIndex}>
							{showChords && (
								<div className="font-bold whitespace-pre-wrap leading-none mb-1">
									{chordSegments.map((seg, segIndex) => (
										<span
											key={segIndex}
											className={classNames(
												seg.isChord ? "text-amber-400" : "text-zinc-400",
												seg.isChord ? chordClassName : undefined
											)}
										>
											{seg.isChord ? transformChord(seg.text, transpose, notation) : seg.text}
										</span>
									))}
								</div>
							)}

							<div>{renderParsedLine(lyricLine)}</div>
						</div>
					);
				}

				return <div key={rowIndex}>{renderParsedLine(row.line)}</div>;
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

