function updateStatusBar(isDark) {
	const meta = document.getElementById("statusBar");
	if (meta) meta.setAttribute("content", isDark ? "#000000" : "#ffffff");
}


let set = new Set()


export {updateStatusBar}