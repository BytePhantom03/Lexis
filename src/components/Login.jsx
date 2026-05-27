import React, { useContext, useEffect, useRef, useState } from "react";
import supabase from "../config/supabaseClient";
import { AlertBasic } from "./ui/AlertBasic";
import { ExternalLink, LineChart, LoaderCircle } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { AlertColors } from "./ui/AlertColors";
import { userContext } from "../context/Context";
import { toast } from "sonner";
import GoogleComp from "./GoogleComp";
import LoginDivider from "./LoginDivider";
import { LoginWithEmail } from "./LoginWithEmail";
import illustration from "../assets/illu2.svg";
import ProfileFooter from "./ProfileFooter";

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
		<div className="flex min-h-screen bg-[#fafafa] dark:bg-[#0a0a0b]">
			<div className="w-full md:w-1/2">
				{!userInfo && (
					<div className="flex flex-col justify-center px-8 sm:px-16 lg:px-24 relative min-h-screen">
						{/* Brand */}
						<h1
							onClick={() => navi("/")}
							className="gradient-text text-2xl font-bold cursor-pointer mb-2">
							Lexis
						</h1>

						{/* Welcome heading */}
						<p className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-12">
							Welcome{" "}
							<span className="gradient-text">
								{" "}
								<br />
								back{" "}
								<span className="inline-block -ml-2 mx-0 px-0 rotate-6 hover:rotate-0 transition-transform duration-300 cursor-default">
									!
								</span>
							</span>
						</p>

						{/* Subtitle */}
						<p className="text-lg text-gray-500 dark:text-gray-400 mt-4 border-l-4 border-indigo-500 pl-4">
							Log in to your digital desk.
						</p>

						{/* Google auth */}
						<div className="mt-8">
							<GoogleComp />
						</div>

						<br />
						<LoginWithEmail
							child={
								<div>
									<form onSubmit={handleSubmit}>
										<div className="flex justify-center flex-col gap-0">
											<label
												htmlFor="email"
												className="text-sm font-normal text-gray-700 dark:text-gray-300">
												Enter your email
											</label>{" "}
											<input
												onChange={() => {
													setErrorMsg(null);
												}}
												ref={emailRef}
												type="email"
												id="email"
												required
												title="Enter your email"
												placeholder="lexis@exmple.com"
												className="p-2.5 mt-1 lowercase border border-[#e8e8ec] dark:border-[#2a2a2e] outline-0 rounded-xl bg-white dark:bg-[#141416]
												text-gray-900 dark:text-white
												w-full sm:w-3/4
												focus:ring-2 focus:ring-indigo-500/40 transition-all duration-300
												"
											/>
											<br />
											<label
												htmlFor="password"
												className="text-sm font-normal text-gray-700 dark:text-gray-300">
												Enter your password
											</label>{" "}
											<input
												onChange={() => {
													setErrorMsg(null);
												}}
												ref={passwordRef}
												type="text"
												id="password"
												required
												placeholder="••••••"
												minLength={6}
												maxLength={20}
												title="enter your password"
												className="p-2.5 mt-1 border border-[#e8e8ec] dark:border-[#2a2a2e] outline-0 rounded-xl bg-white dark:bg-[#141416]
												text-gray-900 dark:text-white
												w-full sm:w-3/4
												focus:ring-2 focus:ring-indigo-500/40 transition-all duration-300
												"
											/>{" "}
											<p className="text-xs wrap-anywhere text-gray-500 dark:text-gray-500 mt-2">
												Possibly your password had min. length 6, included{" "}
												<br className="hidden sm:block" />
												uppercase,lowercase,numbers and special symbols.
											</p>
										</div>

										<div className="flex flex-col sm:flex-row justify-start items-center mt-4 gap-4">
											{" "}
											<button
												type="submit"
												className="btn-primary px-8 py-2.5 rounded-xl text-white font-medium cursor-pointer transition-all duration-300">
												Continue
											</button>
											<div className="text-sm underline text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-all duration-300">
												<NavLink to={"/flow"}>Forgot password?</NavLink>
											</div>
										</div>

										{errorMsg && <AlertColors errorMsg={errorMsg} />}
									</form>
								</div>
							}
						/>

						<br />
						<div className="text-sm text-gray-600 dark:text-gray-400">
							Don't have an account?{" "}
							<span
								onClick={() => {
									navi("/signup");
								}}
								className="text-indigo-500 hover:text-indigo-400 cursor-pointer underline transition-all duration-300">
								Create one
								<ExternalLink className="inline ml-1 mb-1" size={"12px"} />
							</span>
						</div>

						{/* Footer */}
						<div className="mt-auto pt-8">
							<ProfileFooter />
						</div>
					</div>
				)}

				{userInfo && (
					<div
						className={`min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0b]`}>
						<div className="flex items-center gap-2 text-gray-900 dark:text-white">
							<LoaderCircle size={24} className="animate-spin" />
							<span>Hold tight...</span>
						</div>
					</div>
				)}
			</div>

			{/* Right illustration section */}
			<div className="hidden md:flex items-center justify-center w-1/2 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20">
				<img
					src={illustration}
					className="w-full max-w-lg animate-float"
					alt="Lexis Illustration"
				/>
			</div>

			
			
		</div>
	);
}

export default Login;
