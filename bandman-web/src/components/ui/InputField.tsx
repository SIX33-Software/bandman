import React, { useId, useMemo, useState } from "react";
import classNames from "classnames";

export interface InputFieldProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange"> {
	label?: React.ReactNode;
	description?: React.ReactNode;
	error?: React.ReactNode;
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	containerClassName?: string;
}

export const InputField = ({
	label,
	description,
	error,
	value,
	defaultValue,
	onChange,
	className,
	containerClassName,
	id,
	disabled,
	...props
}: InputFieldProps) => {
	const reactId = useId();
	const inputId = useMemo(() => id ?? `input-${reactId}`, [id, reactId]);

	const [internalValue, setInternalValue] = useState(defaultValue ?? "");
	const isControlled = value !== undefined;
	const currentValue = isControlled ? value : internalValue;

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const next = event.target.value;
		if (!isControlled) {
			setInternalValue(next);
		}
		onChange?.(next);
	};

	return (
		<div className={classNames("w-full", containerClassName)}>
			{label && (
				<label htmlFor={inputId} className="mb-2 block text-sm font-medium text-zinc-100">
					{label}
				</label>
			)}

			<input
				id={inputId}
				disabled={disabled}
				value={currentValue}
				onChange={handleChange}
				className={classNames(
					"flex w-full items-center justify-between rounded-full border px-6 py-3 text-left text-sm text-zinc-100 transition-colors duration-200",
					"bg-transparent outline-none",
					"border-zinc-800 hover:border-zinc-500 focus:border-zinc-400",
					"placeholder:text-zinc-500",
					{
						"opacity-60 cursor-not-allowed hover:border-zinc-800": disabled,
						"border-red-500/60 hover:border-red-500/60 focus:border-red-500": !!error,
					},
					className
				)}
				{...props}
			/>

			{error ? (
				<div className="mt-2 text-sm text-red-400">{error}</div>
			) : description ? (
				<div className="mt-2 text-sm text-zinc-500">{description}</div>
			) : null}
		</div>
	);
};

