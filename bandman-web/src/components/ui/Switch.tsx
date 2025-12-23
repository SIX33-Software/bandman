import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import classNames from "classnames";

export interface SwitchProps {
	checked?: boolean;
	defaultChecked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	disabled?: boolean;
	label?: React.ReactNode;
	description?: React.ReactNode;
	className?: string;
	id?: string;
}

export const Switch = ({
	checked,
	defaultChecked,
	onCheckedChange,
	disabled,
	label,
	description,
	className,
	id,
}: SwitchProps) => {
	const [internalChecked, setInternalChecked] = useState(!!defaultChecked);
	const isControlled = checked !== undefined;
	const isOn = isControlled ? !!checked : internalChecked;

	const buttonId = useMemo(() => id, [id]);

	const toggle = () => {
		if (disabled) return;
		const next = !isOn;
		if (!isControlled) {
			setInternalChecked(next);
		}
		onCheckedChange?.(next);
	};

	return (
		<div className={classNames("w-full", className)}>
			<div className="flex items-center justify-between gap-4">
				{(label || description) && (
					<div className="min-w-0">
						{label && (
							<div className="text-sm font-medium text-zinc-100 truncate">{label}</div>
						)}
						{description && <div className="mt-1 text-sm text-zinc-500">{description}</div>}
					</div>
				)}

				<button
					id={buttonId}
					type="button"
					role="switch"
					aria-checked={isOn}
					onClick={toggle}
					disabled={disabled}
					className={classNames(
						"relative inline-flex h-10 w-16 items-center rounded-full border transition-colors duration-200",
						"border-zinc-800 hover:border-zinc-500 focus:border-zinc-400",
						"bg-zinc-900/30 backdrop-blur-xl",
						{
							"cursor-not-allowed opacity-60 hover:border-zinc-800": disabled,
							"bg-zinc-900": isOn,
						}
					)}
				>
					<motion.span
						layout
						transition={{ type: "spring", stiffness: 500, damping: 35 }}
						className={classNames(
							"absolute left-1 top-1 h-8 w-8 rounded-full",
							"bg-zinc-100",
							{
								"translate-x-0": !isOn,
								"translate-x-6": isOn,
							}
						)}
					/>
				</button>
			</div>
		</div>
	);
};
