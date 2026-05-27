import React from "react";
import { Spinner } from "@/components/ui/spinner";

function Loader({ text }) {
	return (
		<div className=" ">
			<div className="flex items-center  h-full w-full bg-background-200 border px-2 py-2 rounded-full  justify-self-center">
				<Spinner />{" "}
				<span className="ml-1 text-foreground">
					{text}
					{!text && "Please wait."}
				</span>
			</div>
		</div>
	);
}

export default Loader;
