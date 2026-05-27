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
import { CarouselComp } from "./Crousel";

export function PopupGallery({ child, handleClick, images }) {
	return (
		<Dialog>
			<form>
				<DialogTrigger asChild>{child}</DialogTrigger>
				<DialogContent
					className=" border-0 bg-transparent shadow-none"
					onClick={handleClick}>
					<CarouselComp imgArray={images} />
				</DialogContent>
			</form>
		</Dialog>
	);
}
