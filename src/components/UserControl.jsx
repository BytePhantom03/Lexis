import React from "react";
import { Button } from "@/components/ui/button";
import { AlertDialogBasic } from "../components/ui/AlertDialogBasic";
import { AlertDialogDestructive } from "./AlertDialogDestructive";
import ProfileFooter from "./ProfileFooter";

function ButtonDestructive({ text }) {
	return <Button variant="destructive">{text ? text : "Destructive"}</Button>;
}

function UserControl() {
	return (
		<div className="min-h-screen py-2 px-2 ">
			<div>
				<label htmlFor="">
					<p className="text-lg font-semibold"> Account Deleteion </p>
					<hr className="py-2" />
					<p className="text-sm text-gray-400">
						Deleting your account will erase your entire data permanently and
						this is can not be recover later.
					</p>
					<br />
					<AlertDialogDestructive />
				</label>
			</div>

			<div className="absolute bottom-0 right-0 w-full  ">
				<ProfileFooter />
			</div>
		</div>
	);
}

export default UserControl;
