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
import EmailComp from "./EmailComp";
import { useContext } from "react";
import { themeContext } from "../context/Context";

export function SignWithEmail({ child }) {
	const [isDark] = useContext(themeContext);
	return (
		<Dialog>
			<form>
				<DialogTrigger asChild>
					<div>
						<EmailComp />
					</div>
				</DialogTrigger>

				<DialogContent
					className="sm:max-w-3xl bg-background backdrop-blur-3xl py-4 pb-12 px-4">
					<DialogHeader>
						<DialogTitle  className="font-bold text-xl">Create Account</DialogTitle>
						<DialogDescription  className="text-sm  text-foreground dark:text-slate-500/60">
							Please ensure your email address is accurate and choose a secure
							password. <span className="hidden sm:block">All provided details must be authentic.</span>
						</DialogDescription>
					</DialogHeader>
					{child}
				</DialogContent>
			</form>
		</Dialog>
	);
}
