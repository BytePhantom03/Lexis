import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialogDestructive } from "./AlertDialogDestructive";
import ProfileFooter from "./ProfileFooter";
import { KeyRound, ExternalLink, CheckCircle2 } from "lucide-react";

function UserControl() {
	const [apiKey, setApiKey] = useState("");
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		const storedKey = localStorage.getItem("lexis_groq_api_key");
		if (storedKey) {
			setApiKey(storedKey);
		}
	}, []);

	const handleSaveKey = () => {
		localStorage.setItem("lexis_groq_api_key", apiKey.trim());
		setSaved(true);
		setTimeout(() => setSaved(false), 3000);
	};

	return (
		<div className="min-h-screen py-2 px-2 pb-24">
			{/* AI Copilot Settings Section */}
			<div className="mb-12">
				<div className="flex items-center gap-2 mb-2">
					<KeyRound size={20} className="text-primary" />
					<p className="text-lg font-semibold">AI Copilot Settings</p>
				</div>
				<hr className="py-2 border-gray-200 dark:border-gray-800" />
				
				<div className="space-y-4 max-w-2xl">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						The AI Copilot uses Groq's lightning-fast inference API. To use the `/ai` commands, 
						you must provide your own free Groq API key. Your key is stored securely in your 
						browser's local storage and is never sent to our servers.
					</p>

					<div className="flex flex-col gap-2">
						<label htmlFor="groqKey" className="text-sm font-medium">Groq API Key</label>
						<div className="flex gap-3">
							<input
								id="groqKey"
								type="password"
								placeholder="gsk_................................"
								value={apiKey}
								onChange={(e) => setApiKey(e.target.value)}
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
							/>
							<Button onClick={handleSaveKey} className="min-w-[100px]">
								{saved ? <span className="flex items-center gap-2"><CheckCircle2 size={16}/> Saved</span> : "Save Key"}
							</Button>
						</div>
						<a 
							href="https://console.groq.com/keys" 
							target="_blank" 
							rel="noreferrer"
							className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-1 w-fit"
						>
							Get a free API key from Groq Console <ExternalLink size={12} />
						</a>
					</div>
				</div>
			</div>

			{/* Account Deletion Section */}
			<div>
				<label htmlFor="">
					<p className="text-lg font-semibold text-red-600"> Account Deletion </p>
					<hr className="py-2 border-gray-200 dark:border-gray-800" />
					<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
						Deleting your account will erase your entire data permanently and
						this can not be recovered later.
					</p>
					<AlertDialogDestructive />
				</label>
			</div>

			<div className="fixed bottom-0 right-0 w-full bg-background border-t">
				<ProfileFooter />
			</div>
		</div>
	);
}

export default UserControl;
