import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, Send } from "lucide-react";
import parse from "html-react-parser";
import { NavLink, useNavigate, useNavigation } from "react-router-dom";
import { useState } from "react";
export default function ShareProfile({ name, username }) {
	const url = window.location;
	const shareUrl = `${url}`;
	const [copied, setCopied] = useState(false);
	const [copiedUserName, setCopiedUserName] = useState(false);

	async function handleShare() {
		if (navigator.share) {
			try {
				await navigator.share({
					title: name + " " + "@" + username,
					url: shareUrl,
				});
				console.log("Shared successfully");
			} catch (err) {
				console.error("Error sharing:", err.message);
			}
		} else {
			// 2. Fallback for unsupported browsers
			alert("Web Share API not supported. You can copy the link manually!");
		}
	}

	async function handleCopy() {
		setCopied(true);
		try {
			await navigator.clipboard.writeText(shareUrl);
		} catch (err) {
			console.error("Failed to copy: ", err);
		}

		setTimeout(() => {
			setCopied(false);
		}, 4000);
	}

	async function copyUsername() {
		setCopiedUserName(true);
		try {
			await navigator.clipboard.writeText("Ravi123");
		} catch (err) {
			console.error("Failed to copy: ", err);
		}

		setTimeout(() => {
			setCopiedUserName(false);
		}, 4000);
	}
	return (
		<div>
			<Dialog>
				<form>
					<DialogTrigger asChild>
						<div className="p-1 px-4 whitespace-nowrap flex items-center   transition cursor-pointer  w-full ">
							<Send size={14} className="hover:-rotate-12 mx-1 mr-2.5" /> Share
						</div>
					</DialogTrigger>
					<DialogContent className="sm:max-w-sm">
						<DialogHeader>
							<DialogTitle>{name}</DialogTitle>
							<DialogDescription>
								<div className="mt-2 border px-2 py-1 rounded-sm ">
									<div className="flex gap-2">
										<NavLink
											to={`/profile/${"username"}`}
											className="text-foreground   rounded-lg   ">
											{" "}
											@{username}
										</NavLink>
										<span
											onClick={copyUsername}
											className="cursor-pointer pt-1">
											{!copiedUserName && <Copy size={12} />}

											{copiedUserName && (
												<Check
													color="green"
													strokeWidth="4"
													size={18}
													className="border-gray-400 rounded-xs "
												/>
											)}
										</span>
									</div>

									<div className="flex gap-2 my-1">
										<span className="flex items-center gap-2 ">
											{" "}
											<span className="text-cyan-800 bg-gray-300 dark:bg-gray-900 px-2 rounded-sm overflow-hidden   max-h-10    flex-nowrap ">
												{shareUrl}
											</span>
											<span onClick={handleCopy} className="cursor-pointer">
												{!copied && <Copy size={16} />}

												{copied && (
													<Check
														color="green"
														strokeWidth="4"
														size={20}
														className="border-gray-400 rounded-xs "
													/>
												)}
											</span>
										</span>
									</div>
								</div>
							</DialogDescription>
						</DialogHeader>

						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">Cancel</Button>
							</DialogClose>
							<Button type="submit">
								<div className="flex items-center" onClick={handleShare}>
									<Send size={10} /> <span className="px-1 text-sm">Share</span>
								</div>{" "}
							</Button>
						</DialogFooter>
					</DialogContent>
				</form>
			</Dialog>
		</div>
	);
}
