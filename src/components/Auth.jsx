import React, { useContext, useEffect } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";
import { userContext } from "../context/Context";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

function Auth() {
	const navi = useNavigate();
	const [searchParams] = useSearchParams();

	const [userInfo, isLoading] = useContext(userContext);

	// Check for OAuth error in URL params
	const oauthError = searchParams.get("error");
	const oauthErrorDesc = searchParams.get("error_description");

	useEffect(() => {
		if (oauthError) {
			console.error("OAuth error:", oauthError, oauthErrorDesc);
			toast.error(oauthErrorDesc || "Login failed. Please try again.");
		}
	}, [oauthError, oauthErrorDesc]);

	useEffect(() => {
		if (isLoading) return;
		
		if (userInfo) {
			// User is logged in, go to home
			navi("/home", { replace: true });
		} else {
			// User is not logged in, go to login page
			navi("/login", { replace: true });
		}
	}, [isLoading, userInfo, navi]);

	return (
		<div className="max-w-screen min-h-screen  box-border ">
			{isLoading && (
				<div className="bg-gray-10 relative h-screen w-screen flex  justify-center items-center ">
					<div className="top-1/3 text-shadow-gray-800   right-[50%] left-[50%] text-3xl font-bold font-[verdana] ">
						Lexis
						<div className="flex flex-row-reverse items-center">
							{" "}
							<p className="text-sm  font-normal text-shadow-none p-2 ">
								loading..
							</p>
							<LoaderCircle
								size={24}
								className=" animate-spin  py-2 rounded-2xl w-fit h-fit text-xs ">
								/
							</LoaderCircle>
						</div>
					</div>
				</div>
			)}

			{!isLoading && !userInfo && (
				<div className="bg-orange-200 w-fit m-auto p-4 rounded-xl border border-red-400 text-red-700">
					{oauthError
						? `Login failed: ${oauthErrorDesc || oauthError}`
						: "Redirecting to login..."}
				</div>
			)}
		</div>
	);
}

export default Auth;
