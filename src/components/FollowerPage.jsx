import React, { useEffect, useState } from "react";
import { NavLink, useParams, useSearchParams } from "react-router-dom";
import FollowerCard from "./FollowerCard";
import supabase from "../config/supabaseClient";
import { ChevronLeft, LoaderCircle } from "lucide-react";

function FollowerPage() {
	const [followerList, setFollowerList] = useState([]);
	const [loading, setLoading] = useState(true);
	const params = useParams();
	const { username } = params;
	const [searchParam] = useSearchParams();
	const user_id = searchParam.get("id") ?? "";

	useEffect(() => {
		async function loadFollowers() {
			setLoading(true);

			const { data: followData, error: followError } = await supabase
				.from("FollowTable")
				.select(
					"*, UserTable!FollowTable_follower_id_fkey(username,user_id,name,profile_img)"
				)
				.eq("following_id", user_id);

			if (followError) {
				setLoading(false);
				return;
			}

			if (followData) {
				setFollowerList(followData);
				setLoading(false);
			}
		}
		loadFollowers();
	}, []);

	return (
		<div className=" min-h-screen">
			<div>
				<div className="flex items-center bg-transparent backdrop-blur-3xl transition-all duration-500 border-b ease-in  pb-4 sticky  top-0">
					<NavLink
						onClick={() => {
							history.back();
						}}
						className="ml-2">
						<button className="pt-2 hover:scale-105 transition cursor-pointer  ">
							<ChevronLeft />
						</button>
					</NavLink>
					<h14 className="ml-2 ">
						<NavLink
							to={`/profile/${username}`}
							className=" text-sm font-semibold inline rounded-3xl px-2 pb-0.5 bg-gray-300 dark:bg-gray-800">
							@{username}
						</NavLink>{" "}
						/ followers
					</h14>
				</div>
				{loading && (
					<div className="min-h-screen  flex items-center justify-center bg-transparent">
						<div className="flex items-center gap-2 text-gray-600">
							<LoaderCircle size={24} className="animate-spin" />
							<span>Loading..</span>
						</div>
					</div>
				)}

				{!loading && (
					<div className="md:w-1/2 md:mx-auto">
						<br />

						<ul
							className="-mt-3 *:p-4 
               border-gray-100 *:m-0.5 *:rounded-sm
              
          ">
							{followerList.map((el) => (
								<li key={el.id}>
									<FollowerCard data={el.UserTable} />
								</li>
							))}

							{followerList.length <= 0 && (
								<div className="text-center">
									{username ? "@" + username : "This user"} is not followed
									anyone.
								</div>
							)}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
}

export default FollowerPage;
