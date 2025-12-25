import { Link } from "react-router";
import { motion } from "framer-motion";
import { useRemoveBandMemberMutation } from "@/store/api/bandApi";
import { Button } from "@/components/ui/Button";
import type { BandMemberWithUser, BandRole } from "@/types";
import { LoadingState, EmptyState } from "./shared";

// Role badge component
const RoleBadge = ({ role }: { role: BandRole }) => {
	const roleStyles: Record<BandRole, string> = {
		owner: "bg-amber-500/20 text-amber-400 border-amber-500/30",
		admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
		member: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
	};

	return (
		<span className={`text-xs px-2 py-0.5 rounded-full border ${roleStyles[role]}`}>
			{role.charAt(0).toUpperCase() + role.slice(1)}
		</span>
	);
};

export const MembersSection = ({
	members,
	isLoading,
	bandId,
}: {
	members?: BandMemberWithUser[];
	isLoading: boolean;
	bandId: string;
}) => {
	const [removeMember, { isLoading: isRemoving }] = useRemoveBandMemberMutation();

	const handleRemoveMember = async (userId: string) => {
		if (confirm("Are you sure you want to remove this member?")) {
			await removeMember({ bandId, userId });
		}
	};

	if (isLoading) {
		return <LoadingState text="Loading members..." />;
	}

	if (!members || members.length === 0) {
		return (
			<EmptyState
				title="No members yet"
				description="Add members to your band to collaborate"
				actionLabel="Add Member"
				actionHref={`/bands/${bandId}/members/add`}
			/>
		);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between mb-4">
				<p className="text-zinc-400 text-sm">{members.length} member(s)</p>
				<Link to={`/bands/${bandId}/members/add`}>
					<Button variant="secondary" size="sm">
						Add Member
					</Button>
				</Link>
			</div>
			{members.map((member) => (
				<motion.div
					key={member.user_id}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl rounded-xl p-4 flex items-start md:items-center justify-between overflow-hidden"
				>
					<div className="flex  gap-3 flex-1 overflow-hidden flex-col md:flex-row md:items-center">
						<div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-300 shrink-0">
							{member.user?.name?.[0]?.toUpperCase() || member.user?.email?.[0]?.toUpperCase() || "?"}
						</div>
						<div className="flex-1 whitespace-pre-wrap wrap-break-word">
							<p className="text-white font-medium">{member.user?.name || "Unknown User"}</p>
							<p className="text-zinc-500 text-sm">{member.user?.email}</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<RoleBadge role={member.role} />
						{member.role !== "owner" && (
							<button
								onClick={() => handleRemoveMember(member.user_id)}
								disabled={isRemoving}
								className="text-zinc-500 hover:text-red-400 transition-colors p-1"
								title="Remove member"
							>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path
										fillRule="evenodd"
										d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						)}
					</div>
				</motion.div>
			))}
		</div>
	);
};

