import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import { StoreProvider } from "./providers";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";

const HomePage = lazy(() => import("./features/Home/HomePage.tsx"));
const LoginPage = lazy(() => import("./features/Auth/LoginPage.tsx"));
const SignupPage = lazy(() => import("./features/Auth/SignupPage.tsx"));
const CreateBandPage = lazy(() => import("./features/Band/CreateBandPage.tsx"));
const BandDetailsPage = lazy(() => import("./features/Band/BandDetailsPage.tsx"));
const AddMemberPage = lazy(() => import("./features/Band/AddMemberPage.tsx"));
const AddSongToBandPage = lazy(() => import("./features/Song/AddSongToBandPage.tsx"));
const CreateSongPage = lazy(() => import("./features/Song/CreateSongPage.tsx"));
const SongViewPage = lazy(() => import("./features/Song/SongViewPage.tsx"));
const EditSongPage = lazy(() => import("./features/Song/EditSongPage.tsx"));

export const LoadingFallback = () => (
	<div className="min-h-dvh w-full flex items-center justify-center">
		<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
	</div>
);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<StoreProvider>
			<BrowserRouter>
				<Suspense fallback={<LoadingFallback />}>
					<Routes>
						{/* Public routes (redirect to home if authenticated) */}
						<Route element={<PublicRoute />}>
							<Route path="/login" element={<LoginPage />} />
							<Route path="/signup" element={<SignupPage />} />
						</Route>

						{/* Protected routes (require authentication) */}
						<Route element={<ProtectedRoute />}>
							<Route path="/" element={<App />}>
								<Route index element={<HomePage />} />
								<Route path="bands/new" element={<CreateBandPage />} />
								<Route path="/bands/:id" element={<BandDetailsPage />} />
								<Route path="/bands/:id/members/add" element={<AddMemberPage />} />
								<Route path="/bands/:id/songs/add" element={<AddSongToBandPage />} />
								<Route path="/bands/:id/songs/create" element={<CreateSongPage />} />
								<Route path="/bands/:bandId/songs/:id" element={<SongViewPage />} />
								<Route path="/bands/:bandId/songs/:id/edit" element={<EditSongPage />} />
								<Route path="/songs/:id" element={<SongViewPage />} />
								<Route path="/songs/:id/edit" element={<EditSongPage />} />
							</Route>
						</Route>
					</Routes>
				</Suspense>
			</BrowserRouter>
		</StoreProvider>
	</StrictMode>
);

