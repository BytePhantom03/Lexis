import React from "react";
import gooleLogo from "../assets/google.svg";
import { toast } from "sonner";
import supabase from "../config/supabaseClient";
function GoogleComp() {
	async function handleGoogleLogin() {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: window.location.origin,
			},
		});
		if (error) toast.error("Google login failed: " + error.message);
	}
	return (
		<div
			className="w-full flex justify-center md:justify-start md:pl-12 select-none cursor-pointer"
			onClick={handleGoogleLogin}>
			<div
				className="flex items-center justify-center gap-3
               w-full max-w-[320px] sm:max-w-[380px]
               bg-white dark:bg-[#1c1c1f]
               py-3.5 rounded-xl
               border border-[#e8e8ec] dark:border-[#2a2a2e]
               shadow-sm hover:shadow-md
               hover:border-gray-300 dark:hover:border-[#3a3a3e]
               active:scale-[0.98]
               transition-all duration-300">
				<img src={gooleLogo} className="h-5 w-5" alt="Google logo" />
				<span className="text-gray-700 dark:text-gray-200 font-medium text-sm">
					Continue with Google
				</span>
			</div>
		</div>
	);
}

export default GoogleComp;
