import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2Icon, UserX } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { themeContext, userContext } from "../context/Context";
import supabase from "../config/supabaseClient";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function AlertDialogDestructive() {
	const navigate = useNavigate();
	const [isDark] = useContext(themeContext);
	const [info] = useContext(userContext);

	const [input, setInput] = useState();
	const inputRef = useRef();
	const [active, setActive] = useState(false);
	let token = localStorage.getItem("userTokenLexis");

	useEffect(() => {
		if (!info && !token) navigate("/auth");
	}, []);

	async function handleDelete() {
		try {
			const { error: deleteError } = await supabase
				.from("UserTable")
				.delete()
				.eq("username", info?.username);

			if (deleteError) {
				toast("Error occurred while deleting account.");
				return;
			}

			const { error: authError } = await supabase.auth.signOut();

			if (authError) {
				toast("Error occurred while deleting account.");
				return;
			}

			toast("Successfully deleted account.");
			setTimeout(() => navigate("/login"), 2000);
		} catch (err) {
			console.error(err);
			toast("Unexpected error occurred.");
		}
	}
	let str = info ? info?.username : "delete my account";
									str = str.toLowerCase();
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive" className="cursor-pointer text-sm">
					<div onClick={()=>{toast("Sorry ! You are not allowed to delete your account currently.")}}>Delete your account</div>
				</Button>
			</AlertDialogTrigger>
		</AlertDialog>
	);
}
