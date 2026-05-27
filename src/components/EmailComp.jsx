import React from "react";
import email from "../assets/email-open.png";

function EmailComp({ handleEmailBtn }) {
	return (
		<div
			className="w-full flex justify-center md:justify-start md:pl-12 select-none cursor-pointer"
			onClick={handleEmailBtn}>
			<div
				className="flex items-center justify-center gap-2 
               w-full max-w-[320px] sm:max-w-[380px] 
               dark:bg-gray-800 bg-gray-200 py-4 rounded-xl border-2 
               hover:bg-gray-700 active:scale-105 hover:shadow-xs 
               transition-all duration-300">
				<img src={email} className="h-7" alt="email-open" />
				<span className="text-foreground font-medium">Continue with email</span>
			</div>
		</div>
	);
}

export default EmailComp;
