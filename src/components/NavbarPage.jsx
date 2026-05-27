import {
	LogInIcon,
	Moon,
	Pen,
	Pencil,
	Sun,
	User,
	User2Icon,
} from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { themeContext, userContext } from "../context/Context";
import { SearchButton } from "./SearchButton";
import { LogIn } from "lucide-react";
import { cn } from "./utils/cn";
import { SignPop } from "./SignPop";
import { AlertDialogBasic } from "./ui/AlertDialogBasic";

function NavbarPage({ SetSearchQuery }) {
	const naviagtors = useNavigate();
	//jjjdjjd
	const [isDark, setIsDark] = useContext(themeContext);
	const [showMenu, setShowMenu] = useState(false);
	const [userInfo] = useContext(userContext);
	const [landing, setLanding] = useState(true);

	useEffect(() => {
	}, [isDark]);

	useEffect(() => {
		function helper() {
			setTimeout(() => {
				setLanding(false);
			}, 3000);
		}

		helper();
	}, []);

	return (
		<nav
			className="flex fixed items-center w-full justify-between glass border-b border-[#e8e8ec] dark:border-[#2a2a2e] py-3 px-6 top-0 z-50">
			<NavLink to={"/home"}>
				<h1 className="gradient-text font-bold text-xl sm:text-2xl sm:pl-2">
					Lexis
				</h1>
			</NavLink>
			<div className="relative right-0">
				<div className="flex flex-row items-center gap-2">
					<SignPop
						child={<SearchButton on SetSearchQuery={SetSearchQuery} />}
					/>

					{userInfo && (
						<span
							onClick={() => {
								//e.stopPropagation();
								setShowMenu((prev) => !prev);
							}}
							className="transition-all duration-300 flex rounded-full relative flex-row hover:cursor-pointer items-center">
							{" "}
							<div className="rounded-full ring-2 ring-indigo-500/30">
								{" "}
								{!userInfo?.profile_img && (
									<User
										size={28}
										fill="#303033"
										strokeWidth={1}
										strokeOpacity={0}
										className={`${landing && "ml-1"}`}
									/>
								)}
								{userInfo?.profile_img && (
									<img
										src={`${userInfo?.profile_img}`}
										className="h-8 w-8 rounded-full object-cover"
									/>
								)}
							</div>
						</span>
					)}

					{!userInfo && (
						<NavLink
							to={"/login"}
							end
							className={({ isActive }) =>
								cn(
									"btn-primary rounded-xl px-5 py-1.5 text-sm font-medium flex items-center cursor-pointer transition-all duration-300",

									isActive
										? "opacity-80"
										: ""
								)
							}>
							{" "}
							<span className="block">Login</span>
						</NavLink>
					)}
				</div>

				<ul
					className={`right-0 p-1.5 top-12 flex flex-col absolute bg-white dark:bg-[#1c1c1f] animate-slide-down shadow-xl rounded-xl border border-[#e8e8ec] dark:border-[#2a2a2e] transition-all duration-300 ease-in-out ${showMenu ? "block" : "hidden"}`}>

					<li
						onClick={() => {
							naviagtors(`/profile/${userInfo?.username}`);
						}}
						className="px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 hover:bg-[#f5f5f7] dark:hover:bg-[#2a2a2e]">
						<span className="flex items-center text-sm font-medium gap-2 text-foreground">
							{" "}
							<User size={16} />
							<span>Profile</span>
						</span>
					</li>
					<li
						className="px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 hover:bg-[#f5f5f7] dark:hover:bg-[#2a2a2e]">
						<span
							className="flex w-40 items-center text-sm font-medium gap-2 text-foreground"
							onClick={() => {
								setIsDark((prev) => {
									const newTheme = prev === "dark" ? "light" : "dark";
									localStorage.setItem("theme", newTheme);
									return newTheme;
								});
							}}>
							{" "}
							<span>
								{" "}
								{isDark != "dark" ? (
									<Moon size={16} />
								) : (
									<Sun size={16} />
								)}
							</span>
							<span>
								{isDark != "dark" ? "Dark Mode" : "Light Mode"}
							</span>
						</span>
					</li>

					<li
						className="px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 hover:bg-[#f5f5f7] dark:hover:bg-[#2a2a2e]">
						<div className="whitespace-nowrap flex transition cursor-pointer w-full text-sm font-medium text-foreground">
							<AlertDialogBasic titleText={`Sign out`} />
							
						</div>
					</li>


				</ul>
			</div>

		
		</nav>
	);
}

export default NavbarPage;
