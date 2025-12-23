const CHORD_REGEX = /[{[]([A-GHa-gh][#b]?(?:m|maj|min|dim|aug|sus[24]?|add[0-9]+|[0-9]+)?(?:\/[A-GHa-gh][#b]?)?)[}\]]/g;

export function extractChords(content: string): string[] {
	const chords = new Set<string>();
	let match: RegExpExecArray | null;

	while ((match = CHORD_REGEX.exec(content)) !== null) {
		chords.add(match[1]);
	}

	return Array.from(chords);
}

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NORMALIZE_MAP: Record<string, string> = {
	Cb: "B",
	Db: "C#",
	Eb: "D#",
	Fb: "E",
	Gb: "F#",
	Ab: "G#",
	Bb: "A#",
	"E#": "F",
	"B#": "C",
	H: "B",
	h: "B",
};

export type NotationSystem = "standard" | "european";

function normalizeRoot(root: string): string {
	const titleCase = root.charAt(0).toUpperCase() + root.slice(1);
	return NORMALIZE_MAP[titleCase] || titleCase;
}

function getSemitone(root: string): number {
	const normalized = normalizeRoot(root);
	return NOTES.indexOf(normalized);
}

function transposeNote(note: string, semitones: number, notation: NotationSystem): string {
	const rootIndex = getSemitone(note);
	if (rootIndex === -1) return note;

	let newIndex = (rootIndex + semitones) % 12;
	if (newIndex < 0) newIndex += 12;

	if (notation === "european") {
		// European: A# -> B, B -> H
		if (newIndex === 10) return "B";
		if (newIndex === 11) return "H";
	}

	return NOTES[newIndex];
}

export function transformChord(chord: string, semitones: number, notation: NotationSystem): string {
	// Regex to split root from the rest
	// Roots: A-G, H, optionally # or b
	const rootRegex = /^([A-GHa-gh][#b]?)(.*)$/;
	const match = chord.match(rootRegex);

	if (!match) return chord;

	let [_, root, suffix] = match;

	// Check for bass note
	let bass = "";
	const slashIndex = suffix.indexOf("/");
	if (slashIndex !== -1) {
		bass = suffix.slice(slashIndex + 1);
		suffix = suffix.slice(0, slashIndex);
	}

	// Transpose Root
	const newRoot = transposeNote(root, semitones, notation);

	// Transpose Bass if exists
	let newBass = "";
	if (bass) {
		newBass = "/" + transposeNote(bass, semitones, notation);
	}

	return newRoot + suffix + newBass;
}
