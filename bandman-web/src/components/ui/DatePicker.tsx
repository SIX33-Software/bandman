import React, { forwardRef } from "react";
import ReactDatePicker, { type DatePickerProps as ReactDatePickerProps } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";
import classNames from "classnames";
import { Calendar, ClockThree as Clock } from "@mynaui/icons-react";

export interface DatePickerProps extends Omit<ReactDatePickerProps, "onChange" | "value"> {
	label?: string;
	error?: string;
	value?: Date | null;
	onChange: (date: Date | null) => void;
	containerClassName?: string;
}

interface CustomInputProps {
	value?: string;
	onClick?: () => void;
	className?: string;
	placeholder?: string;
	error?: string;
	label?: string;
	icon?: React.ElementType;
}

const CustomInput = forwardRef<HTMLButtonElement, CustomInputProps>(
	({ value, onClick, className, placeholder, error, label, icon: Icon }, ref) => (
		<div className="w-full">
			{label && <label className="mb-2 block text-sm font-medium text-zinc-100">{label}</label>}
			<button
				type="button"
				className={classNames(
					"flex w-full items-center justify-between rounded-full border px-6 py-3 text-left text-sm text-zinc-100 transition-colors duration-200",
					"bg-transparent outline-none",
					"border-zinc-800 hover:border-zinc-500 focus:border-zinc-400",
					{
						"text-zinc-500": !value,
						"border-red-500/60 hover:border-red-500/60 focus:border-red-500": !!error,
					},
					className
				)}
				onClick={onClick}
				ref={ref}
			>
				<span>{value || placeholder}</span>
				{Icon && <Icon className="h-5 w-5 text-zinc-500" />}
			</button>
			{error && <div className="mt-2 text-sm text-red-400">{error}</div>}
		</div>
	)
);

export const DatePicker = ({
	label,
	error,
	value,
	onChange,
	containerClassName,
	className,
	placeholderText,
	showTimeSelect,
	showTimeSelectOnly,
	dateFormat,
	selectsMultiple: _selectsMultiple,
	selectsRange: _selectsRange,
	...props
}: DatePickerProps) => {
	return (
		<div className={classNames("w-full", containerClassName)}>
			<ReactDatePicker
				selected={value}
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				onChange={onChange as any}
				wrapperClassName="w-full"
				customInput={
					<CustomInput
						label={label}
						error={error}
						placeholder={placeholderText}
						className={className}
						icon={showTimeSelectOnly ? Clock : Calendar}
					/>
				}
				showTimeSelect={showTimeSelect}
				showTimeSelectOnly={showTimeSelectOnly}
				dateFormat={dateFormat || (showTimeSelectOnly ? "h:mm aa" : "MM/dd/yyyy")}
				{...props}
			/>
		</div>
	);
};

