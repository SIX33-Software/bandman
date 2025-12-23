import React, { useId, useMemo, useState } from "react";
import classNames from "classnames";

export interface TextAreaProps
	extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "defaultValue" | "onChange"> {
	label?: React.ReactNode;
	description?: React.ReactNode;
	error?: React.ReactNode;
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	containerClassName?: string;
}

export const TextArea = ({
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
	rows = 4,
	...props
}: TextAreaProps) => {
	const reactId = useId();
	const textareaId = useMemo(() => id ?? `textarea-${reactId}`, [id, reactId]);

	const [internalValue, setInternalValue] = useState(defaultValue ?? "");
	const isControlled = value !== undefined;
	const currentValue = isControlled ? value : internalValue;

	const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		const next = event.target.value;
		if (!isControlled) {
			setInternalValue(next);
		}
		onChange?.(next);
	};

	return (
		<div className={classNames("w-full", containerClassName)}>
			{label && (
				<label htmlFor={textareaId} className="mb-2 block text-sm font-medium text-zinc-100">
					{label}
				</label>
			)}

			<textarea
				id={textareaId}
				disabled={disabled}
				value={currentValue}
				onChange={handleChange}
				rows={rows}
				className={classNames(
					"flex w-full rounded-2xl border px-6 py-4 text-left text-sm text-zinc-100 transition-colors duration-200",
					"bg-transparent outline-none resize-none",
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
