"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export function SearchButton({ SetSearchQuery }) {
	const naviagtors = useNavigate();

	const [open, setOpen] = React.useState(false);
	const [placeholder, setPlaceholder] = React.useState(
		"Search anything in mind"
	);

	function goSearch(text) {
		if (SetSearchQuery) {
			SetSearchQuery(text);
		}
		naviagtors(`/search?q=${text}`, {
			replace: false,
		});

		setOpen(false);
	}

	return (
		<div className=" flex  flex-col">
			<Button
				onClick={() => setOpen(true)}
				variant="ghost"
				className="w-fit mb-1 cursor-pointer">
				<Search size={30}  className="text-foreground" strokeWidth={4} />
			</Button>
			<CommandDialog
				open={open}
				onOpenChange={setOpen}
				className="top-10    sm:left-1/2  ">
				<Command className="border  border-b-0">
					<CommandInput
						onKeyDown={(e) => {
							if (e.key == "Enter") {
								goSearch(e.target.value);
							}
						}}
						placeholder={placeholder}
					/>
				</Command>
			</CommandDialog>
		</div>
	);
}
