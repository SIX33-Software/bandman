import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { TextArea } from "@/components/ui/TextArea";
import { DatePicker } from "@/components/ui/DatePicker";
import { useCreateGigMutation, useGetGigByIdQuery, useUpdateGigMutation } from "@/store/api/gigApi";
import { CircleNotchSolid } from "@mynaui/icons-react";

interface GigFormData {
	name: string;
	venue: string;
	address: string;
	date: string;
	start_time: string;
	end_time: string;
	price: number;
	notes: string;
}

const parseDate = (dateStr: string) => {
	if (!dateStr) return null;
	const [year, month, day] = dateStr.split("-").map(Number);
	return new Date(year, month - 1, day);
};

const formatDate = (date: Date | null) => {
	if (!date) return "";
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const parseTime = (timeStr: string) => {
	if (!timeStr) return null;
	const [hours, minutes] = timeStr.split(":").map(Number);
	const date = new Date();
	date.setHours(hours, minutes, 0, 0);
	return date;
};

const formatTime = (date: Date | null) => {
	if (!date) return "";
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	return `${hours}:${minutes}`;
};

const GigFormPage = () => {
	const { bandId, id } = useParams<{ bandId: string; id?: string }>();
	const navigate = useNavigate();
	const isEditing = !!id;

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<GigFormData>();

	const [createGig, { isLoading: isCreating }] = useCreateGigMutation();
	const [updateGig, { isLoading: isUpdating }] = useUpdateGigMutation();
	const { data: gigData, isLoading: isGigLoading } = useGetGigByIdQuery(id!, { skip: !id });

	useEffect(() => {
		if (gigData?.data) {
			const gig = gigData.data;
			reset({
				name: gig.name,
				venue: gig.venue || "",
				address: gig.address || "",
				date: gig.date.split("T")[0],
				start_time: gig.start_time || "",
				end_time: gig.end_time || "",
				price: gig.price || 0,
				notes: gig.notes || "",
			});
		}
	}, [gigData, reset]);

	const onSubmit = async (data: GigFormData) => {
		if (!bandId) return;

		try {
			if (isEditing && id) {
				await updateGig({
					id,
					data: {
						...data,
						price: Number(data.price) || null,
						start_time: data.start_time || null,
						end_time: data.end_time || null,
						venue: data.venue || null,
						address: data.address || null,
						notes: data.notes || null,
					},
				}).unwrap();
			} else {
				await createGig({
					band_id: bandId,
					...data,
					price: Number(data.price) || null,
					start_time: data.start_time || null,
					end_time: data.end_time || null,
					venue: data.venue || null,
					address: data.address || null,
					notes: data.notes || null,
					status: "scheduled",
					set_id: null,
				}).unwrap();
			}
			navigate(`/bands/${bandId}`);
		} catch (error) {
			console.error("Failed to save gig:", error);
		}
	};

	if (isEditing && isGigLoading) {
		return (
			<div className="flex justify-center py-12">
				<CircleNotchSolid className="w-8 h-8 animate-spin text-white" />
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto">
			<h1 className="text-3xl font-bold text-white mb-8">{isEditing ? "Edit Gig" : "Schedule Gig"}</h1>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<Controller
					name="name"
					control={control}
					rules={{ required: "Name is required" }}
					render={({ field: { onChange, value } }) => (
						<InputField
							label="Gig Name"
							value={value}
							onChange={onChange}
							error={errors.name?.message}
							placeholder="e.g. Summer Festival"
						/>
					)}
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Controller
						name="date"
						control={control}
						rules={{ required: "Date is required" }}
						render={({ field: { onChange, value } }) => (
							<DatePicker
								label="Date"
								value={parseDate(value)}
								onChange={(date) => onChange(formatDate(date))}
								error={errors.date?.message}
								placeholderText="Select date"
							/>
						)}
					/>
					<Controller
						name="price"
						control={control}
						render={({ field: { onChange, value } }) => (
							<InputField
								label="Price (EUR)"
								type="number"
								step="0.01"
								value={value?.toString()}
								onChange={onChange}
								placeholder="0.00"
							/>
						)}
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Controller
						name="start_time"
						control={control}
						render={({ field: { onChange, value } }) => (
							<DatePicker
								label="Start Time"
								value={parseTime(value)}
								onChange={(date) => onChange(formatTime(date))}
								showTimeSelect
								showTimeSelectOnly
								timeIntervals={15}
								timeCaption="Time"
								dateFormat="h:mm aa"
								placeholderText="Select time"
							/>
						)}
					/>
					<Controller
						name="end_time"
						control={control}
						render={({ field: { onChange, value } }) => (
							<DatePicker
								label="End Time"
								value={parseTime(value)}
								onChange={(date) => onChange(formatTime(date))}
								showTimeSelect
								showTimeSelectOnly
								timeIntervals={15}
								timeCaption="Time"
								dateFormat="h:mm aa"
								placeholderText="Select time"
							/>
						)}
					/>
				</div>

				<Controller
					name="venue"
					control={control}
					render={({ field: { onChange, value } }) => (
						<InputField label="Venue" value={value} onChange={onChange} placeholder="Venue Name" />
					)}
				/>

				<Controller
					name="address"
					control={control}
					render={({ field: { onChange, value } }) => (
						<InputField label="Address" value={value} onChange={onChange} placeholder="Venue Address" />
					)}
				/>

				<Controller
					name="notes"
					control={control}
					render={({ field: { onChange, value } }) => (
						<TextArea label="Notes" value={value} onChange={onChange} placeholder="Additional details..." rows={4} />
					)}
				/>

				<div className="flex justify-end gap-4">
					<Button type="button" variant="ghost" onClick={() => navigate(-1)}>
						Cancel
					</Button>
					<Button type="submit" disabled={isCreating || isUpdating}>
						{isCreating || isUpdating ? "Saving..." : "Save Gig"}
					</Button>
				</div>
			</form>
		</div>
	);
};

export default GigFormPage;

