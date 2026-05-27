import { LoaderCircle, X } from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { commentUIContext, userContext } from "../context/Context";
import supabase from "../config/supabaseClient";
import { toast } from "sonner";
import CommentCard from "./CommentCard";
import { NavLink } from "react-router-dom";

function HomeComment({ setCommentUI, id }) {
	const [userInfo] = useContext(userContext);
	const [loading, setLoading] = useState(true);
	const [, , , setId] = useContext(commentUIContext);
	const commentRef = useRef();
	const [canComment, setCanComment] = useState(true);
	const [showBtn, setShowBtn] = useState();
	const [commentCount, setCommentCount] = useState(null);
	const [article_id, setArticle_id] = useState();
	let temporaryCount = useRef(0);

	const userId = userInfo?.user_id;
	const [commentList, setCommentList] = useState([]);
	async function deleteComment(id, comment) {
		setCommentList((prev) => {
			return prev.filter((p) => p.comment_id != id);
		});
		temporaryCount.current = temporaryCount.current - 1;

		const { data, error } = await supabase
			.from("CommentTable")
			.delete()
			.eq("comment_id", id)
			.select();

		if (error) {
			toast("Could not delete comment");

			setCommentList((prev) => [...prev, comment]);
			temporaryCount.current = temporaryCount.current + 1;
		}

		if (data) {
			toast("Comment Deleted.");

			const { error: countError } = await supabase
				.from("ArticleTable")
				.update("comment_count", temporaryCount)
				.eq("article_id", article_id);

			if (countError) {
				toast("Error while updating comment count.");
			}
		}
	}

	useEffect(() => {
		const fetchArticle = async () => {
			setLoading(true);
			try {
				const { data, error } = await supabase
					.from("ArticleTable")
					.select(`article_id,CommentTable(*)`)
					.eq("article_id", id)
					.single();

				if (error) console.error(error);
				if (!data) return;
				setArticle_id(data?.article_id);

				setCommentCount(data?.CommentTable?.length);
				temporaryCount.current = data?.CommentTable?.length;

				//DB se like lena hai
				//setLike(data.likes ?? 0);

				//Comment
				const { data: commentData, error: commentError } = await supabase
					.from("CommentTable")
					.select("*,UserTable(username,profile_img)")
					.eq("article_id", id);

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
	}, [id]);

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
						article_id: id,
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
					.eq("article_id", id)
					.select();

				if (countError) {
					toast("Error while updating comment count.");
					setCommentCount((p) => p - 1);
					return;
				}

				if (countData) toast("Comment Posted.");
				setShowBtn(false);
			}
		}

		setCanComment(true);
		commentRef.current.value = null;
	}

	return (
		<>
			<div className="h-2/3   border-t border-[#d8d0d0] dark:border-[#212020] w-full z-50 fixed bottom-0 bg-[#f5f8f7] dark:bg-[#121212]  shadow-2xl sm:shadow-sm  md:w-1/3 md:border md:bottom-3 md:rounded-2xl md:right-1 md:justify-self-end   rounded-t-4xl flex flex-col  items-center overflow-y-scroll no-scrollbar">
				<>
					<div className="border-b h-12 w-full flex justify-between items-center p-4 sticky top-0 bg-transparent backdrop-blur-3xl">
						<div className=" text-lg font-bold ">
							Comments{" "}
							<span className="text-gray-400 top-3 font-thin hidden">
								{commentCount}
							</span>
						</div>
						<X
							onClick={() => {
								setCommentUI((p) => !p);

								setId(null);
							}}
							size={18}
							className="hover:text-red-600 hover:font-bold cursor-pointer"
						/>
					</div>

					<div className=" px-5  w-full    pt-2">
						{userInfo && (
							<div>
								<textarea
									onChange={(e) => {
										if (e.target.value) setShowBtn(true);
										else setShowBtn(false);
									}}
									ref={commentRef}
									placeholder="Write a comment..."
									className="block  field-sizing-content 
								text-sm h-fit min-h-12  w-full px-2 py-0 focus:py-1 border-2 border-gray-500 rounded-lg   dark:border-gray-700 focus:outline-2 outline-gray-800"
								/>

								<div className="w-full mt-1 flex justify-end relative">
									<button
										disabled={!canComment}
										className={`transition    
										absolute duration-700 ${showBtn ? "opacity-100 block" : "opacity-0 hidden"}
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
					</div>
					{!loading && (
						<div className="w-full h-full px-4">
							{commentList.length == 0 && (
								<span className="flex h-full  flex-col justify-center w-full items-center">
									<span className="font-bold">No Comments yet.</span>
									<span>Be the first one to comment.</span>
								</span>
							)}

							{commentList.length > 0 && (
								<div className="w-full h-full  rounded-md p-1   ">
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
						</div>
					)}

					{loading && (
						<div className="h-full w-full flex justify-center items-start pt-12 ">
							{" "}
							<LoaderCircle className="mt-1 mx-1 animate-spin" size={18} />{" "}
							<span>Loading..</span>{" "}
						</div>
					)}
				</>
			</div>
		</>
	);
}

export default HomeComment;
