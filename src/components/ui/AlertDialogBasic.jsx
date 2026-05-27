import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { themeContext } from "../../context/Context";
import { LogOut } from "lucide-react";
import supabase from "../../config/supabaseClient";
import { useNavigate } from "react-router-dom";

export function AlertDialogBasic({ titleText }) {
	const [theme] = useContext(themeContext);
	console.log(theme);
	const navigate = useNavigate();

	async function handleLogOut() {
		const res = await supabase.auth.signOut();
		if (res.error) {
			alert(`Can't LogOut.
        Error : ${res.error.message}`);
			return null;
		}

		localStorage.removeItem("sb-qnxquvnewtbzdgywthlw-auth-token")
		window.location.reload()
		navigate("/home");

		return;
	}
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<div className=" justify-start text-red-600 hover:text-red-300  whitespace-nowrap flex items-center   transition cursor-pointer  w-full ">
					<LogOut size={14} className="hover:-rotate-12 mx-1 " />{" "}
					<span className="ml-0.5 text-sm font-normal">
						{titleText ? titleText : "Show Dialog"}
					</span>
				</div>
			</AlertDialogTrigger>
			<AlertDialogContent className={`${theme} bg-background text-foreground `}>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						You will be log out of your account. Click 'Continue' to log out.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction className="hover:bg-red-600">
						<span onClick={handleLogOut}>Continue</span>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
