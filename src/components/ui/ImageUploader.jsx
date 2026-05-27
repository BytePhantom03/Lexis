import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Camera, Folder, Image } from "lucide-react";
import { useRef, useState } from "react";
import { uploadToCloudinary } from "../../utils/cloudinary";
import { toast } from "sonner";
import { captureCamera } from "../utils/captureCamera";
import { CameraPop } from "./CameraPop";

export function ImageUploader({ addImage }) {
	const [uploading, setUploading] = useState(true);
	const [error, setError] = useState();
	const [sucess, setSuccess] = useState();
	const imgRef = useRef();

	const [active, setActive] = useState(false);

	async function handleImage(e) {
		e.preventDefault();
		e.stopPropagation();
		try {
			let file = imgRef.current.files[0];

			console.log(file);

			let url = await uploadToCloudinary(file);
			if (url) {
				addImage(url);
			}
		} catch (error) {
			toast("Image could not upload. ❌");
			console.log(error);
		}
	}

	async function uploadPhoto(photo) {
		try {
			let file = photo;

			console.log(file);

			let url = await uploadToCloudinary(file);
			if (url) {
				addImage(url);
			}
		} catch (error) {
			toast("Image could not upload. ❌");
			console.log(error);
		}
	}

	return (
		<div
			className="flex gap-6"
			onClick={(e) => {
				e.stopPropagation();
			}}>
			<Popover>
				<PopoverTrigger asChild>
					<button
						type="button"
						variant="ghost"
						size="sm"
						className="hover:bg-transparent flex items-center"
						onClick={(e) => {
							e.stopPropagation();
						}}>
						<Image /> <span className="px-1 py-1"> Image</span>
					</button>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					className="w-72 -left-4 sm:w-fit max-w-svw top-1  sm:-left-3 absolute flex-wrap flex overflow-clip  rounded-3xl bg-[#fffefe] dark:bg-[#161515] border-2">
					<div
						onClick={(e) => {
							e.stopPropagation();
						}}>
						<h2 className="text-sm">Upload Image here. </h2>
						<div>
							<div className="flex  sm:w-full items-center mt-2 ">
								<Folder />{" "}
								<input
									ref={imgRef}
									type="file"
									onChange={(e) => {
										setActive(e.target.value.length > 0);
									}}
									accept="image/*"
									className="
									text-foreground font-normal
									border-2  mx-2 wrap-anywhere pr-1 h-fit w-52 pl-2 sm:w-fit rounded-md "
								/>
								<button
									type="button"
									onClick={handleImage}
									disabled={!active}
									className={`
                                        cursor-pointer
                                    disabled:collapse
                                    bg-blue-800 justify-self-end px-2 py-1   rounded-full text-sm`}>
									Upload
								</button>
							</div>
							<div className="flex relative sm:w-full items-center mt-2 ">
								<Camera />{" "}
								<div className="border-2  mx-2 wrap-anywhere pr-1 h-fit w-52 pl-2 sm:w-fit rounded-md ">
									<CameraPop uploadPhoto={uploadPhoto} />
								</div>
								<button
									type="button"
									onClick={handleImage}
									disabled={!active}
									className={`
                                        cursor-pointer
                                    disabled:collapse
                                    bg-blue-800 justify-self-end px-2 py-1   rounded-full text-sm`}>
									Upload
								</button>
							</div>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
