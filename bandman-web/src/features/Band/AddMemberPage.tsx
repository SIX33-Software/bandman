import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import { useGetBandByIdQuery, useGetBandMembersQuery, useAddBandMemberMutation } from "@/store/api/bandApi";
import { useLazySearchUsersQuery } from "@/store/api/userApi";
import Header from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { Select, type SelectOption } from "@/components/ui/Select";
import type { User, BandRole } from "@/types";

const roleOptions: SelectOption[] = [
	{ label: "Member", value: "member" },
	{ label: "Admin", value: "admin" },
];

export const AddMemberPage = () => {
	const { id: bandId } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [selectedRole, setSelectedRole] = useState<BandRole>("member");
	const [error, setError] = useState<string | null>(null);

	// Queries
	const { data: bandData, isLoading: isBandLoading } = useGetBandByIdQuery(bandId!, {
		skip: !bandId,
	});
	const { data: membersData } = useGetBandMembersQuery(bandId!, {
		skip: !bandId,
	});

	const [searchUsers, { data: searchResults, isLoading: isSearching, isFetching }] = useLazySearchUsersQuery();

	// Mutations
	const [addMember, { isLoading: isAdding }] = useAddBandMemberMutation();

	const band = bandData?.data;
	const existingMemberIds = useMemo(() => new Set(membersData?.data?.map((m) => m.user_id) || []), [membersData?.data]);

	// Filter out existing members from search results
	const availableUsers = useMemo(
		() => searchResults?.data?.filter((user) => !existingMemberIds.has(user.id)) || [],
		[searchResults?.data, existingMemberIds]
	);

	// Debounced search function
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedSearchUsers = useCallback(
		debounce((query: string) => {
			if (query.length >= 2) {
				searchUsers({ q: query });
			}
		}, 300),
		[searchUsers]
	);

	// Trigger search when query changes
	useEffect(() => {
		debouncedSearchUsers(searchQuery);
		return () => {
			debouncedSearchUsers.cancel();
		};
	}, [searchQuery, debouncedSearchUsers]);

	const handleSelectUser = (user: User) => {
		setSelectedUser(user);
		setSearchQuery("");
		setError(null);
	};

	const handleClearSelection = () => {
		setSelectedUser(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!bandId || !selectedUser) {
			setError("Please select a user to add");
			return;
		}

		try {
			const result = await addMember({
				bandId,
				data: {
					user_id: selectedUser.id,
					role: selectedRole,
				},
			});

			if ("error" in result) {
				setError("Failed to add member. Please try again.");
				return;
			}

			navigate(`/bands/${bandId}`);
		} catch (_error) {
			setError("An unexpected error occurred");
		}
	};

	if (isBandLoading) {
		return (
			<div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
				<div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
			</div>
		);
	}

	if (!band) {
		return (
			<div className="min-h-screen bg-zinc-950 text-white">
				<Header />
				<main className="max-w-2xl mx-auto py-12">
					<div className="text-center">
						<h1 className="text-2xl font-bold mb-4">Band not found</h1>
						<Link to="/">
							<Button variant="secondary">Go back home</Button>
						</Link>
					</div>
				</main>
			</div>
		);
	}

	return (
		<main className="max-w-2xl mx-auto py-8">
			{/* Back link */}
			<Link
				to={`/bands/${bandId}`}
				className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
			>
				<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
					<path
						fillRule="evenodd"
						d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
						clipRule="evenodd"
					/>
				</svg>
				Back to {band.name}
			</Link>

			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
				<h1 className="text-3xl font-bold mb-2">Add Member</h1>
				<p className="text-zinc-400 mb-8">Search for users to add to {band.name}</p>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* User Search / Selection */}
					{selectedUser ? (
						<div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-lg font-medium text-zinc-300 shrink-0">
										{selectedUser.name?.[0]?.toUpperCase() || selectedUser.email?.[0]?.toUpperCase() || "?"}
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-white font-medium truncate">{selectedUser.name || "Unknown User"}</p>
										<p className="text-zinc-500 text-sm truncate">{selectedUser.email}</p>
									</div>
								</div>
								<button
									type="button"
									onClick={handleClearSelection}
									className="text-zinc-500 hover:text-white transition-colors p-2"
								>
									<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
										<path
											fillRule="evenodd"
											d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</button>
							</div>
						</div>
					) : (
						<div className="relative">
							<InputField
								label="Search Users"
								placeholder="Search by email or name..."
								value={searchQuery}
								onChange={(value) => setSearchQuery(value)}
								description="Enter at least 2 characters to search"
							/>

							{/* Search Results Dropdown */}
							{searchQuery.length >= 2 && (
								<div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl z-20">
									{isSearching || isFetching ? (
										<div className="p-4 text-center text-zinc-500">
											<div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto mb-2" />
											Searching...
										</div>
									) : availableUsers.length === 0 ? (
										<div className="p-4 text-center text-zinc-500">
											{searchResults?.data?.length === 0 ? "No users found" : "All matching users are already members"}
										</div>
									) : (
										<ul className="max-h-64 overflow-y-auto">
											{availableUsers.map((user) => (
												<li key={user.id}>
													<button
														type="button"
														onClick={() => handleSelectUser(user)}
														className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-800 transition-colors text-left"
													>
														<div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-300">
															{user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
														</div>
														<div className="flex-1 min-w-0">
															<p className="text-white font-medium truncate">{user.name || "Unknown User"}</p>
															<p className="text-zinc-500 text-sm truncate">{user.email}</p>
														</div>
													</button>
												</li>
											))}
										</ul>
									)}
								</div>
							)}
						</div>
					)}

					{/* Role Selection */}
					<div>
						<label className="mb-2 block text-sm font-medium text-zinc-100">Role</label>
						<Select
							options={roleOptions}
							value={selectedRole}
							onChange={(value) => setSelectedRole(value as BandRole)}
						/>
						<p className="mt-2 text-xs text-zinc-500">Choose the role for this member</p>
					</div>

					{/* Error Message */}
					{error && (
						<div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
							{error}
						</div>
					)}

					{/* Actions */}
					<div className="flex items-center gap-4 pt-4">
						<Button type="submit" disabled={!selectedUser || isAdding} isLoading={isAdding} loadingText="Adding...">
							Add Member
						</Button>
						<Link to={`/bands/${bandId}`}>
							<Button type="button" variant="ghost">
								Cancel
							</Button>
						</Link>
					</div>
				</form>
			</motion.div>
		</main>
	);
};

export default AddMemberPage;

