import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import githubBlack from "/GitHubBlack.svg";

import githubWhite from "/GitHubWhite.svg";

import { themeContext } from "../context/Context";

function ProfileFooter() {
	const [theme] = useContext(themeContext);


	return (
		<div className="w-full border-t border-[#e8e8ec] dark:border-[#2a2a2e] py-3 px-4">
			<div className="max-w-2xl mx-auto flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
				<div className="flex items-center gap-1.5">
					<span className="text-sm">&copy;</span>
					<span>2026 Lexis. All rights reserved.</span>
				</div>
				<a
					className="flex items-center gap-1.5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
					href="https://github.com/BytePhantom03/Lexis"
					target="_self"
					rel="noreferrer">
					<img
						className="dark:bg-black/70 object-cover rounded-full"
						width="16"
						height="16"
						src={theme == "dark" ? githubWhite : githubBlack}
						alt="github"
					/>
					<span>GitHub</span>
				</a>
			</div>
		</div>
	);
}

export default ProfileFooter;
