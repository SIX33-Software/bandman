import React, { useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "@mynaui/icons-react";
import classNames from "classnames";

export interface CheckboxProps {
	checked?: boolean;
	defaultChecked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	disabled?: boolean;
	label?: React.ReactNode;
	description?: React.ReactNode;
	className?: string;
	id?: string;
}

export const Checkbox = ({
	checked,
	defaultChecked,
	onCheckedChange,
	disabled,
	label,
	description,
	className,
	id,
}: CheckboxProps) => {
	const reactId = useId();
	const inputId = useMemo(() => id ?? `checkbox-${reactId}`, [id, reactId]);

	const [internalChecked, setInternalChecked] = useState(!!defaultChecked);
	const isControlled = checked !== undefined;
	const isOn = isControlled ? !!checked : internalChecked;

	const setNext = (next: boolean) => {
		if (!isControlled) {
			setInternalChecked(next);
		}
		onCheckedChange?.(next);
	};

	return (
		<label
			htmlFor={inputId}
			className={classNames(
				"flex w-full items-start gap-4",
				{
					"cursor-not-allowed opacity-60": disabled,
					"cursor-pointer": !disabled,
				},
				className
			)}
		>
			<input
				id={inputId}
				type="checkbox"
				checked={isOn}
				onChange={(e) => setNext(e.target.checked)}
				disabled={disabled}
				className="sr-only"
			/>

			<div
				aria-hidden
				className={classNames(
					"relative mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg border transition-colors duration-200",
					"border-zinc-800 bg-zinc-900/30 backdrop-blur-xl",
					"hover:border-zinc-500",
					{
						"border-zinc-400": isOn,
						"hover:border-zinc-800": disabled,
					}
				)}
			>
				<motion.span
					initial={false}
					animate={{ opacity: isOn ? 1 : 0, scale: isOn ? 1 : 0.9 }}
					transition={{ type: "spring", stiffness: 500, damping: 35 }}
					className="text-zinc-100"
				>
					<Check />
				</motion.span>
			</div>

			{(label || description) && (
				<div className="min-w-0">
					{label && <div className="text-sm font-medium text-zinc-100 truncate">{label}</div>}
					{description && <div className="mt-1 text-sm text-zinc-500">{description}</div>}
				</div>
			)}
		</label>
	);
};
