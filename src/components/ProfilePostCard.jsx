import React, { useContext, useState } from "react";
import parse from "html-react-parser";
import { Ellipsis, Trash2, BookOpen } from "lucide-react";
import supabase from "../config/supabaseClient";
import Loader from "./Loader";
import { userContext } from "../context/Context";
import { NavLink } from "react-router-dom";
import { toast } from "sonner";
import { AlertDelete } from "./AlertDelete";

function ProfilePostCard({ article, setArticle, isOpen, setOpenMenuId }) {
	const [loader, setLoader] = useState(false);
	const [userInfo] = useContext(userContext);
	const user_id = userInfo?.user_id;

	if (!article) return null;

	async function handleDelete(e) {
		e.stopPropagation();
		e.preventDefault();
		setLoader(true);
		const res = await supabase
			.from("ArticleTable")
			.delete()
			.eq("article_id", article.article_id);

		if (!res.error) {
			toast("Deleted successfully.");
			setArticle((p) => p.filter((x) => x.article_id !== article.article_id));
		} else {
			toast("Error while deleting");
		}
		setLoader(false);
	}

	return (
		<div
			to={`/article?id=${article.article_id}`}
			onContextMenu={(e) => {
				e.preventDefault();
				setOpenMenuId(isOpen ? null : article.article_id);
			}}
			className="group px-1    relative flex flex-col w-full  bg-white dark:bg-[#141414]  border  
			 overflow-hidden  duration-300 mx-auto   sm:border sm:mt-2  border-[#ebdede] dark:border-[#232225]    sm:rounded-xl transition-all">
			{/* Loading Overlay */}
			{loader && (
				<div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-[2px]">
					<Loader text={"Deleting..."} />
				</div>
			)}

			<div className="flex   justify-between items-start  absolute right-2  top-2">
				{user_id == article.author_id && (
					<div className="relative ">
						<button
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setOpenMenuId(isOpen ? null : article.article_id);
							}}
							className={`p-1.5 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100
							 dark:hover:bg-[#252525] ${
									isOpen && "bg-[#252525]"
								} transition-all cursor-pointer`}>
							<Ellipsis
								size={20}
								className="hover:scale-110 hover:animate-pulse "
							/>
						</button>

						{/* Action Menu */}
						{isOpen && (
							<>
								{/* Backdrop to close menu on click outside */}
								<div
									className="relative right-4   inset-0 z-10  "
									onClick={() => setOpenMenuId(null)}
								/>

								<AlertDelete
									handleDelete={handleDelete}
									trigger={
										<div
											onClick={(e) => {
												e.stopPropagation();
											}}
											className="absolute right-0 top-full mt-1 bg-white dark:bg-[#1c1c1f] border border-[#e8e8ec] dark:border-[#2a2a2e] rounded-xl shadow-xl p-1 animate-slide-down z-20">
											<button type="button" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
												<Trash2 size={13} />
												<span>Delete Post</span>
											</button>
										</div>
									}
								/>
							</>
						)}
					</div>
				)}
			</div>

			<NavLink to={`/article?id=${article?.article_id}`} className="px-5 mt-6 pb-5">
				<h3 className=" font-semibold text-gray-800 dark:text-gray-100 text-xl line-clamp-1 mb-2 tracking-tight">
					{article.title}
				</h3>
				<div className="text-sm text-gray-800 dark:text-gray-400 line-clamp-3 leading-relaxed opacity-80 prose-p:m-0">
					{parse(article.body)}
				</div>
			</NavLink>
		</div>
	);
}

export default React.memo(ProfilePostCard);
