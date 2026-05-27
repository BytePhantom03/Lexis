import React, { useContext, useEffect, useState } from "react";
import supabase from "../config/supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { userContext } from "../context/Context";

function ResetPassword() {
	const [loading, setLoading] = useState(true);
	const [sessionValid, setSessionValid] = useState(false);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const navigate = useNavigate();
	const [, , loadUser] = useContext(userContext);

	useEffect(() => {
		async function checkSession() {
			const { data, error } = await supabase.auth.getSession();

			if (error || !data?.session) {
				setSessionValid(false);
			} else {
				setSessionValid(true);
			}

			setLoading(false);
		}

		checkSession();
	}, []);

	useEffect(() => {
		if (!loading && !sessionValid) {
			const timer = setTimeout(() => {
				navigate("/login");
			}, 2000);

			return () => clearTimeout(timer);
		}
	}, [loading, sessionValid, navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			alert("Passwords do not match");
			return;
		}

		const { error } = await supabase.auth.updateUser({
			password: password,
		});
		if (error) {
			toast(error.message);
			return;
		}
		if (!error) {
			const Out = await supabase.auth.signOut();
			if (Out.error) {
				toast("Somethign Went Wrong.");
			} else {
				toast("✅ Password reset Successfuly.");
				if (loadUser) loadUser();
				navigate("/auth");
			}
		}
	};

	if (loading) {
		return <div className="text-center mt-10">Checking reset link...</div>;
	}

	if (!sessionValid) {
		return (
			<div className="text-center mt-10">
				Reset link expired. Redirecting to login...
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="bg-background p-8 rounded-2xl shadow-md w-full max-w-md">
				<h2 className="text-2xl font-semibold text-center mb-6">
					Reset Your Password
				</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm mb-1">New Password</label>
						<input
							type="password"
							className="w-full px-3 py-2 border rounded-lg"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					<div>
						<label className="block text-sm mb-1">Confirm Password</label>
						<input
							type="password"
							className="w-full px-3 py-2 border rounded-lg"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
						/>
					</div>

					<button
						type="submit"
						className="w-full bg-blue-600 text-white py-2 rounded-lg">
						Update Password
					</button>
				</form>
			</div>
		</div>
	);
}

export default ResetPassword;
