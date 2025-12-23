import { useAuth } from "@/hooks";
import { useNavigate } from "react-router";

const Header = () => {
	const { profile, user, signOut, isLoading } = useAuth();

	const navigate = useNavigate();

	const displayName = profile?.name || user?.email?.split("@")[0] || "User";
	const initials = displayName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	const handleLogout = async () => {
		await signOut();
	};

	return (
		<div className="sticky top-0 w-full px-8 py-4 h-20 bg-linear-to-b from-zinc-950 to-transparent flex items-center justify-between">
			<img
				onClick={() => navigate("/")}
				role="button"
				src="/images/logo-full.svg"
				alt="Bandman Logo"
				className="h-4 cursor-pointer"
			/>

			<div className="flex items-center gap-4">
				<button
					onClick={handleLogout}
					disabled={isLoading}
					className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
				>
					Logout
				</button>

				<div className="text-base font-medium">{displayName}</div>
				<div className="w-12 h-12 flex items-center justify-center font-heading font-bold bg-zinc-900 rounded-full text-sm">
					{initials}
				</div>
			</div>
		</div>
	);
};

export default Header;

