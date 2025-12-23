import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks";
import { InputField } from "@/components/ui/InputField";

export default function SignupPage() {
	const navigate = useNavigate();
	const { signUp, isLoading, error, clearError } = useAuth();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [formError, setFormError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);
		clearError();

		if (!name || !email || !password || !confirmPassword) {
			setFormError("Please fill in all fields");
			return;
		}

		if (password.length < 8) {
			setFormError("Password must be at least 8 characters");
			return;
		}

		if (password !== confirmPassword) {
			setFormError("Passwords do not match");
			return;
		}

		const result = await signUp(email, password, name);

		if (result.meta.requestStatus === "fulfilled") {
			navigate("/", { replace: true });
		}
	};

	const displayError = formError || error;

	return (
		<div className="min-h-dvh w-full flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold font-heading mb-2">Create an account</h1>
					<p className="text-zinc-400">Get started with your band management</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{displayError && (
						<div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
							{displayError}
						</div>
					)}

					<InputField
						label="Name"
						type="text"
						placeholder="John Doe"
						value={name}
						onChange={setName}
						autoComplete="name"
						disabled={isLoading}
					/>

					<InputField
						label="Email"
						type="email"
						placeholder="you@example.com"
						value={email}
						onChange={setEmail}
						autoComplete="email"
						disabled={isLoading}
					/>

					<InputField
						label="Password"
						type="password"
						placeholder="••••••••"
						value={password}
						onChange={setPassword}
						autoComplete="new-password"
						description="Must be at least 8 characters"
						disabled={isLoading}
					/>

					<InputField
						label="Confirm Password"
						type="password"
						placeholder="••••••••"
						value={confirmPassword}
						onChange={setConfirmPassword}
						autoComplete="new-password"
						disabled={isLoading}
					/>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full py-3 px-6 rounded-full bg-white text-zinc-900 font-medium text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? (
							<span className="flex items-center justify-center gap-2">
								<span className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-900"></span>
								Creating account...
							</span>
						) : (
							"Create account"
						)}
					</button>
				</form>

				<p className="mt-8 text-center text-sm text-zinc-400">
					Already have an account?{" "}
					<Link to="/login" className="text-white hover:underline font-medium">
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}

