import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";

import Auth from "./components/Auth";
import { useCallback, useEffect, useRef, useState } from "react";
import supabase from "./config/supabaseClient";
// eslint-disable-next-line no-unused-vars
import { dataContext, userContext, themeContext } from "./context/Context";
import Profile from "./components/Profile";
import ArticleWriter from "./components/ArticleWriter";
import { Toaster } from "sonner";
import Loader from "./components/Loader";

import UserControl from "./components/UserControl";
import { LoaderCircle } from "lucide-react";
import NotAllowed from "./components/NotAllowed";
import ArticleReader from "./components/ArticleReader";
import ResetPassword from "./components/ResetPassword";
import PasswordFlow from "./components/PasswordFlow";
import { CalculateTime } from "./utils/CalculateTime";
import Offline from "./components/NoInternet";
import useOnlineStatus from "./components/InternetStatus";
import SearchPage from "./components/SearchPage";
import FollowerPage from "./components/FollowerPage";
import FollowingPage from "./components/FollowingPage";
import { CarouselComp } from "./components/ui/Crousel";
import userDp from "./assets/user.png";
import TopProgressBar from "./components/TopProgressBar";
import Consent from "./components/utils/Consent";

const router = createBrowserRouter([
	{
		element: (
			<>
				<TopProgressBar />
				<Outlet />
			</>
		),
		children: [
			{ path: "/", element: <Auth /> },
			{ path: "/read", element: <CalculateTime /> },
			{ path: "/article", element: <ArticleReader /> },
			{
				path: "/write",
				element: <ArticleWriter />,
				errorElement: <h2>Error Occurred.🙂</h2>,
			},
			{ path: "/profile/:username", element: <Profile /> },
			{ path: "/profile/:username/followers", element: <FollowerPage /> },
			{ path: "/profile/:username/following", element: <FollowingPage /> },
			{ path: "/auth", element: <Auth /> },
			{ path: "/oauth/consent", element: <Consent /> },
			{ path: "/home", element: <Home /> },
			{ path: "/login", element: <Login /> },
			{ path: "/signup", element: <Signup /> },
			{ path: "/control", element: <UserControl /> },
			{
				path: "/reset-password",
				element: <ResetPassword />,
				errorElement: <>Something Went Wrong.</>,
			},
			{
				path: "/flow",
				element: <PasswordFlow />,
				errorElement: <>Something Went Wrong.</>,
			},
			{
				path: "/search",
				element: <SearchPage />,
				errorElement: <>Something Went Wrong.In search Page</>,
			},
			{
				path: "/*",
				element: <NotAllowed />,
				errorElement: <>Something Went Wrong.</>,
			},
		],
	},
]);

