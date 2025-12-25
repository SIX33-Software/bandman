import { Outlet, useLocation } from "react-router";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useEffect } from "react";

function App() {
	const location = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [location.pathname]);

	return (
		<div className="min-h-dvh w-full h-fit flex flex-col">
			<Header />
			<div className="p-5 md:p-8 pb-0 pt-20 w-full h-fit overflow-hidden">
				<Outlet />
			</div>
			<Footer />
		</div>
	);
}

export default App;

