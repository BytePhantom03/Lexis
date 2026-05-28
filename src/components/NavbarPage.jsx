import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Moon, Sun, User, Sparkles, ChevronDown, Bell } from "lucide-react";
import { themeContext, userContext } from "../context/Context";
import { SearchButton } from "./SearchButton";
import { SignPop } from "./SignPop";
import { AlertDialogBasic } from "./ui/AlertDialogBasic";
import { cn } from "./utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

function NavbarPage({ SetSearchQuery }) {
	const navigate = useNavigate();
	const [isDark, setIsDark] = useContext(themeContext);
	const [showMenu, setShowMenu] = useState(false);
	const [userInfo] = useContext(userContext);
	const menuRef = useRef(null);

	// Close menu when clicking outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setShowMenu(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<motion.nav 
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
			className="fixed w-full flex items-center justify-between glass py-3 px-6 top-0 z-50 transition-all duration-300"
		>
			<NavLink to={"/home"} className="flex items-center gap-2 group">
				<div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] transition-all duration-300">
					<Sparkles size={16} className="text-white" />
				</div>
				<h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-500 transition-all duration-300">
					Lexis
				</h1>
			</NavLink>

			<div className="flex items-center gap-3 sm:gap-5" ref={menuRef}>
				{/* Search Modal Trigger */}
				<SearchButton SetSearchQuery={SetSearchQuery} />

				{/* Notifications Dummy */}
				{userInfo && (
					<button 
						onClick={() => toast.info("No new notifications.", { duration: 2000 })}
						className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors relative"
					>
						<Bell size={18} className="text-gray-600 dark:text-gray-300" />
						<span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
					</button>
				)}

				{userInfo ? (
					<div className="relative">
						<button
							onClick={() => setShowMenu(!showMenu)}
							className="flex items-center gap-2 p-1 pl-1 pr-3 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-300"
						>
							<div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-indigo-500/30">
								{userInfo?.profile_img ? (
									<img src={userInfo.profile_img} alt="Profile" className="w-full h-full object-cover" />
								) : (
									<div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
										<User size={16} className="text-gray-500" />
									</div>
								)}
							</div>
							<ChevronDown size={14} className={`text-gray-500 transition-transform duration-300 ${showMenu ? "rotate-180" : ""}`} />
						</button>

						<AnimatePresence>
							{showMenu && (
								<motion.div
									initial={{ opacity: 0, y: 10, scale: 0.95 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: 10, scale: 0.95 }}
									transition={{ duration: 0.2 }}
									className="absolute right-0 mt-3 w-48 py-2 glass-panel border border-gray-200 dark:border-white/10 shadow-2xl"
								>
									<div className="px-4 py-2 border-b border-gray-100 dark:border-white/10 mb-2">
										<p className="text-sm font-semibold truncate text-foreground">{userInfo.username}</p>
										<p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
									</div>

									<button
										onClick={() => {
											setShowMenu(false);
											navigate(`/profile/${userInfo?.username}`);
										}}
										className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex items-center gap-2"
									>
										<User size={14} />
										Dashboard
									</button>

									<button
										onClick={() => {
											setIsDark((prev) => {
												const newTheme = prev === "dark" ? "light" : "dark";
												localStorage.setItem("theme", newTheme);
												return newTheme;
											});
										}}
										className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex items-center gap-2"
									>
										{isDark !== "dark" ? <Moon size={14} /> : <Sun size={14} />}
										{isDark !== "dark" ? "Dark Mode" : "Light Mode"}
									</button>

									<div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/10">
										<div className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer">
											<AlertDialogBasic titleText="Sign out" />
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				) : (
					<NavLink
						to={"/login"}
						className={({ isActive }) =>
							cn(
								"btn-primary rounded-xl px-6 py-2 text-sm font-semibold flex items-center transition-all duration-300",
								isActive && "opacity-80 shadow-none"
							)
						}
					>
						Login
					</NavLink>
				)}
			</div>
		</motion.nav>
	);
}

export default NavbarPage;
