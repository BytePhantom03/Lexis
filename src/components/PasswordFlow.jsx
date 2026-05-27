import React, { useState } from "react";
import supabase from "../config/supabaseClient";

function PasswordFlow() {
	const [email, setEmail] = useState("");
	const [success, setSuccess] = useState();
	const [errorMsg, setErrorMsg] = useState();
	const [loading, setLoading] = useState();

	async function handleSubmit(e) {
		setLoading(true);
		e.preventDefault();
		const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/reset-password`,
		});
		if (error) {
			setErrorMsg(error);
			setLoading(false);
		} else if (data) {
			setSuccess(`A email containing password reset link was sent to your registered email address.`);
			setErrorMsg(null);
			setLoading(false);
		}
	}
	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="bg-background p-8 rounded-2xl shadow-md w-full max-w-md">
				<h2 className="text-2xl font-semibold text-center mb-6">
					Reset Your Password
				</h2>

		{
            !success && 		<form className="space-y-4" onSubmit={handleSubmit}>
					<div>
						<label className="block text-sm mb-1">Enter your email</label>
						<input
							type="email"
							placeholder="Enter your email used in your account."
							className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground-500"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full dark:bg-background border text-foreground py-2 rounded-lg disabled:cursor-not-allowed disabled:bg-gray-300 transition">
						{!loading ? "Send password reset link" : "Please Wait"}
					</button>

					{errorMsg && (
						<div className="text-red-600 border border-red-500 rounded px-2">
							<p>Error Occurred</p>
							<p>{errorMsg?.message}</p>
						</div>
					)}
				
				</form>
        }
                	{success && (
						<div className="bg-green-600 text-forground border py-2 border-green-500 rounded px-2">
							<p>{success}</p>
						</div>
					)}
			</div>
		</div>
	);
}

export default PasswordFlow;
