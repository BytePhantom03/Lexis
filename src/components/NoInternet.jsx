import React from "react";
import { Player, Controls } from "@lottiefiles/react-lottie-player";
import useOnlineStatus from "./InternetStatus";
import path from "../assets/NoConnection.json";

function Offline() {
	let isOnline = useOnlineStatus();

	return (
		<div className="select-none h-screen w-screen flex flex-col items-center justify-center  ">
			<Player
				autoplay
				loop
				speed={2}
				className="h-40 m-0  sm:h-54   md:h-60"
				src={path}></Player>

			<h2 className="text-center text-gray-300 bg-gray-800 -mt-8 sm:-mt-12 rounded px-4 font-mono  my-0  py-0 text-sm font-extralight">
				{isOnline ? "Connecting..." : "No Connection"}
			</h2>
		</div>
	);
}

export default Offline;
