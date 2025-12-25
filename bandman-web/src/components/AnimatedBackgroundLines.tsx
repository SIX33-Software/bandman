import { motion } from "framer-motion";

interface AnimatedBackgroundLinesProps {
	className?: string;
	lineColor?: string;
	lineCount?: number;
}

export const AnimatedBackgroundLines = ({
	className = "",
	lineColor = "rgba(255, 255, 255, 0.1)",
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
				<defs>
					<linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor={lineColor} stopOpacity="1" />
						<stop offset="100%" stopColor={lineColor} stopOpacity="0" />
					</linearGradient>
				</defs>
				{lines.map((i) => (
					<motion.line
						key={i}
						// Start points (slanted)
						x1={50 + (i * 200) / lineCount}
						y1={-40 + (i * 5) / lineCount}
						x2={50 + (i * 200) / lineCount - 50}
						y2={0 + (i * 200) / lineCount}
						stroke="url(#line-gradient)"
						animate={{
							strokeWidth: [1, 10, 1],
						}}
						transition={{
							duration: i * 0.5 + 2,
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

