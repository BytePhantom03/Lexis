import React, { useState } from "react";
import { ChevronLeft, ImageUp, PencilIcon, X } from "lucide-react";
import supabase from "../config/supabaseClient";

const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const dbname = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

function ProfileImageUpdater({
  setImgEditor,
  user_id,
  profileImg,
  setProfileImg,
}) {
  const [preview, setPreview] = useState();
  const [file, setFile] = useState();

  async function handleImgSubmit() {
    event.preventDefault();

    if (file) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", preset);
      data.append("cloud_name", dbname);

      try {
        let cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${dbname}/image/upload`,
          {
            method: "POST",
            body: data,
          }
        );

        let cloudinaryData = await cloudinaryRes.json();

        if (cloudinaryRes.ok && user_id) {
          let supabaseRes = await supabase
            .from("UserTable")
            .update({ profile_img: cloudinaryData?.secure_url })
            .eq("user_id", user_id)
            .select();

          if (supabaseRes.error) {
            return;
          } else {
            setProfileImg(preview);
            setPreview(null);
          }
        }
      } catch (error) {
      }
    }
  }

  function handleChange() {
    let fileData = event.target.files[0];
    if (fileData) {
      let url = URL.createObjectURL(fileData);
      setPreview(url);
      setFile(fileData);
    }
  }

  return (
    <div className="fixed inset-0  w-full h-fit bg-opacity-50 flex items-center justify-center box-border z-50 p-2 sm:p-4">
      <div className="relative dark:bg-[#161616]  bg-gray-100 border border-gray-300 rounded-xl p-4 sm:p-8 md:p-12">
        <X
          onClick={() => {
            setImgEditor((p) => !p);
          }}
          size={20}
          className="bg-white dark:bg-[#1c1c1f]  rounded-full cursor-pointer absolute -top-2 -right-2 p-1 hover:bg-gray-200 transition"
        />

        <div className="w-full font-bold text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4">
          Edit profile photo
        </div>

        <div>
          <img
            src={profileImg}
            alt="current profile"
            className="rounded-xl my-2 max-h-32 sm:max-h-40 w-full object-cover"
          />
        </div>

        <form
          onReset={() => {
            setPreview(null);
          }}
        >
          <label
            htmlFor="img-input"
            className="w-full dark:bg-[#1c1c1f]  bg-gray-300 flex flex-row items-center gap-2 rounded-xl p-2 border hover:bg-gray-400 cursor-pointer text-sm sm:text-base"
          >
            <ImageUp className="inline shrink-0" size={20} />
            <span className="truncate">Choose Image</span>
            <input
              type="file"
              accept="image/*"
              id="img-input"
              onChange={handleChange}
              className="hidden"
            />
          </label>

          {preview && (
            <div className="w-full mt-3 sm:mt-4">
              <div className="relative">
                <label htmlFor="reset" className="absolute top-2 right-2 z-10">
                  <input type="reset" id="reset" className="hidden" />
                  <X
                    size={18}
                    className="bg-white dark:bg-[#1c1c1f]  rounded-full cursor-pointer p-0.5 hover:bg-gray-200 transition"
                  />
                </label>
                <img
                  src={preview}
                  alt="preview"
                  className="rounded-xl w-full max-h-48 sm:max-h-60 object-cover"
                />
              </div>

              <div className="mt-3 sm:mt-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-black cursor-pointer text-white px-4 sm:px-6 py-2 rounded-xl hover:bg-gray-800 transition text-sm sm:text-base"
                  onClick={handleImgSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );

  
}

export default ProfileImageUpdater;
