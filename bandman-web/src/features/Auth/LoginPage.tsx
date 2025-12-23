import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "@/hooks";
import { InputField } from "@/components/ui/InputField";

interface LocationState {
	from?: {
		pathname: string;
	};
}

export default function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const state = location.state as LocationState;
	const { signIn, isLoading, error, clearError } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [formError, setFormError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);
		clearError();

		if (!email || !password) {
			setFormError("Please fill in all fields");
			return;
		}

		const result = await signIn(email, password);

		if (result.meta.requestStatus === "fulfilled") {
			const redirectTo = state?.from?.pathname || "/";
			navigate(redirectTo, { replace: true });
		}
	};

	const displayError = formError || error;

	return (
		<div className="min-h-dvh w-full flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold font-heading mb-2">Welcome back</h1>
					<p className="text-zinc-400">Sign in to your account to continue</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{displayError && (
						<div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
							{displayError}
						</div>
					)}

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
						autoComplete="current-password"
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
								Signing in...
							</span>
						) : (
							"Sign in"
						)}
					</button>
				</form>

				<p className="mt-8 text-center text-sm text-zinc-400">
					Don't have an account?{" "}
					<Link to="/signup" className="text-white hover:underline font-medium">
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
}
