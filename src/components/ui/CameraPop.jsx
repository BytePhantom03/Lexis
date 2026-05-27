import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

import CameraPlaceholderSVG from "../../assets/CameraPlaceholderSVG.svg";
import { startCamera } from "../utils/startCamera";
import { capturePhoto } from "../utils/capturePhoto";
export function CameraPop({ uploadPhoto }) {
	const [resourece, setResource] = useState();
	const [open, setOpen] = useState();

	const [status, setStatus] = useState(0);
	//camera status
	//0 -- camera not opened
	//1 -- camaera opened but not captured
	//2 -- captured image

	async function handleCapture() {
		console.log("hey...");
		setStatus(2);
		let res = await capturePhoto();
		if (res) {
			setResource(res);
		}
	}

	function handlePhotoUpload() {
		if (resourece) {
			uploadPhoto(resourece);
			setStatus(0);
			setOpen(false);
		}
	}

	return (
		<Dialog open={open}>
			<form>
				<DialogTrigger asChild>
					<Button variant="none" className="m-0 p-0">
						<span className="font-sm text-foreground p-0 m-0">Open Camera</span>
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>Camera Preview </DialogTitle>
						<DialogDescription>
							Check your camera picked photo. This is going to upload here.
						</DialogDescription>
					</DialogHeader>
					<FieldGroup>
						<div>
							<div>
								<video
									hidden={status != 1}
									id="camera"
									className="rounded-xl"
									autoplay
									playsinline></video>
							</div>
							<img id="preview" className="rounded-xl" />
						</div>
					</FieldGroup>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">Cancel</Button>
						</DialogClose>
						{status == 0 && (
							<Button
								type="submit"
								onClick={() => {
									console.log("hey...");
									setStatus(1);
									startCamera({ setStatus });
								}}>
								Open Camera
							</Button>
						)}

						{status == 1 && (
							<Button type="submit" onClick={handleCapture}>
								Capture
							</Button>
						)}

						{status == 2 && (
							<Button type="submit" onClick={handlePhotoUpload}>
								Upload
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
}
