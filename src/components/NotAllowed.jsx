import React from "react";
import { Lock, ArrowLeft, Home } from "lucide-react";

const NotAllowed = () => {
	return (
		<div className="min-h-screen bg-backgorund flex items-center justify-center px-6">
			<div className="max-w-md w-full text-center">
				<div className="flex justify-center mb-6">
					<div className="p-4 bg-red-100 rounded-full">
						<Lock className="w-12 h-12 text-red-600" />
					</div>
				</div>

				<h1 className="text-4xl font-bold text-foreground mb-2">403</h1>
				<h2 className="text-2xl font-semibold text-foreground mb-4">
					Access Denied
				</h2>
				<p className="text-foreground mb-8 leading-relaxed">
					Sorry, you don't have the necessary permissions to view this page.
					{/* Please contact your administrator if you believe this is a mistake. */}
				</p>

				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<button
						onClick={() => window.history.back()}
						className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-foreground bg-background border border-foreground rounded-lg  transition-colors">
						<ArrowLeft className="w-4 h-4" />
						Go Back
					</button>

					<a
						href="/"
						className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-foreground bg-background rounded-lg transition-colors shadow-sm">
						<Home className="w-4 h-4" />
						Return Home
					</a>
				</div>
			</div>
		</div>
	);
};

export default NotAllowed;
