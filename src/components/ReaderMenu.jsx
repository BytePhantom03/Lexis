import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Ellipsis } from "lucide-react";

export function ReaderMenu({ child }) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Ellipsis
					size={24}
					className={`${"text-amber-50 "} rotate-90 text-foreground`}
				/>
			</PopoverTrigger>
			<PopoverContent justify="left" align="end" className="p-0 z-30 w-fit ">
				{child}
			</PopoverContent>
		</Popover>
	);
}
