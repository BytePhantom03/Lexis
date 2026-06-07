import React, { useState, useEffect, useContext, useRef } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import supabase from "../config/supabaseClient";
import parse from "html-react-parser";
import { motion } from "framer-motion";
import {
	AArrowDown,
	ALargeSmall,
	Bluetooth,
	Bookmark,
	BookMarked,
	BookOpenCheck,
	BookOpenText,
	CalendarDays,
	ChevronLeft,
	Ellipsis,
	Eye,
	EyeClosed,
	Heart,
	Hourglass,
	MessageCircle,
	Pencil,
	Share,
	Share2,
	Trash2,
	User,
	X,
} from "lucide-react";
import { toast } from "sonner";
import Loader from "./Loader";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "./utils/cn";
import { userDp } from "../../public/avtar";
import { dataContext, userContext } from "../context/Context";
import CommentCard from "./CommentCard";
import { CalculateTime } from "../utils/CalculateTime";
import { ReaderMenu } from "./ReaderMenu";
import { SignDialogue } from "./SignDialogue";
import NavbarPage from "./NavbarPage";
import { EditProfileDetails } from "./EditProfileDetails";
import { AlertDelete } from "./AlertDelete";

function ArticleReader() {
	const navigate = useNavigate();
	const [userInfo] = useContext(userContext);
	const userId = userInfo?.user_id;
	const [searchParam] = useSearchParams();
	const commentRef = useRef();
	const articleId = searchParam.get("id");
	const [article, setArticle] = useState(null);
	const [author, setAuthor] = useState(null);
	const [loading, setLoading] = useState(true);
	const [commentCount, setCommentCount] = useState(null);
	const [commentList, setCommentList] = useState([]);
	const [canComment, setCanComment] = useState(true);
	const [showBtn, setShowBtn] = useState();
	const [isLiking, setIsLiking] = useState(false);
	const [like, setLike] = useState(null); // null = loading state
	const [isLiked, setIsLiked] = useState(false); // default false, fetch ke baad set hoga
	const [time, setTime] = useState();
	const url = window.location;
	const shareUrl = `${url}`;
	const [reading, setReading] = useState();
	const titleRef = useRef();
	const bodyRef = useRef();
	const [title, setTitle] = useState();
	const [body, setBody] = useState();
	const [scrollProgress, setScrollProgress] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			const totalScroll = document.documentElement.scrollTop;
			const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
			const scroll = windowHeight > 0 ? totalScroll / windowHeight : 0;
			setScrollProgress(scroll);
		}
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	async function handleEditChanges() {
		setTitle(titleRef.current.value);
		setBody(bodyRef.current.value);

		let changes = {};

		if (article?.title != titleRef.current.value)
			changes["title"] = titleRef.current.value;

		if (article?.body != bodyRef.current.value)
			changes["body"] = bodyRef.current.value;

		if (Object.keys(changes).length > 0) {
			const { error } = await supabase
				.from("ArticleTable")
				.update(changes)
				.eq("article_id", articleId)
				.select();

			if (error) {
				toast(error.message);
			} else {
				toast("Success. Changes made will reflect soon.");
			}
		}
	}

	let [, , likedArcticles, setLikedArcticles] = useContext(dataContext);
	let temporaryCount = useRef(0);

	useEffect(() => {
		if (!articleId || articleId === "undefined") {
			navigate("/home");
			return;
		}

		const fetchArticle = async () => {
			try {
				const { data, error } = await supabase
					.from("ArticleTable")
					.select(`*,UserTable!author_id(*),CommentTable(*)`)
					.eq("article_id", articleId)
					.single();

				if (error) {
					console.error("Error fetching article:", error);
					setArticle(null);
					return;
				}
				if (!data) return;

				setArticle(data);
				setTime(CalculateTime(data.body ?? ""));
				setCommentCount(data?.CommentTable?.length);
                document.title = data?.title ?? "Lexis"
				temporaryCount.current = data?.CommentTable?.length;

				setTitle(data?.title);
				setBody(data?.body);

				temporaryCount.current = data?.comment_count;
				setAuthor(data.UserTable);

				setLike(data.likes ?? 0);

				if (userId) {
					if (likedArcticles.has(data.article_id)) {
						setIsLiked(true);
					} else {
						const { data: likeData } = await supabase
							.from("LikesTable")
							.select("article_id")
							.eq("article_id", data.article_id)
							.eq("user_id", userId)
							.maybeSingle();

						if (likeData) {
							setIsLiked(true);
							setLikedArcticles((prev) => {
								const newSet = new Set(prev);
								newSet.add(data.article_id);
								return newSet;
							});
						}
					}
				}
				let { data: commentData, error: commentError } = await supabase
					.from("CommentTable")
					.select("*,UserTable(username,profile_img)")
					.eq("article_id", data.article_id);

				if (commentError) return;
				if (commentData) setCommentList(commentData);
			} catch (error) {
				console.error("Error:", error);
				toast("❌ Failed to load the article. Please try after few minutes.");
			} finally {
				setLoading(false);
			}
		};

		fetchArticle();
	}, [articleId, navigate, userId, likedArcticles, setLikedArcticles]);

	useEffect(() => {
		if (commentRef.current?.value) {
			setShowBtn(true);
		} else {
			setShowBtn(false);
		}
	}, [commentRef.current?.value]);

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (loading) {
		return (
			<div className="flex items-center text-lg min-h-screen justify-center">
				<Spinner className="size-6 mx-1" /> Just a minute
			</div>
		);
	}

	if (!article) {
		return (
			<div className="mx-auto px-4 py-16 text-center h-screen">
				<h1 className="text-md font-bold mb-4">
					Error Occurred while loading article.
				</h1>
				<button
					onClick={() => navigate("/")}
					className="px-6 py-2 bg-gray-600 text-white rounded-lg">
					Go Home
				</button>
			</div>
		);
	}

	async function handleComment() {
		setCanComment(false);

		let date = new Date();

		let commentText = commentRef.current.value + "";
		let newString = commentText.trim();

		if (newString.length) {
			const dummyComment = {
				id: crypto.randomUUID(),
				comment: commentText,
				UserTable: {
					username: userInfo?.username,
					profile_img: userInfo?.profile_img,
				},
				created_at: Date.now(),
			};
			setCommentCount((prev) => prev + 1);
			setCommentList((prev) => [dummyComment, ...prev]);
			if (!userId) return;

			const { data, error } = await supabase
				.from("CommentTable")
				.insert([
					{
						article_id: article?.article_id,
						user_id: userId,
						comment: newString,
					},
				])
				.select()
				.single();

			if (error) {
				toast("Comment Not Posted.");
				setCommentCount((p) => p - 1);
				return;
			} else if (data) {
				temporaryCount.current = temporaryCount.current + 1;
				const { data: countData, error: countError } = await supabase
					.from("ArticleTable")
					.update([{ comment_count: temporaryCount.current }])
					.eq("article_id", article?.article_id)
					.select();

				if (countError) {
					toast("Error while updating comment count.");
					setCommentCount((p) => p - 1);
					return;
				}

				if (countData) toast("Comment Posted.");
			}
		}

		setCanComment(true);
		commentRef.current.value = null;
	}

	async function deleteComment(commentId, comment) {
		temporaryCount.current = temporaryCount.current - 1;
		setCommentCount((p) => p - 1);
		setCommentList((prev) => prev.filter((com) => com.id != comment.id));

		const { data: CommentTableData, error: CommentTableError } = await supabase
			.from("CommentTable")
			.delete()
			.eq("comment_id", comment.comment_id)
			.select();

		if (CommentTableError) {
			toast("Error occurred, while deleting comment.");
			setCommentCount((p) => p + 1);
			setCommentList((prev) => [comment, ...prev]);
			return;
		}

		if (CommentTableData) {
			const { data: commentCountData, error: commentCountError } =
				await supabase
					.from("ArticleTable")
					.update({ comment_count: temporaryCount.current })
					.select()
					.eq("article_id", article.article_id);

			if (commentCountError) {
				toast("Error while updating comment count.");
				temporaryCount.current = temporaryCount.current + 1;
				setCommentCount((p) => p + 1);
				setCommentList((prev) => [comment, ...prev]);
				return;
			}

			if (commentCountData) toast("Comment Deleted.");
		}
	}

	async function handleLike() {
		if (isLiking || !userInfo) return;
		setIsLiking(true);

		const wasLiked = isLiked;
		const currentLikeCount = like ?? 0;

		setIsLiked(!wasLiked);
		setLike(wasLiked ? currentLikeCount - 1 : currentLikeCount + 1);

		const { error: likeError } = await (wasLiked
			? supabase
					.from("LikesTable")
					.delete()
					.eq("article_id", article?.article_id)
					.eq("user_id", userId)
			: supabase
					.from("LikesTable")
					.insert({ article_id: article?.article_id, user_id: userId }));

		if (likeError) {
			toast("❌ Error updating like");
			revertUI();
			return;
		}

		const { error: articleError } = await supabase.rpc("increment_article_likes", {
			target_article_id: article?.article_id,
			increment_by: wasLiked ? -1 : 1,
		});

		if (articleError) {
			toast("❌ Error updating count");
			revertUI();
		}

		function revertUI() {
			setIsLiked(wasLiked);
			setLike(currentLikeCount);
			setIsLiking(false);
		}

		setIsLiking(false);
	}

	async function handleShare() {
		if (navigator.share) {
			try {
				await navigator.share({
					title: article?.title,
					url: shareUrl,
				});
			} catch (err) {
				console.error("Error sharing:", err.message);
			}
		} else {
			alert("Web Share API not supported. You can copy the link manually!");
		}
	}

	function handleReader() {
		setReading((p) => !p);
	}

	async function handleDelete(e) {
		e.stopPropagation();
		e.preventDefault();

		const res = await supabase
			.from("ArticleTable")
			.delete()
			.eq("article_id", article.article_id);

		if (!res.error) {
			toast("Deleted successfully.");
			navigate("/home");
		} else {
			toast("Error while deleting");
		}
	}



	return (
		<div className="min-h-screen bg-background relative selection:bg-indigo-500/30">
			{/* Reading Progress Bar */}
			<div className="fixed top-0 left-0 w-full h-1.5 z-[100] bg-gray-200 dark:bg-white/5">
				<div 
					className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 transition-all duration-150 ease-out"
					style={{ width: `${scrollProgress * 100}%` }}
				></div>
			</div>

			{!reading && <NavbarPage />}

			{reading && (
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="fixed top-4 right-4 z-50 glass-panel px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-colors"
					onClick={handleReader}
				>
					<Eye size={16} className="text-gray-400" />
					<span className="text-sm font-medium text-foreground">Exit Reading Mode</span>
				</motion.div>
			)}

			<article className={`max-w-3xl mx-auto px-4 ${!reading ? "pt-32" : "pt-20"} pb-20`}>
				
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					{/* Categories/Tags (Dummy for now) */}
					<div className="flex items-center gap-2 mb-6">
						<span className="text-xs font-bold tracking-wider uppercase text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">Article</span>
						{time && (
							<span className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">
								<Hourglass size={12} className="mr-1.5" />
								{time?.text}
							</span>
						)}
					</div>

					<h1 className={cn(
						"text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-8 leading-[1.15]",
						reading && "font-serif text-slate-900 dark:text-slate-100"
					)}>
						{title}
					</h1>
				</motion.div>

				{!reading && (
						<>
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 border-y border-[#e8e8ec] dark:border-white/10 mb-12">
								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
										<span
											title="Published Date"
											className="flex flex-row items-center">
											<CalendarDays className="ml-2" size={16} />
											<span className="px-1 flex">
												{" "}
												{formatDate(article.created_at)}
											</span>
										</span>
										<>
											{time && (
												<span
													title="Expected reading duration"
													className="flex flex-row items-center">
													<span>•</span>
													<BookOpenCheck className="ml-2" size={16} />
													<span className="px-1 flex"> {time.text}</span>
												</span>
											)}
										</>
										{article.view_count && (
											<>
												<span>•</span>
												<span>{article.view_count} views</span>
											</>
										)}
									</div>
								</div>

								<div className="flex items-center gap-4">
									<div className="flex items-center gap-3">
										<img
											src={author?.profile_img || userDp}
											alt={author?.username}
											className="h-10 w-10 rounded-full object-cover cursor-pointer shadow-sm"
											onClick={() => navigate(`/profile/${author?.username}`)}
										/>
										<h3
											className="font-bold cursor-pointer hover:underline text-foreground text-sm uppercase tracking-wide"
											onClick={() => navigate(`/profile/${author?.username}`)}>
											{author?.name || author?.username}
										</h3>
									</div>

									<div className="flex items-center justify-center pl-4 border-l border-[#e8e8ec] dark:border-white/10">
										<ReaderMenu
											child={
												<ul
													className="*:pl-2 *:pr-12  *:py-2 *:mx-0.5 *:rounded-sm  *:my-0.5  py-0.5 dark:*:hover:bg-[#2a2a2a] *:cursor-pointer *:hover:bg-[#e9e9e9]
												
												
												">
													<li
														className="flex items-center gap-1"
														onClick={handleReader}>
														<span>
															<BookOpenText size={16} />
														</span>
														<span className="text-sm">Reading Mode</span>
													</li>

													<li
														className="flex items-center  gap-1"
														onClick={handleShare}>
														<span>
															<Share2 size={18} />
														</span>
														<span className="text-sm">Share</span>
													</li>

													{userId == author?.user_id && (
														<>
															<EditProfileDetails
																title={"Edit article"}
																trigger={
																	<li className="flex items-center gap-1">
																		<span>
																			<Pencil size={16} />
																		</span>
																		<span className="text-sm">Edit Article</span>
																	</li>
																}
																child={
																	<>
																		<div
																			className="
																		
																		
																		 *:w-full w-full *:my-2 
																		
																		">
																			<label className=" flex flex-col *: *: *: ">
																				<span className="dark:text-gray-500 text-gray-900 font-semibold  border-l-4 border-gray-600 pl-2 mb-3 py-0">
																					Title
																				</span>
																				<input
																					type="text"
																					className="  text-gray-800 dark:text-gray-200 border rounded-lg py-2 px-4 outline-1 focus:outline-blue-500"
																					placeholder="title"
																					defaultValue={title}
																					ref={titleRef}
																				/>
																			</label>

																			<label className="  flex flex-col  ">
																				<span className="dark:text-gray-500 text-gray-900 font-semibold  border-l-4 mt-4 mb-3 border-gray-600 pl-2  py-0">
																					Article Body
																				</span>
																				<textarea
																					type="text"
																					className="text-gray-800 dark:text-gray-200 sm:min-h-80  no-scrollbar outline-1 focus:outline-blue-500 border px-4 rounded-lg py-2"
																					placeholder="Article body start here.."
																					defaultValue={body}
																					ref={bodyRef}
																				/>
																			</label>
																		</div>
																	</>
																}
																handleEditChanges={handleEditChanges}
															/>

															<AlertDelete
																handleDelete={handleDelete}
																trigger={
																	<li
																		onClick={(e) => {
																			e.stopPropagation();
																		}}
																		className="flex items-center gap-1 text-red-500 hover:!bg-red-50 dark:hover:!bg-red-500/10 transition-colors">
																		<span>
																			<Trash2 size={16} />
																		</span>
																		<span className="text-sm font-medium ml-0.5">Delete Post</span>
																	</li>
																}
															/>
														</>
													)}
												</ul>
											}
										/>
									</div>
								</div>
							</div>
						</>
					)}
				<div
					className={cn(
						"tiptapEditor pb-12 flex flex-col overflow-x-auto flex-wrap break-normal wrap-break-word max-w-full wrap-anywhere mb-2 transition-all duration-700 ease-in-out",
						reading
							? "font-serif text-xl md:text-[22px] leading-[1.8] tracking-wide text-slate-800 dark:text-[#E2E8F0] max-w-[65ch] mx-auto"
							: "text-lg leading-relaxed text-gray-800 dark:text-[#E0E0E0]"
					)}>
					{parse(body)}
				</div>

				{!reading && (
					<>
						<div className="flex  items-center gap-3 pb-8 border-gray-200 dark:border-gray-700">
							<SignDialogue
								title={`Liked this article?`}
								child={
									<div
										onClick={(e) => {
											e.stopPropagation();

											if (userInfo) {
												e.preventDefault();
												handleLike();
											}
										}}
										className={`flex  items-center gap-2 px-4 py-2 rounded-lg border  border-gray-300 ${
											isLiked &&
											"border-red-600 bg-red-100 dark:border-red-950 dark:bg-red-900/25 hover:bg-red-800 dark:hover:bg-red-900/25 "
										} dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 [&:hover>#heart]:animate-pulse cursor-pointer`}>
										<Heart
											id="heart"
											size={20}
											fill={isLiked ? "#ff0000" : "none"}
											strokeWidth={2}
											className={`${
												isLiked ? "stroke-red-600" : ""
											} transition-transform hover:scale-120`}
										/>

										<span className="text-sm">{like ?? "Like"}</span>
									</div>
								}
							/>

							<button className=" items-center gap-2 px-4 py-2 rounded-lg hidden border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
								<Bookmark size={18} />
								<span className="text-sm">Save</span>
							</button>

							<button className=" items-center gap-2 px-4 py-2 rounded-lg hidden  border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
								<Share size={18} />
								<span className="text-sm">Share</span>
							</button>
						</div>

						<div className="pt-8 border-t">
							<h2 className="text-lg font-bold mb-2 ">
								{commentCount ?? ""} {commentCount > 1 ? "Comments" : "Comment"}
							</h2>

							{userInfo && (
								<div>
									<textarea
										onChange={(e) => {
											if (e.target.value) setShowBtn(true);
											else setShowBtn(false);
										}}
										ref={commentRef}
										placeholder="Write a comment..."
										className="block  field-sizing-content  h-fit min-h-12  w-full px-2 py-0 focus:py-1 border-2 border-gray-500 rounded-lg   dark:border-gray-700 focus:outline-2 outline-gray-800"
									/>

									<div className="w-full mt-1 flex justify-end">
										<button
											disabled={!canComment}
											className={`transition duration-700 ${
												showBtn ? "opacity-100 block" : "opacity-0 hidden"
											}
								outline-0 px-3 py-2 mt-1 text-sm bg-gray-900 text-white dark:bg-gray-100 dark:text-black border rounded-full hover:bg-gray-700  disabled:bg-gray-400`}
											onClick={(e) => {
												if (userInfo) {
													e.preventDefault();
													handleComment();
												}
											}}>
											{canComment ? "Post Comment" : "Please Wait.."}
										</button>
									</div>
								</div>
							)}

							{!userInfo && (
								<div className="px-4 bg-gray-200 dark:bg-[#1b1b1c] py-2 rounded-md">
									<div className=" w-full mt-1 justify-start       text-gray-600 dark:text-gray-400  text-sm inline ">
										In order to comment and put your opinion you need to{" "}
										<NavLink
											to={"/login"}
											className={" text-blue-700 font-semibold underline"}>
											{" "}
											login.
										</NavLink>
									</div>
								</div>
							)}

							<div className="text-gray-500 w-full dark:text-gray-400 pt-4 ">
								{commentList.length > 0 && (
									<div className="w-full rounded-md ">
										{commentList.map((comment) => (
											<CommentCard
												user_id={userId}
												deleteComment={deleteComment}
												setCommentList={setCommentList}
												key={comment.id}
												comment={comment}
											/>
										))}
									</div>
								)}

								{!commentList.length && (
									<div className="p-2 text-center text-xs pt-8">
										No Comments. Be the first to comment.
									</div>
								)}
							</div>
						</div>
					</>
				)}
			</article>
		</div>
	);
}

export default ArticleReader;
