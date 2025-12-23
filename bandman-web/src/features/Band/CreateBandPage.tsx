import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "@mynaui/icons-react";
import { InputField } from "@/components/ui/InputField";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import { useCreateBandMutation } from "@/store/api/bandApi";
import { useAuth } from "@/hooks";

export default function CreateBandPage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [createBand, { isLoading }] = useCreateBandMutation();

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [error, setError] = useState<string | null>(null);

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
		} catch (_err) {
			setError("Failed to create band. Please try again.");
		}
	};

	return (
		<div className="max-w-xl mx-auto">
			<Link to="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8">
				<ArrowLeft className="w-5 h-5" />
				Back to bands
			</Link>

			<div className="mb-8">
				<h1 className="text-3xl font-heading font-bold mb-2">Create a Band</h1>
				<p className="text-zinc-400">Set up your band and start managing your music</p>
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

				<InputField
					label="Image URL"
					type="url"
					placeholder="https://example.com/band-image.jpg"
					value={imageUrl}
					onChange={setImageUrl}
					description="Optional: Add a URL to your band's image"
					disabled={isLoading}
				/>

				<div className="flex items-center gap-4 pt-4">
					<Button type="submit" isLoading={isLoading} loadingText="Creating..." className="flex-1">
						Create Band
					</Button>
					<Button variant="secondary" type="button" onClick={() => navigate("/")}>
						Cancel
					</Button>
				</div>
			</form>
		</div>
	);
}

