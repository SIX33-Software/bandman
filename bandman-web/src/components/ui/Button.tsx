import React from "react";
import classNames from "classnames";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	isLoading?: boolean;
	loadingText?: string;
	fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
	primary: "bg-white text-zinc-900 hover:bg-zinc-200",
	secondary: "border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white bg-transparent",
	ghost: "text-zinc-400 hover:text-white bg-transparent",
};

const sizeStyles: Record<ButtonSize, string> = {
	sm: "py-2 px-4 text-xs",
	md: "py-3 px-6 text-sm",
	lg: "py-4 px-8 text-base",
};

export const Button = ({
	variant = "primary",
	size = "md",
	isLoading = false,
	loadingText,
	fullWidth = false,
	disabled,
	className,
	children,
	...props
}: ButtonProps) => {
	const isDisabled = disabled || isLoading;

	return (
		<button
			disabled={isDisabled}
			className={classNames(
				"rounded-full font-medium transition-colors",
				"disabled:opacity-50 disabled:cursor-not-allowed",
				variantStyles[variant],
				sizeStyles[size],
				{
					"w-full": fullWidth,
				},
				className
			)}
			{...props}
		>
			{isLoading ? (
				<span className="flex items-center justify-center gap-2">
					<span
						className={classNames("animate-spin rounded-full border-b-2", {
							"h-3 w-3": size === "sm",
							"h-4 w-4": size === "md",
							"h-5 w-5": size === "lg",
							"border-zinc-900": variant === "primary",
							"border-white": variant !== "primary",
						})}
					></span>
					{loadingText || children}
				</span>
			) : (
				children
			)}
		</button>
	);
};
