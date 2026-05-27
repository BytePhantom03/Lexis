export function captureCamera() {
	return new Promise((resolve, reject) => {
		const video = document.createElement("video");
		video.style.position = "fixed";
		video.style.top = "-1000px";
		document.body.appendChild(video);

		navigator.mediaDevices
			.getUserMedia({ video: true })
			.then((stream) => {
				video.srcObject = stream;

				video.onloadedmetadata = () => {
					video.play();
				

					setTimeout(() => {
						const canvas = document.createElement("canvas");
						canvas.width = video.videoWidth;
						canvas.height = video.videoHeight;

						const ctx = canvas.getContext("2d");
						ctx.drawImage(video, 0, 0);

						canvas.toBlob((blob) => {
							if (!blob) {
								reject("Failed to capture image");
								return;
							}

							const file = new File([blob], "photo.png", { type: "image/png" });

							// Stop camera
							stream.getTracks().forEach((track) => track.stop());
							video.remove();

							resolve(file);
						}, "image/png");
					}, 500);
				};
			})
			.catch((err) => reject(err));
	});
}
