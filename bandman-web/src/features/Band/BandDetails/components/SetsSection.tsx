import { Link } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import type { Set } from "@/types";
import { LoadingState, EmptyState } from "./shared";

export const SetsSection = ({ sets, isLoading, bandId }: { sets?: Set[]; isLoading: boolean; bandId: string }) => {
	if (isLoading) {
		return <LoadingState text="Loading sets..." />;
	}

	if (!sets || sets.length === 0) {
		return (
			<EmptyState
				title="No sets yet"
				description="Create sets to organize your songs for performances"
				actionLabel="Create Set"
				actionHref={`/bands/${bandId}/sets/create`}
			/>
		);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between mb-4">
				<p className="text-zinc-400 text-sm">{sets.length} set(s)</p>
				<Link to={`/bands/${bandId}/sets/create`}>
					<Button variant="secondary" size="sm">
						Create Set
					</Button>
				</Link>
			</div>
			{sets.map((set) => (
				<Link key={set.id} to={`/bands/${bandId}/sets/${set.id}`}>
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors cursor-pointer"
					>
						<p className="text-white font-medium">{set.name}</p>
						{set.description && <p className="text-zinc-500 text-sm mt-1 line-clamp-2">{set.description}</p>}
						<p className="text-zinc-600 text-xs mt-2">Created {new Date(set.created_at).toLocaleDateString()}</p>
					</motion.div>
				</Link>
			))}
		</div>
	);
};

