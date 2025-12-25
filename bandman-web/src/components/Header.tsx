import { useState } from "react";
import { useAuth } from "@/hooks";
import { useNavigate } from "react-router";
import { Menu, X } from "@mynaui/icons-react";
import { motion } from "framer-motion";
import { useGetBandsQuery } from "@/store/api/bandApi";

const Header = () => {
	const { profile, user, signOut, isLoading } = useAuth();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { data: bandsData } = useGetBandsQuery();
	const bands = bandsData?.data || [];

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
		setIsMenuOpen(false);
	};

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	return (
		<div className="sticky top-0 z-50 w-full">
			{/* Spacer to maintain layout height */}
			<div className="h-20 w-full invisible pointer-events-none" />

			{/* Animated Header Container */}
			<motion.div
				className="absolute top-0 left-0 w-full overflow-hidden"
				initial="closed"
				animate={isMenuOpen ? "open" : "closed"}
				variants={{
					closed: { height: "80px" },
					open: { height: "auto" },
				}}
				transition={{ type: "spring", stiffness: 350, damping: 70, mass: 4, restDelta: 0.001, restSpeed: 0.001 }}
			>
				{/* Backdrop blur overlay (GPU-accelerated opacity transition) */}
				<motion.div
					className="absolute inset-0 -z-10 bg-zinc-950/90 backdrop-blur-lg will-change-[opacity]"
					variants={{
						closed: { opacity: 0 },
						open: { opacity: 1 },
					}}
					transition={{ duration: 0.2 }}
				/>

				{/* Gradient Background (Only visible when closed) */}
				<motion.div className="absolute top-0 left-0 w-full h-20 -z-10 bg-linear-to-b from-zinc-950 to-transparent will-change-[opacity]" />

				{/* Main Header Bar Content */}
				<div className="px-5 md:px-8 py-4 h-20 flex items-center justify-between">
					<img
						onClick={() => navigate("/")}
						role="button"
						src="/images/logo-full.svg"
						alt="Bandman Logo"
						className="h-4 cursor-pointer drop-shadow-transparent hover:drop-shadow-amber-600 drop-shadow-xl transition-all"
					/>

					{/* Desktop Menu */}
					<div className="hidden md:flex items-center gap-4">
						<button
							onClick={() => navigate("/")}
							className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
						>
							Home
						</button>
						<button
							onClick={handleLogout}
							disabled={isLoading}
							className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
						>
							Logout
						</button>

						<div className="text-base font-medium">{displayName}</div>
						<div className="w-12 h-12 flex items-center justify-center font-heading font-bold bg-zinc-900 rounded-full text-sm border border-white/10">
							{initials}
						</div>
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={toggleMenu}
						className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
					>
						{isMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>

				{/* Mobile Menu Content */}
				<motion.div
					className="md:hidden px-5 pb-6 flex flex-col gap-6"
					variants={{
						closed: { opacity: 0 },
						open: { opacity: 1, transition: { delay: 0.2 } },
					}}
				>
					{/* Profile Section */}
					<div className="flex items-center gap-4 pb-6 border-b border-white/5">
						<div className="w-12 h-12 flex items-center justify-center font-heading font-bold bg-zinc-900 rounded-full text-sm border border-white/10">
							{initials}
						</div>
						<div className="flex flex-col">
							<span className="text-base font-medium text-white">{displayName}</span>
							<span className="text-xs text-zinc-500">{user?.email}</span>
						</div>
					</div>

					<button
						onClick={() => {
							navigate("/");
							setIsMenuOpen(false);
						}}
						className="w-full text-left py-2 text-sm text-zinc-300 hover:text-white transition-colors cursor-pointer"
					>
						Home
					</button>

					{/* Quick Bands List */}
					<div className="flex flex-col gap-3">
						<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Your Bands</h3>
						{bands.length > 0 ? (
							<div className="flex flex-col gap-2">
								{bands.map((band) => (
									<button
										key={band.id}
										onClick={() => {
											navigate(`/bands/${band.id}`);
											setIsMenuOpen(false);
										}}
										className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left group cursor-pointer"
									>
										{band.image_url ? (
											<img src={band.image_url} alt={band.name} className="w-8 h-8 rounded-full object-cover" />
										) : (
											<div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">
												{band.name[0]}
											</div>
										)}
										<span className="text-sm text-zinc-300 group-hover:text-white transition-colors">{band.name}</span>
									</button>
								))}
							</div>
						) : (
							<p className="text-sm text-zinc-600 italic">No bands yet.</p>
						)}
					</div>

					{/* Logout Action */}
					<button
						onClick={handleLogout}
						disabled={isLoading}
						className="mt-2 w-full py-3 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
					>
						Logout
					</button>
				</motion.div>
			</motion.div>
		</div>
	);
};

export default Header;

