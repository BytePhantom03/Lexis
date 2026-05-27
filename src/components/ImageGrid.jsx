import { useState } from "react";
import { CarouselComp } from "./ui/Crousel";
import { PopupGallery } from "./ui/PopupGallery";

function ImageGrid({ images, setCrousel }) {
	const count = images.length;
	function handleClick(e) {
		e.stopPropagation();
	}

	if (count === 1) {
		return (
			<div onClick={handleClick} className="w-full h-fit ">
				{/* <img
					src={images[0]}
					className="w-full h-full object-cover rounded-md"
				/> */}

				<PopupGallery
					images={images}
					handleClick={handleClick}
					child={
						<img
							src={images[0]}
							className="w-full h-full object-cover rounded-md"
						/>
					}
				/>
			</div>
		);
	}

	if (count === 2) {
		return (
			<PopupGallery
				images={images}
				handleClick={handleClick}
				child={
					<div onClick={handleClick} className="grid grid-cols-2 gap-1 h-fit">
						{images.map((el, idx) => (
							<img
								key={idx}
								src={el}
								className="w-full h-full object-cover rounded-md"
							/>
						))}
					</div>
				}
			/>
		);
	}

	if (count === 3) {
		return (
			<PopupGallery
				images={images}
				handleClick={handleClick}
				child={
					<div
						onClick={handleClick}
						className="grid grid-cols-2 grid-rows-2 gap-1 h-75">
						{/* Big image (left) */}
						<img
							src={images[0]}
							className="row-span-2 w-full h-full object-cover rounded-md"
						/>

						{/* Right side images */}
						<img
							src={images[1]}
							className="w-full h-full object-cover rounded-md"
						/>
						<img
							src={images[2]}
							className="w-full h-full object-cover rounded-md"
						/>
					</div>
				}
			/>
		);
	}

	if (count > 3) {
		return (
			<PopupGallery
				images={images}
				handleClick={handleClick}
				child={
					<div onClick={handleClick} className="grid h-fit grid-cols-2 gap-1">
						{images.slice(0, 4).map((el, idx) => (
							<div key={idx} className="relative">
								<img
									src={el}
									className={`w-full h-full object-cover rounded-md ${
										count === 3 && idx === 0 ? "col-span-2" : ""
									}`}
								/>

								{/* Overlay */}
								{idx === 3 && count > 4 && (
									<div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xl font-semibold rounded-md">
										+{count - 4}
									</div>
								)}
							</div>
						))}
					</div>
				}
			/>
		);
	}
}

export default ImageGrid;
