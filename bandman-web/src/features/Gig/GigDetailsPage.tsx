import { useParams, useNavigate, Link } from "react-router";
import { useGetGigByIdQuery, useDeleteGigMutation } from "@/store/api/gigApi";
import { Button } from "@/components/ui/Button";
import { CircleNotchSolid } from "@mynaui/icons-react";
import dayjs from "dayjs";

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
						<span>{dayjs(gig.date).format("ddd D MMM, YYYY")}</span>
						{gig.start_time && <span>• {gig.start_time}</span>}
					</div>
				</div>
				<div className="flex gap-2">
					<Link to={`/bands/${bandId}/gigs/${id}/edit`}>
						<Button variant="secondary">Edit</Button>
					</Link>
					<Button
						variant="ghost"
						onClick={handleDelete}
						disabled={isDeleting}
						className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
				<div>
					<dt className="text-sm text-zinc-500 mb-1">Venue</dt>
					<dd className="text-white">{gig.venue || "Not specified"}</dd>
				</div>
				<div>
					<dt className="text-sm text-zinc-500 mb-1">Address</dt>
					<dd className="text-white">{gig.address || "Not specified"}</dd>
				</div>
				<div>
					<dt className="text-sm text-zinc-500 mb-1">Price</dt>
					<dd className="text-zinc-300 leading-none px-3 py-2 bg-zinc-900 w-fit rounded-lg border border-zinc-800">
						{gig.price
							? new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(gig.price)
							: "TBD"}
					</dd>
				</div>
				<div>
					<dt className="text-sm text-zinc-500 mb-1">Status</dt>
					<dd className="text-white capitalize">{gig.status}</dd>
				</div>
			</div>

			{gig.notes && (
				<>
					<div className="border-t border-zinc-800 my-8" />
					<div>
						<h3 className="text-sm text-yellow-500 mb-2">Notes</h3>
						<p className="text-zinc-300 whitespace-pre-wrap">{gig.notes}</p>
					</div>
				</>
			)}
		</div>
	);
};

export default GigDetailsPage;

