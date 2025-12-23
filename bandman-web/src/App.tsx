import { Outlet } from "react-router";
import Header from "./components/Header";

function App() {
	return (
		<div className="min-h-dvh w-full flex flex-col h-fit">
			<Header />
			<div className="p-8 pt-20 h-fit">
				<Outlet />
			</div>
		</div>
	);
}

export default App;

