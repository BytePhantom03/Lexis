import React, { useEffect, useRef, useState } from "react";
import supabase from "../config/supabaseClient";
import { AlertColors } from "./ui/AlertColors";
import { AlertBasic } from "./ui/AlertBasic";
import { NavLink, useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import GoogleComp from "./GoogleComp";
import LoginDivider from "./LoginDivider";
import EmailComp from "./EmailComp";
import { SignWithEmail } from "./SignWithEmail";
import illustration from "../assets/illu2.svg";
import ProfileFooter from "./ProfileFooter";

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
		<div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0b] overflow-x-hidden">
			{/* Logo */}
			<div>
				<h1
					onClick={() => navi("/")}
					className="fixed top-6 left-6 md:left-12 z-50 text-2xl font-bold gradient-text cursor-pointer">
					Lexis
				</h1>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 min-h-screen w-full items-center">
				<div className="flex flex-col justify-center px-6 py-20 md:px-16 lg:px-24">
					<header className="mb-10">
						<p className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
							Give your <br />
							<span className="gradient-text">
								stories
							</span>{" "}
							a home.
						</p>
						<p className="mt-6 text-lg md:text-xl border-l-4 border-indigo-500 pl-4 text-gray-500 dark:text-gray-400 max-w-md">
							Join a community of modern thinkers. Get started now.
						</p>
					</header>

					<div className="space-y-6 w-full">
						<GoogleComp />
						<SignWithEmail
							child={
								<div className="w-full flex ">
									{!showForm ? (
										/* LOGIN / INITIAL SIGNUP FORM STYLE */
										<div>
											<form onSubmit={handleSubmit}>
												<div className="sm:mx-12 mx-2 flex flex-col gap-0">
													<label
														htmlFor="email"
														className="text-sm font-normal text-foreground">
														Enter your email
													</label>
													<input
														onChange={() => setErrorMsg(null)}
														ref={emailRef}
														type="email"
														id="email"
														required
														placeholder="lexis@exmple.com"
														className="p-2.5 mt-1 lowercase w-full rounded-xl
														bg-[#f5f5f7] dark:bg-[#1c1c1f]
														border border-[#e8e8ec] dark:border-[#2a2a2e]
														text-foreground outline-none
														focus:ring-2 focus:ring-indigo-500/40
														transition-all duration-200
														"
													/>
													<br />
													<label
														htmlFor="password"
														className="text-sm font-normal text-foreground">
														Enter your password
													</label>
													<input
														onChange={() => setErrorMsg(null)}
														ref={passwordRef}
														type="text" /* Changed to password type for security */
														id="password"
														required
														placeholder="••••••"
														minLength={6}
														maxLength={20}
														className="p-2 mt-1 e border-0 outline-0 rounded-sm  bg-slate-300 
														
														text-foreground
														min-w-1 sm:w-2/2 
														dark:bg-gray-800
														
														"
													/>
													<p className="text-xs wrap-anywhere text-slate-800  text-sm   dark:text-slate-500/60 mt-2">
														Possibly your password had min. length 6, included
														<br className="hidden sm:block" />
														uppercase, lowercase, numbers and special symbols.
													</p>
												</div>

												<div className="flex flex-col sm:flex-row justify-center sm:justify-start items-center">
													<button
														type="submit"
														className="btn-primary mt-4 px-8 py-2.5 rounded-xl text-sm font-semibold cursor-pointer sm:ml-12 transition-all duration-300">
														Continue
													</button>
												</div>
												{errorMsg && (
													<div className="mx-12 mt-4">
														<AlertColors errorMsg={errorMsg} />
													</div>
												)}
											</form>
										</div>
									) : (
										/* USER DATA DETAILS FORM STYLE */
										<div className="w-full sm:min-w-1/2">
											<form onSubmit={handleUserData}>
												<div className="sm:mx-12 justify-center  mx-2 flex flex-col gap-0 overflow-y-scroll no-scrollbar">
													<label className="text-sm font-normal text-foreground">
														Full Name
													</label>
													<input
														ref={nameRef}
														type="text"
														required
														className="p-2 mt-1 lowercase border-0 outline-0 rounded-sm  bg-slate-300 
														
														text-foreground
														min-w-1 sm:w-2/2 
														dark:bg-gray-800
														
														"
													/>
													<br />
													<label className="text-sm font-normal text-foreground">
														Username
													</label>
													<input
														ref={usernameRef}
														type="text"
														required
														className="p-2 mt-1 lowercase border-0 outline-0 rounded-sm  bg-slate-300 
														
														text-foreground
														min-w-1 sm:w-2/2 
														dark:bg-gray-800
														
														"
													/>
													<br />
													<label className="text-sm font-normal text-foreground">
														Date of Birth
													</label>
													<input
														ref={dobRef}
														type="date"
														required
														className="p-2 mt-1 lowercase border-0 outline-0 rounded-sm  bg-slate-300 
														
														text-foreground
														min-w-1 sm:w-2/2 
														dark:bg-gray-800
														
														"
													/>
												</div>

												<div className="flex flex-col sm:flex-row justify-center sm:justify-start items-center">
													<button
														type="submit"
														className="btn-primary mt-4 px-8 py-2.5 rounded-xl text-sm font-semibold cursor-pointer sm:ml-12 transition-all duration-300">
														Save
													</button>
												</div>

												<div className="mx-12 mt-4">
													{errorMsg && <AlertColors errorMsg={errorMsg} />}
													{success && (
														<AlertBasic
															title="Success!"
															desc="Moving to next step..."
														/>
													)}
												</div>
											</form>
										</div>
									)}
								</div>
							}
						/>

						<p className="text-sm text-gray-600 dark:text-gray-400">
							Already have an account?{" "}
							<span
								onClick={() => navi("/login")}
								className="text-indigo-500 hover:text-indigo-400 cursor-pointer underline font-medium transition-colors">
								Log in <ExternalLink className="inline pb-1" size={14} />
							</span>
						</p>
					</div>
				</div>

				<div className="hidden md:flex items-center justify-center h-full bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20">
					<img
						src={illustration}
						className="w-4/5 max-w-lg object-contain animate-float"
						alt="Lexis Illustration"
					/>
				</div>
			</div>

			<div className="absolute bottom-0 right-0 w-full  ">
				<ProfileFooter />
			</div>
		</div>
	);
}

export default Signup;