function App() {
	const [articlesData, setArticlesData] = useState([]);
	const [userInfo, setUserInfo] = useState();
	const [loading, setLoading] = useState(true);
	const [likedArcticles, setLikedArcticles] = useState(new Set());
	const [myFollowing, setMyFollowing] = useState(new Set());
	const isOnline = useOnlineStatus();
	const isLoadingRef = useRef(false);
	const initialLoadDone = useRef(false);

	const loadUser = useCallback(async () => {
		// Prevent duplicate calls (e.g., from onAuthStateChange firing while already loading)
		if (isLoadingRef.current) {
			return;
		}
		isLoadingRef.current = true;

		// Only show loading spinner on the very first load
		if (!initialLoadDone.current) {
			setLoading(true);
		}

		// Safety check for Supabase configuration
		if (!supabase) {
			console.error("Supabase client not initialized. Check environment variables.");
			setLoading(false);
			isLoadingRef.current = false;
			return;
		}

		let res = await supabase.auth.getUser();

		async function loadFollowinglist(user_id) {
			const { data: followData, error: followError } = await supabase
				.from("FollowTable")
				.select("following_id")
				.eq("follower_id", user_id);
			if (followError) {
				return;
			}
			if (followData) {
				let tempSet = new Set();
				followData.map((row) => {
					tempSet.add(row.following_id);
				});
				setMyFollowing(tempSet);
			}
		}

		try {
			if (res?.data?.user) {
				let { id } = res.data.user;
				let { data, error } = await supabase
					.from("UserTable")
					.select("*,ArticleTable(*)")
					.eq("user_id", id)
					.single();

				if (error) {
					// PGRST116 = no rows found — first time Google login
					if (error.code === "PGRST116") {
						const googleUser = res.data.user;
						const newUser = {
							user_id: googleUser.id,
							name:
								googleUser.user_metadata?.full_name ||
								googleUser.email.split("@")[0],
							username:
								googleUser.email.split("@")[0] +
								"_" +
								googleUser.id.slice(0, 4),
							profile_img: googleUser.user_metadata?.avatar_url || "",
						};

						const { data: insertedUser, error: insertError } = await supabase
							.from("UserTable")
							.insert(newUser)
							.select("*")
							.single();

						if (insertError) {
							console.error("Could not create new Google user:", JSON.stringify(insertError, null, 2));
							setUserInfo(null);
						} else {
							setUserInfo(insertedUser);
							loadFollowinglist(googleUser.id);
						}
					} else {
						console.error("Error fetching user:", JSON.stringify(error, null, 2));
						setUserInfo(null);
					}
				} else {
					setUserInfo(data);
					loadFollowinglist(id);
				}
			} else {
				setUserInfo(null);
			}
		} catch (error) {
			console.error("Error while Loading:", error);
			setUserInfo(null);
		} finally {
			setLoading(false);
			isLoadingRef.current = false;
			initialLoadDone.current = true;
		}
	}, []);

	useEffect(() => {
		loadUser();
	}, [loadUser, isOnline]);

	// Listen for auth state changes (critical for OAuth redirects like Google login)
	useEffect(() => {
		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			(event, session) => {
				if (event === "SIGNED_IN") {
					loadUser();
				}
				if (event === "SIGNED_OUT") {
					setUserInfo(null);
					setLoading(false);
					initialLoadDone.current = false;
				}
			}
		);

		return () => {
			subscription.unsubscribe();
		};
	}, [loadUser]);

	let theme = localStorage.getItem("theme");

	const [isDark, setIsDark] = useState(localStorage.getItem("theme"));

	useEffect(() => {
		let statusBar = document.getElementById("statusBar");
		let body = document.querySelector("body");

		if (isDark == "dark" && statusBar != null) {
			statusBar.setAttribute("content", "#000000");
			body.classList.add("dark");
		} else if (isDark == "light" && statusBar != null) {
			statusBar.setAttribute("content", "#ffffff");
			if (body.classList.contains("dark")) body.classList.remove("dark");
		}
	}, [isDark]);

	if (isDark == null) {
		localStorage.setItem("theme", "light");
	}

	let isPwa = localStorage.getItem("pwa");
	if (isPwa == null) {
		localStorage.setItem("pwa", true);
	}

	if (!isOnline) {
		return <Offline />;
	}
	if (loading)
		return (
			<div
				className={` min-h-screen flex items-center justify-center bg-background`}>
				<div className="flex items-center gap-2 text-foreground ">
					<LoaderCircle size={24} className="animate-spin" />
					<span>Hold tight...</span>
				</div>
			</div>
		);

	return (
		<div
			id="app"
			className={`
				${isDark == "dark" ? "dark" : ""}
		*:dark:bg-[#121212]
		*:dark:text-[#E0E0E0]
		mx-0
		max-w-lvw
		*:mx-0
		*:my:0
		box-border
		
	dark:bg-black

		*:box-border
		min-h-screen
		
		
		`}>
			<Toaster position="top-center" />

			<dataContext.Provider
				value={[
					articlesData,
					setArticlesData,
					likedArcticles,
					setLikedArcticles,
					myFollowing,
					setMyFollowing,
				]}>
				<userContext.Provider value={[userInfo, loading, loadUser]}>
					<themeContext.Provider value={[isDark, setIsDark, theme]}>
						<RouterProvider router={router}></RouterProvider>
					</themeContext.Provider>
				</userContext.Provider>
			</dataContext.Provider>
		</div>
	);
}

export default App;
