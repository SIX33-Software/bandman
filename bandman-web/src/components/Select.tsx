import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "@mynaui/icons-react";
import classNames from "classnames";

export type SelectOption = {
	label: React.ReactNode;
	value: string | number;
};

interface SelectProps {
	options: SelectOption[];
	value?: string | number;
	defaultValue?: string | number;
	onChange?: (value: string | number) => void;
	placeholder?: string;
	className?: string;
}

export const Select = ({
	options,
	value,
	defaultValue,
	onChange,
	placeholder = "Select an option",
	className = "",
}: SelectProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [internalValue, setInternalValue] = useState(defaultValue);
	const containerRef = useRef<HTMLDivElement>(null);

	const isControlled = value !== undefined;
	const currentValue = isControlled ? value : internalValue;

	const selectedOption = options.find((opt) => opt.value === currentValue);

	const handleSelect = (val: string | number) => {
		if (!isControlled) {
			setInternalValue(val);
		}
		onChange?.(val);
		setIsOpen(false);
	};

	// Click outside handler
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className={classNames("relative w-full min-w-50 max-w-lg", className)} ref={containerRef}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex w-full items-center justify-between rounded-full border border-zinc-800 px-6 py-3 text-left text-sm text-zinc-100 transition-colors duration-200 hover:border-zinc-500 focus:border-zinc-400 "
			>
				<span className={classNames("block truncate", { "text-zinc-500": !selectedOption })}>
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="ml-2 shrink-0">
					<ChevronDown />
				</motion.span>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0 }}
						transition={{ type: "spring", stiffness: 500, damping: 30 }}
						className="absolute mt-1 z-10 max-h-60 w-full overflow-auto rounded-2xl bg-zinc-900/30 backdrop-blur-xl p-1 text-base sm:text-sm"
					>
						{options.length === 0 ? (
							<div className="relative cursor-default select-none px-5 py-3 text-zinc-500">No options available</div>
						) : (
							options.map((option) => (
								<div
									key={option.value}
									onClick={() => handleSelect(option.value)}
									className={classNames(
										"relative cursor-pointer select-none px-6 py-3 rounded-xl transition-colors duration-200 hover:bg-zinc-900",
										{
											"bg-zinc-800 text-zinc-100": currentValue === option.value,
											"text-zinc-300": currentValue !== option.value,
										}
									)}
								>
									<span
										className={classNames("block truncate", {
											"font-medium": currentValue === option.value,
											"font-normal": currentValue !== option.value,
										})}
									>
										{option.label}
									</span>
									{currentValue === option.value && (
										<span className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-100">
											<Check />
										</span>
									)}
								</div>
							))
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

