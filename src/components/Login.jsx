import React, { useContext, useEffect, useRef, useState } from "react";
import supabase from "../config/supabaseClient";
import { AlertBasic } from "./ui/AlertBasic";
import { ExternalLink, LineChart, LoaderCircle, Sparkles } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { AlertColors } from "./ui/AlertColors";
import { userContext } from "../context/Context";
import { toast } from "sonner";
import GoogleComp from "./GoogleComp";
import LoginDivider from "./LoginDivider";
import { LoginWithEmail } from "./LoginWithEmail";
import illustration from "../assets/illu2.svg";
import ProfileFooter from "./ProfileFooter";
import { motion } from "framer-motion";

function Login() {

	
	const [errorMsg, setErrorMsg] = useState(null);
	const [, setSuccess] = useState();
	const emailRef = useRef();
	const passwordRef = useRef();
	const navi = useNavigate();
	const [userInfo, , loadUser] = useContext(userContext);

	useEffect(() => {
		document.title = "Log in | Lexis"
		if (userInfo) {
			navi("/", {
				replace: true,
			});
			return;
		}
	}, []);

	async function handleSubmit(event) {
		event.preventDefault();
		let email = emailRef.current.value;
		let password = passwordRef.current.value;

		try {
			let { data, error } = await supabase.auth.signInWithPassword({
				email: email,
				password: password,
			});

			if (error) {
				if (!error.code) {
					setErrorMsg({
						code: null,
						message: "Something went wrong.",
					});
					alert(error);
				} else {
					setErrorMsg(error);
				}

				return;
			}
			if (data) {
				setErrorMsg(null);
				setSuccess(true);
				toast("Success! You logged in.");
				// loadUser will be triggered automatically by onAuthStateChange
				// Navigate to auth which will redirect to home
				navi("/home", { replace: true });
			}
		} catch (error) {
			setErrorMsg(error);
		}
	}

	return (
		<div className="flex min-h-screen bg-background selection:bg-indigo-500/30">
			<div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-24 relative min-h-screen">
				{/* Background Glow */}
				<div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
					<div className="absolute top-0 left-0 w-full h-1/2 bg-indigo-500/5 blur-[150px]"></div>
				</div>

				{!userInfo && (
					<motion.div 
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}
						className="w-full max-w-sm mx-auto"
					>
						{/* Brand */}
						<div 
							onClick={() => navi("/")}
							className="flex items-center gap-2 cursor-pointer mb-12 w-fit"
						>
							<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
								<Sparkles size={16} className="text-white" />
							</div>
							<h1 className="text-2xl font-bold tracking-tight text-foreground">Lexis</h1>
						</div>

						{/* Welcome heading */}
						<h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">
							Welcome back
						</h2>
						<p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
							Log in to your digital desk and start creating.
						</p>

						{/* Google auth */}
						<div className="mb-6">
							<GoogleComp />
						</div>

						<LoginDivider />

						<LoginWithEmail
							child={
								<form onSubmit={handleSubmit} className="mt-6 space-y-5">
									<div className="space-y-1">
										<label htmlFor="email" className="text-sm font-medium text-foreground">
											Email
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
										<div className="flex items-center justify-between">
											<label htmlFor="password" className="text-sm font-medium text-foreground">
												Password
											</label>
											<NavLink to={"/flow"} className="text-xs text-indigo-500 hover:text-indigo-400 font-medium transition-colors">
												Forgot password?
											</NavLink>
										</div>
										<input
											onChange={() => setErrorMsg(null)}
											ref={passwordRef}
											type="password"
											id="password"
											required
											placeholder="••••••••"
											minLength={6}
											className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#e8e8ec] dark:border-white/10 text-foreground focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all outline-none"
										/>
									</div>

									<button
										type="submit"
										className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all duration-300 hover:-translate-y-0.5"
									>
										Continue
									</button>

									{errorMsg && <AlertColors errorMsg={errorMsg} />}
								</form>
							}
						/>

						<div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
							Don't have an account?{" "}
							<span
								onClick={() => navi("/signup")}
								className="text-foreground font-semibold hover:text-indigo-400 cursor-pointer transition-colors"
							>
								Sign up for free
							</span>
						</div>
					</motion.div>
				)}

				{userInfo && (
					<div className="flex flex-col items-center justify-center w-full">
						<LoaderCircle size={32} className="animate-spin text-indigo-500 mb-4" />
						<p className="text-gray-500 dark:text-gray-400 font-medium">Entering your workspace...</p>
					</div>
				)}

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
						<h3 className="text-2xl font-bold text-white mb-2">The AI Copilot for Writers</h3>
						<p className="text-gray-400 leading-relaxed mb-6">
							Experience the fastest way to craft compelling stories, articles, and documentation. Powered by models that understand your tone.
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

export default Login;
