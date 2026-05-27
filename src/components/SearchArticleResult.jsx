import React, { useState } from "react";
import img_url from "../assets/user.png";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import parse from "html-react-parser";
import { CalculateTime } from "../utils/CalculateTime";
import { TimeFormate } from "./utils/TimeFormater";
import path from "../assets/Empty.json";
import { Player } from "@lottiefiles/react-lottie-player";

function SearchArticleResult({ articles, authors }) {
	const [searchParams] = useSearchParams();

	const [searchQuery, SetSearchQuery] = useState(searchParams.get("q"));

	return (
		<div className="min-h-screen pb-10">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Authors Section */}
				{authors?.length > 0 && (
					<section className="mt-8">
						<h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 px-2">
							Authors
						</h2>
						<div className="space-y-3">
							{authors.map((el, index) => (
								<SearchAuthor key={el.user_id || index} author={el} />
							))}
						</div>
					</section>
				)}

				{/* Articles Section */}
				{articles?.length > 0 && (
					<section className="mt-12">
						<h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 px-2">
							Articles
						</h2>
						<div className="space-y-4">
							{articles.map((el) => (
								<SearchPost article={el} key={el.id} />
							))}
						</div>
					</section>
				)}

				{authors.length == 0 && articles.length == 0 && (
					<div className="h-full w-full">
						<div className="min-h-screen flex items-center justify-center">
							<div className="flex items-center gap-2 text-gray-600">
								<div className="select-none h-full w-full flex flex-col items-center justify-center  ">
									<Player
										autoplay
										className="h-50 m-0  sm:h-54   md:h-60"
										src={path}></Player>

									<h2 className="text-center text-gray-300 bg-gray-800 mt-2 sm:-mt-1 rounded px-4 font-mono  my-0  py-0 text-sm font-extralight">
										No result found for{" "}
										<span className="text-blue-500 font-bold text-lg">
											{searchQuery}
										</span>
									</h2>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function SearchPost({ article }) {
	const [time] = useState(CalculateTime(article?.body ?? ""));
	const navigate = useNavigate();
	const { name, username, profile_img } = article.UserTable || {};
	const [timestamp] = useState(article?.created_at ?? "");

	return (
		<div
			className="group relative bg-white dark:bg-[#1a1a1b] border border-gray-200 dark:border-[#2d2d2e] 
                       rounded-xl p-0 sm:p-6 transition-all hover:border-gray-300 dark:hover:border-gray-600 ">
			<div className="flex justify-between items-start mb-1">
				<div className="flex items-center gap-3">
					<img
						onClick={(e) => {
							e.stopPropagation();
							navigate(`/profile/${username}`);
						}}
						src={profile_img || img_url}
						alt={name}
						className="size-10 rounded-full object-cover ring-1 ring-gray-100 dark:ring-gray-800 cursor-pointer"
					/>
					<div className="flex flex-col">
						<span className="text-sm font-bold text-gray-900 dark:text-gray-100">
							{name}
						</span>
						<div className="flex items-center gap-1 text-xs text-gray-500">
							<NavLink
								to={`/profile/${username}`}
								className="hover:text-blue-500 transition-colors">
								@{username}
							</NavLink>
							<span>•</span>
							<span>{TimeFormate(timestamp)}</span>
						</div>
					</div>
				</div>

				<div
					className="flex absolute timer top-2 right-2 flex-row items-center dark:bg-[#1d1e1f] bg-[#ebeff2]  rounded-sm pl-2  py-1   px-1 transition-all duration-100  
				
				text-xs  text-gray-500
				
				">
					{time?.text}
				</div>
			</div>

			<div
				onClick={() => navigate(`/article?id=${article.id}`)}
				className="cursor-pointer space-y-2">
				<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
					{article.title}
				</h3>
				<div className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-3">
					{parse(article.body)}
				</div>
			</div>
		</div>
	);
}

// Author Card Component
function SearchAuthor({ author }) {
	const userData = {
		avatar: author.profile_img ?? img_url,
		name: author.name,
		username: author.username,
		bio: author.about ?? "A Lexis user.",
	};

	return (
		<NavLink
			to={`/profile/${userData.username}`}
			className="flex items-center gap-4 p-4 bg-white dark:bg-[#1a1a1b] border border-gray-200 
                       dark:border-[#2d2d2e] rounded-xl hover:bg-gray-50 dark:hover:bg-[#252526] transition-all ">
			<img
				src={userData.avatar}
				className="size-12 rounded-full object-cover border border-gray-100 dark:border-gray-800"
				alt={userData.name}
			/>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<span className="font-bold text-gray-900 dark:text-gray-100 truncate">
						{userData.name}
					</span>
					<span className="text-sm text-gray-500 truncate">
						@{userData.username}
					</span>
				</div>
				<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
					{userData.bio}
				</p>
			</div>
		</NavLink>
	);
}

export default SearchArticleResult;
