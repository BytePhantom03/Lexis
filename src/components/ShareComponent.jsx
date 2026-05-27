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
export function ShareComponent({ title, body, username, id }) {
	const url = window.location.origin;
	const shareUrl = `${url}/article?id=${id}`;
	const [copied, setCopied] = useState(false);

	async function handleShare() {
		if (navigator.share) {
			try {
				await navigator.share({
					title: title,
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
	return (
		<div>
			<Dialog>
				<form>
					<DialogTrigger asChild>
						<div className="flex items-center">
							<Send size={20} /> <span className="px-1 text-xs">Share</span>
						</div>
					</DialogTrigger>
					<DialogContent className="sm:max-w-sm">
						<DialogHeader>
							<DialogTitle>{title}</DialogTitle>
							<DialogDescription>
								<div className="max-h-20  overflow-y-clip  max-w-full flex wrap-anywhere flex-wrap ">
									{parse(body)}
								</div>

								<div className="mt-2 border px-2 py-1 rounded-sm ">
									<div className="flex gap-2">
										<span className="font-semibold text-gray-700 dark:text-gray-600">
											Auhtor :
										</span>{" "}
										<NavLink
											to={`/profile/${username}`}
											className="text-foreground font-semibold  rounded-sm  ">
											{" "}
											@{username}
										</NavLink>
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
