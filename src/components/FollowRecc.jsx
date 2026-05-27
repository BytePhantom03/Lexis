import React, { useContext, useEffect, useState } from "react";
import supabase from "../config/supabaseClient";
import FollowerCard from "./FollowerCard";
import { dataContext, userContext } from "../context/Context";

function FollowRecc() {
	const [followRecc, setFollowRecc] = useState([]);
	const [, , , , myFollowing] = useContext(dataContext);
	const [length, setLength] = useState(0);
	const [userInfo] = useContext(userContext);
	const currentUserId = userInfo?.user_id;

	useEffect(() => {
		async function loadFollowRecc() {
			const { data, error } = await supabase.from("UserTable").select("*");

			if (error) {
				return;
			}

			if (data) {
				setFollowRecc(data);
				setLength(Number(data.length - myFollowing.size - 2));
			}
		}

		loadFollowRecc();
	}, []);

	return (
		<>
			{Number(followRecc.length - myFollowing.size - 1) > 0 && (
				<div className="max-w-2xl mx-auto px-4 mt-8">
					<div className="bg-white dark:bg-[#141416] border border-[#e8e8ec] dark:border-[#2a2a2e] rounded-2xl overflow-hidden">
						<div className="px-5 pt-4 pb-2 border-b border-[#e8e8ec] dark:border-[#2a2a2e]">
							<h3 className="text-gray-900 dark:text-gray-100 font-semibold text-sm">
								People you may know
							</h3>
							<span className="text-xs text-gray-500 dark:text-gray-400">
								{Number(followRecc.length - myFollowing.size - 1)}{" "}
								{
									Number(followRecc.length - myFollowing.size - 1) > 1 ? "suggestions" : "suggestion"
								}
							</span>
						</div>

						<div
							className="max-h-[60vh] overflow-y-auto">
							{followRecc.map((el) => (
								<span key={el.user_id}>
									{" "}
									{!myFollowing.has(el.user_id) &&
										el.user_id != currentUserId && (
											<div className="px-5 py-3 hover:bg-[#f5f5f7] dark:hover:bg-[#1c1c1f] transition-colors duration-200">
												<FollowerCard data={el} setLength={setLength} />
											</div>
										)}
								</span>
							))}
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default FollowRecc;
