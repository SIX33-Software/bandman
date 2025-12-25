const Footer = () => {
	return (
		<footer className="w-full px-8 py-8 pb-28 flex items-center justify-between text-sm text-zinc-500 mt-auto bg-zinc-900/50">
			<div>&copy; {new Date().getFullYear()} Bandman. All rights reserved.</div>
			<div className="flex gap-4 font-heading font-bold tracking-wider">BANDMAN</div>
		</footer>
	);
};

export default Footer;

