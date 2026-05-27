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
import { NavLink } from "react-router-dom";

export function SignDialogue({ child, title }) {
	return (
		<Dialog>
			<DialogTrigger asChild>{child}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						Please sign in or create an account to access this feature.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<NavLink to={'/login'} asChild>
						<Button className="w-full ">Sign in</Button>
					</NavLink>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
