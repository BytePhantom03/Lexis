export function capturePhoto() {
  return new Promise((resolve, reject) => {
    const video = document.getElementById("camera");

    if (!video) {
      reject("Video element not found");
      return;
    }

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

      // Preview
      const preview = document.getElementById("preview");
      if (preview) {
        preview.src = URL.createObjectURL(file);
      }

      resolve(file); // ✅ return here
    }, "image/png");
  });
}