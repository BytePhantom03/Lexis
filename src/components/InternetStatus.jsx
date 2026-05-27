import { useEffect, useState } from "react";

function useOnlineStatus() {
	const [online, setOnline] = useState(navigator.onLine);
	useEffect(() => {
		function setON() {
			setOnline(true);
		}

		function setOff() {
			setOnline(false);
		}
		window.addEventListener("online", setON);
		window.addEventListener("offline", setOff);

		return () => {
			window.removeEventListener("online", setON);
			window.removeEventListener("offline", setOff);
		};
	}, []);
	return online;
}

export default useOnlineStatus;
