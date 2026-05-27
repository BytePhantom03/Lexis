/**
 * Upload an image file to Cloudinary
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */

const cloudname = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", preset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudname}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Upload failed");
    }

    const data = await response.json();
    return data.secure_url; // Returns HTTPS URL

  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};


