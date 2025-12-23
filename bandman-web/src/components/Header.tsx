const Header = () => {
	return (
		<div className="sticky top-0 w-full px-8 py-4 h-20 bg-linear-to-b from-zinc-950 to-transparent flex items-center justify-between">
			<img src="/images/logo-full.svg" alt="Bandman Logo" className="h-4" />

			<div className="flex items-center gap-4">
				<div className="text-base font-medium">Band Manager</div>
				<div className="w-12 h-12 flex items-center justify-center font-heading font-bold bg-zinc-900 rounded-full">
					BM
				</div>
			</div>
		</div>
	);
};

export default Header;

