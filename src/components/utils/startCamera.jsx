let stream; // declare globally (if you want to stop later)

export async function startCamera({ setStatus }) {
	const video = document.getElementById("camera");

	if (!video) {
		console.error("Video element not found");
		return;
	}

	try {
		stream = await navigator.mediaDevices.getUserMedia({ video: true });

		video.srcObject = stream;
		setStatus(1);

		await video.play(); // ensures playback starts
	} catch (err) {
		console.error("Camera error:", err);
	}
}

