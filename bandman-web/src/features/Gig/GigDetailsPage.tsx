import { useParams, useNavigate, Link } from "react-router";
import { useGetGigByIdQuery, useDeleteGigMutation } from "@/store/api/gigApi";
import { Button } from "@/components/ui/Button";
import { CircleNotchSolid } from "@mynaui/icons-react";

const GigDetailsPage = () => {
	const { bandId, id } = useParams<{ bandId: string; id: string }>();
	const navigate = useNavigate();

	const { data: gigData, isLoading } = useGetGigByIdQuery(id!, { skip: !id });
	const [deleteGig, { isLoading: isDeleting }] = useDeleteGigMutation();

	const gig = gigData?.data;

	const handleDelete = async () => {
		if (confirm("Are you sure you want to delete this gig?")) {
			await deleteGig(id!);
			navigate(`/bands/${bandId}`);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<CircleNotchSolid className="w-8 h-8 animate-spin text-white" />
			</div>
		);
	}

	if (!gig) {
		return <div className="text-white text-center py-12">Gig not found</div>;
	}

	return (
		<div className="max-w-4xl mx-auto">
			<div className="flex items-start justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold text-white">{gig.name}</h1>
					<div className="text-zinc-400 mt-2 flex items-center gap-2">
						<span>{new Date(gig.date).toLocaleDateString()}</span>
						{gig.start_time && <span>• {gig.start_time}</span>}
					</div>
				</div>
				<div className="flex gap-2">
					<Link to={`/bands/${bandId}/gigs/${id}/edit`}>
						<Button variant="secondary">Edit</Button>
					</Link>
					<Button variant="ghost" onClick={handleDelete} disabled={isDeleting} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className="space-y-6">
					<div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
						<h3 className="text-lg font-medium text-white mb-4">Details</h3>
						<dl className="space-y-4">
							<div>
								<dt className="text-sm text-zinc-500">Venue</dt>
								<dd className="text-white">{gig.venue || "Not specified"}</dd>
							</div>
							<div>
								<dt className="text-sm text-zinc-500">Address</dt>
								<dd className="text-white">{gig.address || "Not specified"}</dd>
							</div>
							<div>
								<dt className="text-sm text-zinc-500">Price</dt>
								<dd className="text-white">
									{gig.price
										? new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(gig.price)
										: "TBD"}
								</dd>
							</div>
							<div>
								<dt className="text-sm text-zinc-500">Status</dt>
								<dd className="text-white capitalize">{gig.status}</dd>
							</div>
						</dl>
					</div>
				</div>

				<div className="space-y-6">
					{gig.notes && (
						<div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
							<h3 className="text-lg font-medium text-white mb-4">Notes</h3>
							<p className="text-zinc-300 whitespace-pre-wrap">{gig.notes}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default GigDetailsPage;
