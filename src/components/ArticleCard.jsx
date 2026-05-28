import React, { useContext, useState } from "react";
import userDp from "../assets/user.png";
import { commentUIContext, dataContext, userContext } from "../context/Context";
import {
	BookOpenCheck,
	Ellipsis,
	Heart,
	History,
	MessageCircle,
	Send,
	Timer,
	Trash2,
} from "lucide-react";
import supabase from "../config/supabaseClient";
import { NavLink, useNavigate } from "react-router-dom";
import parse from "html-react-parser";
import { toast } from "sonner";
import { CalculateTime } from "../utils/CalculateTime";
import { CarouselComp } from "./ui/Crousel";
import ImageGrid from "./ImageGrid";
import { TimeFormate } from "./utils/TimeFormater";
import HomeComment from "./HomeComment";
import { ShareComponent } from "./ShareComponent";
import { SignDialogue } from "./SignDialogue";

function ArticleCard({ article }) {
	const { name, username, profile_img } = article.UserTable || { name: "Unknown", username: "unknown", profile_img: null };
	let [, , likedArcticles, setLikedArcticles] = useContext(dataContext);

	let images = article.images ?? [];

	const [userInfo] = useContext(userContext);
	const [, setArticles] = useContext(dataContext);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const preview = article?.preview;
	const [, setCommentClicked, id, setId] = useContext(commentUIContext);
	const navigate = useNavigate();

	function handleShare(e) {
		e.stopPropagation();
	}

	let author_id = article?.author_id;
	let articleId = article?.article_id;
	let user_id = userInfo?.user_id;

	async function handleDelete() {
		if (article?.article_id) {
			const { error: likesError } = await supabase
				.from("LikesTable")
				.delete()
				.eq("article_id", article.article_id);

			if (likesError) {

			}

			const { error: CommentError } = await supabase
				.from("CommentTable")
				.delete()
				.eq("article_id", article.article_id);

			if (CommentError) {
				return;
			}

			const { status, error } = await supabase
				.from("ArticleTable")
				.delete()
				.eq("article_id", article.article_id);

			if (error) {

				toast("Can't delete Article.");
			}
			if (status === 204) {
				setArticles((p) => p.filter((el) => el.article_id !== article.article_id));
			}
		}
	}
	const [time] = useState(CalculateTime(article?.body ?? ""));
	const [timestamp] = useState(article?.created_at ?? "");
	const [likes, setLikes] = useState(article?.likes ?? 0);
	const [isLiking, setIsLiking] = useState(false);
	const isLiked = likedArcticles.has(article.article_id);

	async function handleLikeCount(e) {
		e.preventDefault();
		e.stopPropagation();

		if (isLiking) return;
		setIsLiking(true);

		// Capture before any awaits to avoid drift
		const wasLiked = isLiked;

		// 1. Optimistic UI update
		setLikes((prev) => (wasLiked ? prev - 1 : prev + 1));

		setLikedArcticles((prev) => {
			const newSet = new Set(prev);
			wasLiked ? newSet.delete(articleId) : newSet.add(articleId);
			return newSet;
		});

		// 2. Update LikesTable first

		const likeRes = wasLiked
			? await supabase
					.from("LikesTable")
					.delete()
					.eq("article_id", articleId)
					.eq("user_id", user_id)
			: await supabase
					.from("LikesTable")
					.insert({ article_id: articleId, user_id: user_id });

		if (likeRes.error) {
			toast("❌ Error while liking");
			// Full rollback
			setLikes((prev) => (wasLiked ? prev + 1 : prev - 1));
			setLikedArcticles((prev) => {
				const newSet = new Set(prev);
				wasLiked ? newSet.add(articleId) : newSet.delete(articleId);
				return newSet;
			});
			setIsLiking(false);
			return;
		}

		// 3. Update the ArticleTable count securely via RPC
		const { error } = await supabase.rpc("increment_article_likes", {
			target_article_id: articleId,
			increment_by: wasLiked ? -1 : 1,
		});

		if (error) {
			toast("❌ Error updating like count");
			setLikes((prev) => (wasLiked ? prev + 1 : prev - 1));
			setLikedArcticles((prev) => {
				const newSet = new Set(prev);
				wasLiked ? newSet.add(articleId) : newSet.delete(articleId);
				return newSet;
			});
		}

		setIsLiking(false);
	}

	function handleCommentClick(e) {
		e.stopPropagation();
		setId(articleId);
		setCommentClicked(true);
	}

	//
	return (
		<div
			className={`${
				id == articleId
					? "bg-indigo-50/60 dark:bg-[#1c1c1f] "
					: " bg-white dark:bg-[#141416]"
			} group relative flex flex-col w-full border border-[#e8e8ec] dark:border-[#2a2a2e] overflow-hidden rounded-2xl card-hover mx-auto sm:mt-3 transition-all duration-300`}>

			{/* Reading time badge */}
			<span className="flex absolute top-3 right-3 flex-row items-center bg-white/80 dark:bg-[#1c1c1f]/90 backdrop-blur-sm rounded-full pl-2.5 py-1 px-2 z-10 border border-[#e8e8ec] dark:border-[#2a2a2e] transition-all duration-300">
				<span className="text-xs flex items-center text-gray-400 font-medium">
					{" "}
					{time?.text}
				</span>
			</span>

			{/* Main content area */}
			<div className="p-5">
				{/* Author row */}
				<div className="flex justify-between items-center mb-4">
					<div className="flex items-center gap-2.5">
						<img
							onClick={() => navigate(`/profile/${username}`)}
							src={profile_img || userDp}
							alt={name}
							className="w-9 h-9 rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10 cursor-pointer transition-transform duration-300 hover:scale-105"
						/>
						<div className="flex flex-col">
							<span className="font-semibold text-sm text-gray-900 dark:text-gray-100 leading-none">
								{name}
							</span>
							<NavLink
								to={`/profile/${username}`}
								className="text-xs text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors mt-0.5">
								@{username}
							</NavLink>
						</div>
						<span className="flex items-center text-xs text-gray-400">
							{" "}
							<span className="font-bold -ml-1">&#183;</span>{" "}
							{TimeFormate(timestamp)}
						</span>
					</div>

					<div className="flex flex-row-reverse items-center">
						<div>
							{user_id === author_id && (
								<div className="relative">
									<button
										onClick={(e) => {
											e.stopPropagation();
											setIsMenuOpen(!isMenuOpen);
										}}
										className="p-1.5 flex items-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-[#f5f5f7] dark:hover:bg-[#2a2a2e] transition-all duration-200 cursor-pointer">
										<Ellipsis size={18} />
									</button>

									{isMenuOpen && (
										<div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#1c1c1f] border border-[#e8e8ec] dark:border-[#2a2a2e] rounded-xl shadow-xl p-1 animate-slide-down z-20">
											<button
												className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
												onClick={(e) => {
													e.stopPropagation();
													handleDelete();
												}}>
												<Trash2 size={13} />
												Delete
											</button>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Article content */}
				<div
					onClick={() => {
						if (article.article_id) {
							navigate(`/article?id=${article.article_id}`);
						}
					}}
					className="hover:cursor-pointer">
					<div className="space-y-1.5">
						<h2 className="font-bold text-gray-900 dark:text-gray-50 text-lg leading-snug mb-1">
							{article.title}
						</h2>
						<div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed prose-p:m-0 prose-headings:text-lg">
							{parse(article.body)}
						</div>
					</div>

					{images.length > 0 && (
						<div className="h-fit min-h-21 mt-3 mb-2 overflow-clip rounded-xl">
							<ImageGrid images={images} />
						</div>
					)}

					{/* Action bar */}
					<div className="w-full mt-2">
						<ul className="flex items-center gap-6 pt-3 mt-auto border-t border-[#e8e8ec] dark:border-[#2a2a2e]">
							<li
								onClick={(e) => {
									e.stopPropagation();
								}}>
								<SignDialogue
									child={
										<div
											onClick={userInfo && handleLikeCount}
											className={`flex items-center gap-1.5 text-sm cursor-pointer select-none transition-colors ${
												isLiked
													? "text-red-500"
													: "text-gray-500 hover:text-red-500"
											}`}>
											<Heart
												size={20}
												fill={isLiked ? "#ff0000" : "none"}
												strokeWidth={2}
												className={`${
													isLiking ? "scale-130" : ""
												} transition-transform hover:scale-120`}
											/>
											<span>{likes}</span>
										</div>
									}
									title={`Liked this article?`}
								/>
							</li>
							<li
								onClick={handleCommentClick}
								className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-500 transition-colors cursor-pointer">
								<MessageCircle size={18} />{" "}
								<span>
									{article.comment_count ? article.comment_count : "Comment"}
								</span>
							</li>
							<li className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-500 transition-colors cursor-pointer" onClick={handleShare}>
								<ShareComponent
									title={article.title}
									body={article.body}
									author={name}
									username={username}
									id={article.article_id}
								/>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ArticleCard;
