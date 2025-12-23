import { Navigate, Outlet, useLocation } from "react-router";
import { useAppSelector } from "@/store";

export function ProtectedRoute() {
	const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
	const location = useLocation();

	// Show nothing while checking auth state
	if (!isInitialized) {
		return (
			<div className="min-h-dvh w-full flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
			</div>
		);
	}

	// Redirect to login if not authenticated
	if (!isAuthenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <Outlet />;
}
