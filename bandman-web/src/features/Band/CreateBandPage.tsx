import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, ImageRectangle } from "@mynaui/icons-react";
import { InputField } from "@/components/ui/InputField";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import { useCreateBandMutation, useGetBandByIdQuery, useUpdateBandMutation } from "@/store/api/bandApi";
import { useAuth } from "@/hooks";

export default function CreateBandPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const isEditing = !!id;
	const { user } = useAuth();

	const [createBand, { isLoading: isCreating }] = useCreateBandMutation();
	const [updateBand, { isLoading: isUpdating }] = useUpdateBandMutation();

	const { data: bandData, isLoading: isBandLoading } = useGetBandByIdQuery(id!, {
		skip: !isEditing,
	});

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (bandData?.data) {
			setName(bandData.data.name);
			setDescription(bandData.data.description || "");
			setImageUrl(bandData.data.image_url || "");
		}
	}, [bandData]);

	const isLoading = isCreating || isUpdating || isBandLoading;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!name.trim()) {
			setError("Band name is required");
			return;
		}

		if (!user?.id) {
			setError("You must be logged in to create a band");
			return;
		}

		try {
			if (isEditing) {
				const result = await updateBand({
					id: id!,
					data: {
						name: name.trim(),
						description: description.trim() || null,
						image_url: imageUrl.trim() || null,
					},
				}).unwrap();

				if (result.success) {
					navigate(`/bands/${id}`);
				} else {
					setError(result.message || "Failed to update band");
				}
			} else {
				const result = await createBand({
					name: name.trim(),
					description: description.trim() || null,
					image_url: imageUrl.trim() || null,
				}).unwrap();

				if (result.success && result.data) {
					navigate(`/bands/${result.data.id}`);
				} else {
					setError(result.message || "Failed to create band");
				}
			}
		} catch (_err) {
			setError(`Failed to ${isEditing ? "update" : "create"} band. Please try again.`);
		}
	};

	if (isBandLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
			</div>
		);
	}

	return (
		<div className="max-w-xl mx-auto pb-20">
			<Link
				to={isEditing ? `/bands/${id}` : "/"}
				className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
			>
				<ArrowLeft className="w-5 h-5" />
				Back to {isEditing ? "band" : "bands"}
			</Link>

			<div className="mb-8">
				<h1 className="text-3xl font-heading font-bold mb-2">{isEditing ? "Edit Band" : "Create a Band"}</h1>
				<p className="text-zinc-400">
					{isEditing ? "Update your band details" : "Set up your band and start managing your music"}
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{error && (
					<div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
				)}

				<InputField
					label="Band Name"
					type="text"
					placeholder="The Rockers"
					value={name}
					onChange={setName}
					disabled={isLoading}
				/>

				<TextArea
					label="Description"
					placeholder="Tell us about your band..."
					value={description}
					onChange={setDescription}
					disabled={isLoading}
					rows={4}
				/>
				<div className="w-full h-48 flex items-center justify-center relative overflow-hidden">
					{imageUrl && (
						<img
							src={imageUrl}
							alt="Band"
							className="absolute w-full h-full object-cover mask-t-from-0% mask-b-from-0% opacity-30"
						/>
					)}
					<div className="w-32 h-32 rounded-3xl bg-zinc-900 relative overflow-hidden border border-zinc-800">
						{imageUrl ? (
							<img src={imageUrl} alt="Band" className="w-full h-full object-cover" />
						) : (
							<div className="w-full h-full flex items-center justify-center text-zinc-600">
								<ImageRectangle />
							</div>
						)}
					</div>
				</div>
				<InputField
					label="Image URL"
					type="url"
					placeholder="https://example.com/band-image.jpg"
					value={imageUrl}
					onChange={setImageUrl}
					description="Optional: Add an image URL to be used as the band avatar and cover."
					disabled={isLoading}
				/>

				<div className="flex items-center gap-4 pt-4">
					<Button
						type="submit"
						isLoading={isLoading}
						loadingText={isEditing ? "Updating..." : "Creating..."}
						className="flex-1"
					>
						{isEditing ? "Update Band" : "Create Band"}
					</Button>
					<Button variant="secondary" type="button" onClick={() => navigate(isEditing ? `/bands/${id}` : "/")}>
						Cancel
					</Button>
				</div>
			</form>
		</div>
	);
}

