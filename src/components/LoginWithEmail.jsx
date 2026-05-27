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

export function LoginWithEmail({ child }) {
	const isDark = localStorage.getItem("theme");

	return (
		<Dialog>
			<form>
				<DialogTrigger asChild>
					<div>
						<EmailComp />
					</div>
				</DialogTrigger>
				<DialogContent
					className={`sm:max-w-3xl bg-background  backdrop-blur-3xl py-4 pb-12 px-4 `}>
					<DialogHeader>
						<DialogTitle className="font-bold text-xl">
							Login to your account!
						</DialogTitle>
						<DialogDescription className="text-sm  text-foreground dark:text-gray-600">
							Please enter your registered email address and password to access
							your account. <span className="hidden sm:block">Ensure your login details are kept confidential.</span>
						</DialogDescription>
					</DialogHeader>

					{child}
				</DialogContent>
			</form>
		</Dialog>
	);
}
