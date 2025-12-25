import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import { StoreProvider, WebSocketProvider } from "./providers";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import { CircleNotchSolid } from "@mynaui/icons-react";

const HomePage = lazy(() => import("./features/Home/HomePage.tsx"));
const LoginPage = lazy(() => import("./features/Auth/LoginPage.tsx"));
const SignupPage = lazy(() => import("./features/Auth/SignupPage.tsx"));
const CreateBandPage = lazy(() => import("./features/Band/CreateBandPage.tsx"));
const BandDetailsPage = lazy(() => import("./features/Band/BandDetails/BandDetailsPage.tsx"));
const AddMemberPage = lazy(() => import("./features/Band/AddMemberPage.tsx"));
const AddSongToBandPage = lazy(() => import("./features/Song/AddSongToBandPage.tsx"));
const CreateSongPage = lazy(() => import("./features/Song/CreateSongPage.tsx"));
const SongViewPage = lazy(() => import("./features/Song/SongViewPage.tsx"));
const EditSongPage = lazy(() => import("./features/Song/EditSongPage.tsx"));
const SetFormPage = lazy(() => import("./features/Set/SetFormPage.tsx"));
const SetDetailsPage = lazy(() => import("./features/Set/SetDetailsPage.tsx"));
const AddSongToSetPage = lazy(() => import("./features/Set/AddSongToSetPage.tsx"));
const LiveSessionPage = lazy(() => import("./features/Session/LiveSessionPage.tsx"));
const GigFormPage = lazy(() => import("./features/Gig/GigFormPage.tsx"));
const GigDetailsPage = lazy(() => import("./features/Gig/GigDetailsPage.tsx"));

export const LoadingFallback = () => (
	<div className="min-h-dvh w-full flex items-center justify-center">
		<CircleNotchSolid className="w-8 h-8 animate-spin text-white" />
	</div>
);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<StoreProvider>
			<WebSocketProvider>
				<Suspense fallback={<LoadingFallback />}>
					<BrowserRouter>
						<Routes>
							{/* Public routes (redirect to home if authenticated) */}

							<Route element={<PublicRoute />}>
								<Route path="/login" element={<LoginPage />} />
								<Route path="/signup" element={<SignupPage />} />
							</Route>

							{/* Protected routes (require authentication) */}
							<Route element={<ProtectedRoute />}>
								<Route path="/sessions/:id/live" element={<LiveSessionPage />} />

								<Route path="/" element={<App />}>
									<Route index element={<HomePage />} />
									<Route path="bands/new" element={<CreateBandPage />} />
									<Route path="/bands/:id" element={<BandDetailsPage />} />
									<Route path="/bands/:id/edit" element={<CreateBandPage />} />
									<Route path="/bands/:id/members/add" element={<AddMemberPage />} />
									<Route path="/bands/:id/songs/add" element={<AddSongToBandPage />} />
									<Route path="/bands/:id/songs/create" element={<CreateSongPage />} />
									<Route path="/bands/:bandId/songs/:id" element={<SongViewPage />} />
									<Route path="/bands/:bandId/songs/:id/edit" element={<EditSongPage />} />

									{/* Set Routes */}
									<Route path="/bands/:bandId/sets/create" element={<SetFormPage />} />
									<Route path="/bands/:bandId/sets/:id" element={<SetDetailsPage />} />
									<Route path="/bands/:bandId/sets/:id/edit" element={<SetFormPage />} />
									<Route path="/bands/:bandId/sets/:id/songs/add" element={<AddSongToSetPage />} />

									{/* Gig Routes */}
									<Route path="/bands/:bandId/gigs/create" element={<GigFormPage />} />
									<Route path="/bands/:bandId/gigs/:id" element={<GigDetailsPage />} />
									<Route path="/bands/:bandId/gigs/:id/edit" element={<GigFormPage />} />

									<Route path="/songs/:id" element={<SongViewPage />} />
									<Route path="/songs/:id/edit" element={<EditSongPage />} />
								</Route>
							</Route>
						</Routes>
					</BrowserRouter>
				</Suspense>
			</WebSocketProvider>
		</StoreProvider>
	</StrictMode>
);

