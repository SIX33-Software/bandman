import { Link } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import type { Gig } from "@/types";
import { LoadingState, EmptyState } from "./shared";

// Status badge component for gigs
const GigStatusBadge = ({ status }: { status: Gig["status"] }) => {
	const statusStyles = {
		scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
		completed: "bg-green-500/20 text-green-400 border-green-500/30",
		cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
	};

	return (
		<span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyles[status]}`}>
			{status.charAt(0).toUpperCase() + status.slice(1)}
		</span>
	);
};

export const GigsSection = ({ gigs, isLoading, bandId }: { gigs?: Gig[]; isLoading: boolean; bandId: string }) => {
	if (isLoading) {
		return <LoadingState text="Loading gigs..." />;
	}

	if (!gigs || gigs.length === 0) {
		return (
			<EmptyState
				title="No gigs yet"
				description="Schedule your upcoming performances"
				actionLabel="Schedule Gig"
				actionHref={`/bands/${bandId}/gigs/create`}
			/>
		);
	}

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatTime = (time: string | null) => {
		if (!time) return null;
		return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
		});
	};

	const formatCurrency = (amount: number | null) => {
		if (amount === null || amount === undefined) return "TBD";
		return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(amount);
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between mb-4">
				<p className="text-zinc-400 text-sm">{gigs.length} gig(s)</p>
				<Link to={`/bands/${bandId}/gigs/create`}>
					<Button variant="secondary" size="sm">
						Schedule Gig
					</Button>
				</Link>
			</div>
			{gigs.map((gig) => (
				<Link key={gig.id} to={`/bands/${bandId}/gigs/${gig.id}`}>
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors cursor-pointer"
					>
						<div className="flex items-start justify-between">
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between mr-4">
									<p className="text-white font-medium">{gig.name}</p>
									<span className="text-zinc-400 text-sm font-medium">{formatCurrency(gig.price)}</span>
								</div>
								{gig.venue && <p className="text-zinc-400 text-sm mt-1">{gig.venue}</p>}
								<div className="flex items-center gap-2 mt-2 text-sm text-zinc-500">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
										<path
											fillRule="evenodd"
											d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
											clipRule="evenodd"
										/>
									</svg>
									<span>{formatDate(gig.date)}</span>
									{gig.start_time && (
										<>
											<span>•</span>
											<span>{formatTime(gig.start_time)}</span>
										</>
									)}
								</div>
							</div>
							<GigStatusBadge status={gig.status} />
						</div>
					</motion.div>
				</Link>
			))}
		</div>
	);
};

