import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";

export function CarouselComp({ imgArray }) {
	return (
		<Carousel
			onClick={(e) => {
				e.stopPropagation();
			}}
			className="mx-auto w-full p-3 justify-self-center ">
			<CarouselContent>
				{imgArray.map((el, index) => (
					<CarouselItem key={index}>
						<div>
							<Card className="p-0 bg-transpareent border-0">
								<CardContent className="flex  w-full aspect-square items-center justify-center ">
									<img className="h-full w-full rounded-xl" src={el} />
								</CardContent>
							</Card>
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	);
}
