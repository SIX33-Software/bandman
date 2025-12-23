import React, { useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import classNames from "classnames";

export type TabsOption<T extends string | number = string> = {
	label: React.ReactNode;
	value: T;
	disabled?: boolean;
};

export interface TabsProps<T extends string | number = string> {
	options: TabsOption<T>[];
	value?: T;
	defaultValue?: T;
	onChange?: (value: T) => void;
	className?: string;
	buttonClassName?: string;
	disabled?: boolean;
	id?: string;
}

export const Tabs = <T extends string | number = string>({
	options,
	value,
	defaultValue,
	onChange,
	className,
	buttonClassName,
	disabled,
	id,
}: TabsProps<T>) => {
	const reactId = useId();
	const groupId = useMemo(() => id ?? reactId, [id, reactId]);

	const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue);
	const isControlled = value !== undefined;
	const currentValue = (isControlled ? value : internalValue) ?? options[0]?.value;

	const select = (next: T, optionDisabled?: boolean) => {
		if (disabled || optionDisabled) return;
		if (!isControlled) {
			setInternalValue(next);
		}
		onChange?.(next);
	};

	return (
		<div
			role="tablist"
			className={classNames(
				"relative inline-flex w-full items-center rounded-full border border-zinc-800 bg-zinc-900/30 backdrop-blur-xl p-1",
				className
			)}
		>
			{options.map((opt) => {
				const isSelected = opt.value === currentValue;
				const isOptDisabled = disabled || opt.disabled;
				const tabId = `tab-${groupId}-${String(opt.value)}`;

				return (
					<button
						key={String(opt.value)}
						id={tabId}
						type="button"
						role="tab"
						aria-selected={isSelected}
						disabled={isOptDisabled}
						onClick={() => select(opt.value, opt.disabled)}
						className={classNames(
							"relative flex-1 rounded-full px-5 py-2 text-sm transition-colors duration-200",
							"focus:outline-none",
							{
								"text-zinc-100": isSelected,
								"text-zinc-400 hover:text-zinc-100": !isSelected && !isOptDisabled,
								"text-zinc-600 cursor-not-allowed": isOptDisabled,
							},
							buttonClassName
						)}
					>
						{isSelected && (
							<motion.div
								layoutId={`tabs-indicator-${groupId}`}
								transition={{ type: "spring", stiffness: 500, damping: 35 }}
								className="absolute inset-0 rounded-full bg-zinc-900"
							/>
						)}
						<span className="relative z-10 block truncate">{opt.label}</span>
					</button>
				);
			})}
		</div>
	);
};
