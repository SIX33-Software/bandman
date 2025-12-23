import { motion } from "framer-motion";

interface AnimatedBackgroundLinesProps {
	className?: string;
	lineColor?: string;
	lineCount?: number;
}

export const AnimatedBackgroundLines = ({
	className = "",
	lineColor = "rgba(255, 140, 60, 0.1)",
	lineCount = 20,
}: AnimatedBackgroundLinesProps) => {
	// Generate an array of indices for the lines
	const lines = Array.from({ length: lineCount }, (_, i) => i);

	return (
		<div
			className={`absolute -z-1 inset-0 overflow-hidden pointer-events-none ${className}`}
			style={{
				maskImage: "linear-gradient(to bottom, black 0%, transparent 90%)",
				WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 90%)",
			}}
		>
			<svg
				className="w-full h-full blur-lg"
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				{lines.map((i) => (
					<motion.line
						key={i}
						// Start points (slanted)
						x1={-50 + (i * 200) / lineCount}
						y1={-90 + (i * 60) / lineCount}
						x2={-50 + (i * 200) / lineCount - 50}
						y2={0 + Math.pow(i, 2.5) / lineCount}
						stroke={lineColor}
						animate={{
							strokeWidth: [1, 10, 1],
						}}
						transition={{
							duration: i * 0.5 + 1,
							repeat: Infinity,
							ease: "easeInOut",
							delay: i * 0.1,
							repeatDelay: 0,
						}}
					/>
				))}
			</svg>
		</div>
	);
};

