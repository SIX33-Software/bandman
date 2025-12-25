import { Link } from "react-router";
import { CircleNotchSolid } from "@mynaui/icons-react";
import { Button } from "@/components/ui/Button";

// Loading State Component
export const LoadingState = ({ text }: { text: string }) => (
	<div className="flex flex-col items-center justify-center py-12">
		<CircleNotchSolid className="w-8 h-8 animate-spin mb-4" />
		<p className="text-zinc-500">{text}</p>
	</div>
);

// Empty State Component
export const EmptyState = ({
	title,
	description,
	actionLabel,
	actionHref,
}: {
	title: string;
	description: string;
	actionLabel: string;
	actionHref: string;
}) => (
	<div className="flex flex-col items-center justify-center py-12 text-center">
		<div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="h-8 w-8 text-zinc-600"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
			</svg>
		</div>
		<h3 className="text-white font-medium mb-1">{title}</h3>
		<p className="text-zinc-500 text-sm mb-4">{description}</p>
		<Link to={actionHref}>
			<Button variant="secondary" size="sm">
				{actionLabel}
			</Button>
		</Link>
	</div>
);

