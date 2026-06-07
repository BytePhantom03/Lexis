import React, { useContext } from "react";

import { userDp } from "../../public/avtar";
import { NavLink, useParams } from "react-router-dom";
import { dataContext, userContext } from "../context/Context";
import supabase from "../config/supabaseClient";
import { toast } from "sonner";

function FollowerCard({ data, setLength }) {
	const [currentUser] = useContext(userContext);
	const [, , , , myFollowing, setMyFollowing] = useContext(dataContext);

	async function handleClick() {
		try {
			let prevStatus = myFollowing?.has(data?.user_id);

			if (prevStatus) {
				setMyFollowing((prev) => {
					let temp = new Set();

					prev.forEach((el) => {
						temp.add(el);
					});


               
					temp.delete(data?.user_id);
					return temp;
				});

				const { error: unfollowError } = await supabase
					.from("FollowTable")
					.delete()
					.eq("follower_id", currentUser?.user_id)
					.eq("following_id", data?.user_id);

				if (unfollowError) {
					toast("Something went wrong.");

					setMyFollowing((prev) => {
						let temp = new Set();

						prev.forEach((el) => {
							temp.add(el);
						});
						temp.add(data?.user_id);
						return temp;
					});

					return;
				}
			} else {

				setLength(p=>p-1)

				setMyFollowing((prev) => {
					let temp = new Set();

					prev.forEach((el) => {
						temp.add(el);
					});
					temp.add(data?.user_id);
					return temp;
				});

				

				const { error: followError } = await supabase
					.from("FollowTable")
					.insert({
						follower_id: currentUser?.user_id,
						following_id: data?.user_id,
					});

				if (followError) {
					toast("Something went wrong.");

					setMyFollowing((prev) => {
						let temp = new Set();

						prev.forEach((el) => {
							temp.add(el);
						});

						temp.delete(data?.user_id);
						return temp;
					});

					return;
				}
			}
		} catch (error) {
		}
	}

	return (
		<div className="flex w-full justify-between items-center pr-4">
			{/* LEFT SECTION */}
			<div className="flex items-center gap-2 mr-4 min-w-0">
				{/* PROFILE IMAGE (fixed size, no shrink) */}
				<img
					src={data?.profile_img ?? userDp}
					alt=""
					className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full object-cover flex-shrink-0"
				/>

			
				<div className="flex flex-col min-w-0">
					<NavLink
						to={`/profile/${data?.username ?? ""}`}
						className="text-sm text-gray-500 hover:underline truncate">
						@{data?.username}
					</NavLink>

					<p className="text-sm truncate">{data?.name}</p>

					<p className="text-sm truncate">{data?.about ?? ""}</p>
				</div>
			</div>

			
			<div className="flex-shrink-0">
				<button
					onClick={handleClick}
					className={`${
						!myFollowing?.has(data?.user_id)
							? "bg-foreground text-background"
							: "text-foreground bg-background"
					} px-4 py-1 rounded-full font-semibold cursor-pointer
        ${currentUser?.user_id == data?.user_id ? "collapse" : ""}
        transition-all duration-200 ease-linear hover:scale-101 hover:shadow-xs`}>
					{!myFollowing?.has(data?.user_id) ? "Follow" : "Following"}
				</button>
			</div>
		</div>
	);
}

export default FollowerCard;
