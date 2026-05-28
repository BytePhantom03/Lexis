import React, { useEffect, useRef, useState } from "react";
import supabase from "../config/supabaseClient";
import { AlertColors } from "./ui/AlertColors";
import { AlertBasic } from "./ui/AlertBasic";
import { NavLink, useNavigate } from "react-router-dom";
import { ExternalLink, Sparkles, LineChart } from "lucide-react";
import { toast } from "sonner";
import GoogleComp from "./GoogleComp";
import LoginDivider from "./LoginDivider";
import EmailComp from "./EmailComp";
import { SignWithEmail } from "./SignWithEmail";
import illustration from "../assets/illu2.svg";
import ProfileFooter from "./ProfileFooter";
import { motion } from "framer-motion";

function Signup() {
	const emailRef = useRef();
	const passwordRef = useRef();
	const nameRef = useRef();
	const dobRef = useRef();
	const usernameRef = useRef();

	const [errorMsg, setErrorMsg] = useState(null);
	const [userData, setUserData] = useState(null);
	const [showForm, setShowForm] = useState(false);
	const [success, setSuccess] = useState(false);
	const navi = useNavigate();

	useEffect(() => {
		document.title = "Sign up | Lexis";
	}, []);

	const clearStatus = () => {
		setErrorMsg(null);
		setSuccess(false);
	};

	async function handleSubmit(event) {
		event.preventDefault();
		clearStatus();
		const email = emailRef.current.value;
		const password = passwordRef.current.value;

		const { error, data } = await supabase.auth.signUp({
			email,
			password,
		});

		if (error) {
			setErrorMsg(error);

			setUserData(null);

			return;
		}

		if (data?.user) {
			setErrorMsg(null);
			setUserData(data.user);
			setSuccess(true);
			toast.success("💡 Account created! Note your password.");

			setTimeout(() => {
				setShowForm(true);
				setSuccess(false);
			}, 1500);
		}
	}

	async function handleUserData(event) {
		event.preventDefault();
		clearStatus();

		const { data, error } = await supabase
			.from("UserTable")
			.insert([
				{
					user_id: userData.id,
					username: usernameRef.current.value,
					name: nameRef.current.value,
				},
			])
			.select();

		if (error) {
			setErrorMsg(error);
			toast.error(error.message || "An error occurred");
			return;
		}

		if (data) {
			setErrorMsg(null);
			setSuccess(true);
			toast.success("Profile updated successfully!");

			setTimeout(() => {
				setSuccess(false);
				navi("/auth");
			}, 1500);
		}
	}

	return (
		<div className="flex min-h-screen bg-background selection:bg-indigo-500/30">
			{/* Left Form Section */}
			<div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-24 relative min-h-screen">
				{/* Background Glow */}
				<div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
					<div className="absolute top-0 left-0 w-full h-1/2 bg-purple-500/5 blur-[150px]"></div>
				</div>

				<motion.div 
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6 }}
					className="w-full max-w-md mx-auto"
				>
					{/* Brand */}
					<div 
						onClick={() => navi("/")}
						className="flex items-center gap-2 cursor-pointer mb-10 w-fit"
					>
						<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
							<Sparkles size={16} className="text-white" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">Lexis</h1>
					</div>

					<header className="mb-8">
						<h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">
							Give your <span className="gradient-text">stories</span> a home.
						</h2>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Join a community of modern thinkers. Get started now.
						</p>
					</header>

					<div className="space-y-6 w-full">
						{!showForm && (
							<>
								<GoogleComp />
								<LoginDivider />
							</>
						)}

						<SignWithEmail
							child={
								<div className="w-full">
									{!showForm ? (
										/* STEP 1: LOGIN / INITIAL SIGNUP FORM */
										<form onSubmit={handleSubmit} className="space-y-5">
											<div className="space-y-1">
												<label htmlFor="email" className="text-sm font-medium text-foreground">
													Email Address
												</label>
												<input
													onChange={() => setErrorMsg(null)}
													ref={emailRef}
													type="email"
													id="email"
													required
													placeholder="you@example.com"
													className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#e8e8ec] dark:border-white/10 text-foreground focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all outline-none"
												/>
											</div>

											<div className="space-y-1">
												<label htmlFor="password" className="text-sm font-medium text-foreground">
													Create Password
												</label>
												<input
													onChange={() => setErrorMsg(null)}
													ref={passwordRef}
													type="password"
													id="password"
													required
													placeholder="••••••••"
													minLength={6}
													maxLength={20}
													className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#e8e8ec] dark:border-white/10 text-foreground focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all outline-none"
												/>
												<p className="text-xs text-gray-500 mt-2">
													Must be at least 6 characters long.
												</p>
											</div>

											<button
												type="submit"
												className="w-full py-3 mt-2 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300 hover:-translate-y-0.5"
											>
												Create Account
											</button>
											
											{errorMsg && (
												<div className="mt-4">
													<AlertColors errorMsg={errorMsg} />
												</div>
											)}
										</form>
									) : (
										/* STEP 2: USER DATA DETAILS FORM */
										<motion.form 
											initial={{ opacity: 0, scale: 0.95 }}
											animate={{ opacity: 1, scale: 1 }}
											onSubmit={handleUserData} 
											className="space-y-5"
										>
											<div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
												<p className="text-sm font-medium text-indigo-400 flex items-center gap-2">
													<Sparkles size={16} /> Just a few more details to set up your profile.
												</p>
											</div>

											<div className="space-y-1">
												<label className="text-sm font-medium text-foreground">Full Name</label>
												<input
													ref={nameRef}
													type="text"
													required
													placeholder="John Doe"
													className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#e8e8ec] dark:border-white/10 text-foreground focus:ring-2 focus:ring-indigo-500/50 outline-none"
												/>
											</div>

											<div className="space-y-1">
												<label className="text-sm font-medium text-foreground">Username</label>
												<input
													ref={usernameRef}
													type="text"
													required
													placeholder="johndoe"
													className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#e8e8ec] dark:border-white/10 text-foreground focus:ring-2 focus:ring-indigo-500/50 outline-none"
												/>
											</div>

											<div className="space-y-1">
												<label className="text-sm font-medium text-foreground">Date of Birth</label>
												<input
													ref={dobRef}
													type="date"
													required
													className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#e8e8ec] dark:border-white/10 text-foreground focus:ring-2 focus:ring-indigo-500/50 outline-none dark:[color-scheme:dark]"
												/>
											</div>

											<button
												type="submit"
												className="w-full py-3 mt-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300 hover:-translate-y-0.5"
											>
												Save Profile
											</button>

											<div className="mt-4">
												{errorMsg && <AlertColors errorMsg={errorMsg} />}
												{success && <AlertBasic title="Success!" desc="Moving to next step..." />}
											</div>
										</motion.form>
									)}
								</div>
							}
						/>

						{!showForm && (
							<div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
								Already have an account?{" "}
								<span
									onClick={() => navi("/login")}
									className="text-foreground font-semibold hover:text-indigo-400 cursor-pointer transition-colors"
								>
									Log in here
								</span>
							</div>
						)}
					</div>
				</motion.div>

				<div className="absolute bottom-8 left-0 w-full px-8 sm:px-16 xl:px-24">
					<ProfileFooter />
				</div>
			</div>

			{/* Right Interactive/Premium Section */}
			<div className="hidden lg:flex flex-col items-center justify-center w-1/2 relative bg-[#0a0a0b] border-l border-white/5 overflow-hidden">
				{/* Massive Abstract Glows */}
				<div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[150px] animate-float"></div>
				<div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px] animate-float stagger-3"></div>
				
				{/* Floating Glass Panels (Abstract UI representation) */}
				<motion.div 
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="relative z-10 w-[80%] max-w-lg"
				>
					<div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative">
						<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 flex items-center justify-center shadow-lg">
							<Sparkles className="text-white" size={24} />
						</div>
						<h3 className="text-2xl font-bold text-white mb-2">Build Your Audience</h3>
						<p className="text-gray-400 leading-relaxed mb-6">
							Create a beautiful profile, publish stunning articles, and grow your subscriber base with our powerful tools.
						</p>
						<div className="flex items-center gap-3">
							<div className="flex -space-x-3">
								<div className="w-10 h-10 rounded-full bg-indigo-500 border-2 border-[#141416]"></div>
								<div className="w-10 h-10 rounded-full bg-purple-500 border-2 border-[#141416]"></div>
								<div className="w-10 h-10 rounded-full bg-cyan-500 border-2 border-[#141416]"></div>
							</div>
							<span className="text-sm font-medium text-gray-400">Join 10,000+ creators</span>
						</div>
					</div>
					
					{/* Floating accessory panels */}
					<div className="absolute -right-12 top-12 glass-panel p-4 rounded-2xl border border-white/10 shadow-xl animate-float stagger-2">
						<LineChart className="text-cyan-400 mb-2" size={20} />
						<div className="w-24 h-2 bg-white/10 rounded-full mb-2"></div>
						<div className="w-16 h-2 bg-white/10 rounded-full"></div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}

export default Signup;
