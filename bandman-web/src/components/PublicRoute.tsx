import { Navigate, Outlet, useLocation } from "react-router";
import { useAppSelector } from "@/store";

interface LocationState {
	from?: {
		pathname: string;
	};
}

export function PublicRoute() {
	const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
	const location = useLocation();
	const state = location.state as LocationState;

	// Show nothing while checking auth state
	if (!isInitialized) {
		return (
			<div className="min-h-dvh w-full flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
			</div>
		);
	}

	// Redirect to home (or previous page) if already authenticated
	if (isAuthenticated) {
		const redirectTo = state?.from?.pathname || "/";
		return <Navigate to={redirectTo} replace />;
	}

	return <Outlet />;
}
