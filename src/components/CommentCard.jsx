import { Eclipse, EclipseIcon, Ellipsis } from "lucide-react";
import React, { useState } from "react";
import { userDp } from "../../public/avtar";
import { TimeFormate } from "./utils/TimeFormater";
import { NavLink } from "react-router-dom";

function CommentCard({ comment, deleteComment, user_id }) {
	const { UserTable: commenter } = comment;
	const { created_at } = comment;
	let date = Date.parse(created_at);

	const [menuOpen, setMenuOpen] = useState();
	function handleDelete(e) {
		e.stopPropagation();
		deleteComment(comment.comment_id, comment);
	}

	return (
		// DROP-IN REPLACEMENT — only classNames changed, zero logic touched

		<div
			className={`flex justify-between items-start transition-colors duration-400 hover:dark:bg-gray-100/3 hover:bg-gray-200/90 rounded-xl dark:border-gray-800 border-gray-200 text-foreground ${
				menuOpen && "dark:bg-gray-800/20 bg-gray-400/40"
			}`}>
			{/* Left: avatar + content */}
			<div className="flex items-start flex-row p-3 gap-2.5 flex-1 min-w-0">
				<img
					src={commenter?.profile_img ?? userDp}
					className="h-8 w-8 mt-0.5 shrink-0 ring-1 ring-gray-200 dark:ring-gray-700 rounded-full object-cover"
				/>

				<div className="flex-1 min-w-0">
					{/* Username + timestamp */}
					<div className="flex items-center gap-1.5 flex-wrap">
						<NavLink
							to={`/profile/${commenter?.username}`}
							className="text-sm font-semibold text-gray-800 dark:text-gray-100 hover:underline underline-offset-2 leading-none">
							{"@" + commenter?.username}
						</NavLink>
						<span className="text-[11px] text-gray-400 dark:text-gray-500 leading-none select-none">
							· {TimeFormate(created_at)}
						</span>
					</div>

					{/* Comment body */}
					<p className="mt-1.5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words    pb-4">
						{comment.comment}
					</p>
				</div>
			</div>

			{/* Right: menu */}
			{user_id === comment.user_id && (
				<div className="relative shrink-0 p-2">
					<Ellipsis
						className="cursor-pointer rotate-90 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-0.5 transition-colors"
						size={18}
						onClick={() => setMenuOpen((p) => !p)}
					/>

					{menuOpen && (
						<div className="absolute right-8.5 top-2 z-50 bg-white dark:bg-[#1e1e20] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg shadow-black/10 dark:shadow-black/40 gap-2 flex flex-col  overflow-hidden">
							<button
								className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50  dark:hover:bg-red-900/20 transition-colors rounded-lg whitespace-nowrap"
								onClick={handleDelete}>
								Delete
							</button>
						
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default CommentCard;
