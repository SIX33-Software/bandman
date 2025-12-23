/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft } from "@mynaui/icons-react";
import { InputField } from "@/components/ui/InputField";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import { useCreateSetMutation, useUpdateSetMutation, useGetSetByIdQuery } from "@/store/api/setApi";
import { useAuth } from "@/hooks";

export default function SetFormPage() {
	const navigate = useNavigate();
	const { bandId, id: setId } = useParams<{ bandId: string; id?: string }>();
	const { user } = useAuth();
	const isEditing = !!setId;

	const [createSet, { isLoading: isCreating }] = useCreateSetMutation();
	const [updateSet, { isLoading: isUpdating }] = useUpdateSetMutation();

	const { data: setData, isLoading: isLoadingSet } = useGetSetByIdQuery(setId!, {
		skip: !isEditing,
	});

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (setData?.data) {
			setName(setData.data.name);
			setDescription(setData.data.description || "");
		}
	}, [setData]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!name.trim()) {
			setError("Set name is required");
			return;
		}

		if (!user?.id) {
			setError("You must be logged in");
			return;
		}

		if (!bandId) {
			setError("Band ID is missing");
			return;
		}

		try {
			if (isEditing && setId) {
				const result = await updateSet({
					id: setId,
					data: {
						name: name.trim(),
						description: description.trim() || null,
					},
				}).unwrap();

				if (result.success) {
					navigate(`/bands/${bandId}/sets/${setId}`);
				} else {
					setError(result.message || "Failed to update set");
				}
			} else {
				const result = await createSet({
					band_id: bandId,
					name: name.trim(),
					description: description.trim() || null,
					created_by: user.id,
				}).unwrap();

				if (result.success && result.data) {
					navigate(`/bands/${bandId}/sets/${result.data.id}`);
				} else {
					setError(result.message || "Failed to create set");
				}
			}
		} catch (_err) {
			setError(`Failed to ${isEditing ? "update" : "create"} set. Please try again.`);
		}
	};

	const isLoading = isCreating || isUpdating || (isEditing && isLoadingSet);

	if (isEditing && isLoadingSet) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
			</div>
		);
	}

	return (
		<div className="max-w-xl mx-auto">
			<Link
				to={isEditing ? `/bands/${bandId}/sets/${setId}` : `/bands/${bandId}?tab=sets`}
				className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
			>
				<ArrowLeft className="w-5 h-5" />
				Back to {isEditing ? "set" : "band"}
			</Link>

			<div className="mb-8">
				<h1 className="text-3xl font-heading font-bold mb-2">{isEditing ? "Edit Set" : "Create a Set"}</h1>
				<p className="text-zinc-400">
					{isEditing ? "Update your set details" : "Create a new set to organize your songs"}
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{error && (
					<div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
				)}

				<InputField
					label="Set Name"
					type="text"
					placeholder="Summer Gig 2024"
					value={name}
					onChange={setName}
					disabled={isLoading}
				/>

				<TextArea
					label="Description"
					placeholder="Notes about this set..."
					value={description}
					onChange={setDescription}
					disabled={isLoading}
					rows={4}
				/>

				<div className="flex items-center gap-4 pt-4">
					<Button
						type="submit"
						isLoading={isLoading}
						loadingText={isEditing ? "Updating..." : "Creating..."}
						className="flex-1"
					>
						{isEditing ? "Update Set" : "Create Set"}
					</Button>
					<Button
						variant="secondary"
						type="button"
						onClick={() => navigate(isEditing ? `/bands/${bandId}/sets/${setId}` : `/bands/${bandId}?tab=sets`)}
					>
						Cancel
					</Button>
				</div>
			</form>
		</div>
	);
}

