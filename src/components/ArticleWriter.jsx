import React, { useContext, useState } from "react";
import Tiptap from "./Tiptap";
import { ArrowLeft, Camera, Image, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dataContext, userContext } from "../context/Context";
import supabase from "../config/supabaseClient";
import { toast } from "sonner";
import { cover_placeholder } from "../../public/resource";

function ArticleWriter({ setWriter }) {
	const [userInfo] = useContext(userContext);
	const user_id = userInfo?.user_id;
	const [, setArticlesData] = useContext(dataContext);

	const [html, setHtml] = useState("");
	const [title, setTitle] = useState("");
	const [pop, setPop] = useState(false);
	const [images, setImages] = useState([cover_placeholder]);

	const navigate = useNavigate();

	async function handleSubmit(e) {
		e.preventDefault();

		if (!title || !html) {
			toast("Title and content required");
			return;
		}

		const { data, error } = await supabase
			.from("ArticleTable")
			.insert({
				author_id: user_id,
				title: title,
				body: html,
			})
			.select();

		if (error) {
			console.error(error);
			toast("Something went wrong ❌");
			return;
		}

		if (data) {
			toast("Successfully Added ✅");
			setTitle("");
			setHtml("");

			let article = {
				id: data[0]?.id,
				article_id : data[0]?.article_id,
				title: title,
				body: html,
				UserTable: userInfo,
				preview: true,
				created_at: Date.now(),
			};
			setArticlesData((p) => [...p, article]);
			//navigate("/home");
			setWriter(false);
		}
	}

	return (
		<div
			id="modalForm"
			onClick={(e) => {
				let modalForm = document.getElementById("modalForm");
				let target = e.target;

				if (!modalForm.contains(target)) setWriter(false);
			}}
			className="fixed
	inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<div className="relative w-[95%] max-w-4xl h-[90vh] bg-white dark:bg-[#141416] rounded-2xl shadow-2xl flex flex-col border border-[#e8e8ec] dark:border-[#2a2a2e] animate-scale-in">
				<form onSubmit={handleSubmit} className="flex flex-col h-full">
					<div className="flex items-center justify-between p-4 border-b border-[#e8e8ec] dark:border-[#2a2a2e]">
						<div className="flex items-center gap-2">
							<ArrowLeft
								size={22}
								className="cursor-pointer hover:bg-gray-200 rounded-full p-1"
								onClick={() => navigate("/home")}
							/>
							<p className="text-lg font-semibold">Write Article</p>
						</div>

						<div>
							<X
								className="hover:cursor-pointer"
								onClick={() => setWriter(false)}
							/>
						</div>
					</div>

					<div className="border-b">
						<input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							type="text"
							placeholder="What is the title?"
							className="w-full p-4 text-lg outline-none"
							required
						/>
					</div>

					<div className="flex-1 overflow-y-auto">
						<Tiptap setHtml={setHtml} child={""} />

						<label className="relative w-full">
							{!pop && (
								<div
									className="absolute 
											
										right-40	
											   w-fit">
									<input
										className="dark:bg-[#070707] bg-[#fdfdfd] p-4 border-2  
													
													w-fit
													rounded-2xl  "
										type="file"
										accept="image/*"
										id="imgUp"
										title="Please select image"
									/>
								</div>
							)}
						</label>
					</div>

					<div className="p-4 border-t flex justify-end">
						<button
							type="submit"
							disabled={!html || title.length < 1}
							className="btn-primary px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
			  hover:cursor-pointer">
							Publish
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default ArticleWriter;
