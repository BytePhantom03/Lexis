import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false });

export default function TopProgressBar() {
	const location = useLocation();

	useEffect(() => {
    NProgress.start()
		const timer = setTimeout(() => NProgress.done(), 500);
		return () => clearTimeout(timer);
	}, [location.pathname]);

	return null;
}
