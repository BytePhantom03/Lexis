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

export function SignPop({ child }) {
	return (
		<Popover>
			<PopoverTrigger asChild>{child}</PopoverTrigger>
			<PopoverContent justify="left" align="end">
				<PopoverHeader>
					<PopoverTitle>Still in development.</PopoverTitle>
					<PopoverDescription>Menu will be soon available.</PopoverDescription>
				</PopoverHeader>
			</PopoverContent>
		</Popover>
	);
}
