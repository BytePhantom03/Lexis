import React, { useContext, useState, useEffect } from "react";
import Tiptap from "./Tiptap";
import { ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dataContext, userContext } from "../context/Context";
import supabase from "../config/supabaseClient";
import { toast } from "sonner";

// ML & UI Integrations
import { useEngagementScore } from "../hooks/useEngagementScore";
import EngagementSidebar from "./editor/EngagementSidebar";
import { applyTipToText } from "./tiptap/aiService";

function ArticleWriter({ setWriter }) {
	const [userInfo] = useContext(userContext);
	const user_id = userInfo?.user_id;
	const [, setArticlesData] = useContext(dataContext);

	const [html, setHtml] = useState("");
	const [title, setTitle] = useState("");
	const [category, setCategory] = useState("Technology");
	const [pop, setPop] = useState(false);
	const [authorStats, setAuthorStats] = useState(null);
	const [pauseAiTips, setPauseAiTips] = useState(false);

	const [editorRef, setEditorRef] = useState(null);
	const [isApplyingTip, setIsApplyingTip] = useState(null);

	const navigate = useNavigate();

	// Fetch author stats for ML Model
	useEffect(() => {
		if (!user_id) return;
		async function fetchStats() {
			const { data } = await supabase
				.from("author_stats")
				.select("*")
				.eq("user_id", user_id)
				.maybeSingle();
			if (data) setAuthorStats(data);
		}
		fetchStats();
	}, [user_id]);

	// React Hook to compute engagement score and tips
	const { score, tips, isLoading, dismissTip } = useEngagementScore(html, title, authorStats, category, pauseAiTips);

	const handleApplyTip = async (tip, index) => {
		if (!editorRef) return;
		setIsApplyingTip(index);
		try {
			const newHtml = await applyTipToText(html, tip);
			editorRef.commands.setContent(newHtml);
			setHtml(newHtml);
			setPauseAiTips(true); // Don't show new tips after AI rewrite
			dismissTip(tip);
			toast.success("Tip applied successfully!");
		} catch (error) {
			console.error("Failed to apply tip", error);
			toast.error(error?.message || "Failed to apply tip automatically.");
		} finally {
			setIsApplyingTip(null);
		}
	};

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
				category: category,
				predicted_score: Math.round(score),
				score_computed_at: new Date().toISOString(),
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
				article_id: data[0]?.article_id,
				title: title,
				body: html,
				category: category,
				UserTable: userInfo,
				preview: true,
				created_at: Date.now(),
			};
			setArticlesData((p) => [...p, article]);
			setWriter(false);
		}
	}

	const categories = [
		"Technology", "Health", "Finance", "Lifestyle", "Personal",
		"Business", "Science", "Culture", "Education", "Travel"
	];

	return (
		<div
			id="modalForm"
			onClick={(e) => {
				let modalForm = document.getElementById("modalForm");
				let target = e.target;
				if (!modalForm.contains(target)) setWriter(false);
			}}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
		>
			{/* Expanded max-w from 4xl to 6xl for 2-column layout */}
			<div className="relative w-[95%] max-w-6xl h-[90vh] bg-[#f8f9fa] dark:bg-[#0f0f11] rounded-2xl shadow-2xl flex flex-col border border-[#e8e8ec] dark:border-[#2a2a2e] animate-scale-in overflow-hidden">
				<form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
					{/* Header */}
					<div className="flex items-center justify-between p-4 bg-white dark:bg-[#141416] border-b border-[#e8e8ec] dark:border-[#2a2a2e] shrink-0">
						<div className="flex items-center gap-2">
							<ArrowLeft
								size={22}
								className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full p-1"
								onClick={() => navigate("/home")}
							/>
							<p className="text-lg font-semibold">Write Article</p>
						</div>
						<div>
							<X
								className="cursor-pointer text-gray-500 hover:text-black dark:hover:text-white transition-colors"
								onClick={() => setWriter(false)}
							/>
						</div>
					</div>

					{/* Layout Container */}
					<div className="flex flex-col md:flex-row flex-1 overflow-y-auto p-4 gap-[2%]">
						
						{/* Editor Column: 68% */}
						<div className="w-full md:w-[68%] flex flex-col bg-white dark:bg-[#141416] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
							
							<div className="border-b dark:border-white/5">
								<input
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									type="text"
									placeholder="What is the title?"
									className="w-full p-4 text-xl font-medium outline-none bg-transparent"
									required
								/>
							</div>

							<div className="border-b dark:border-white/5 px-4 py-3 flex items-center gap-4">
								<span className="text-sm font-medium text-gray-500">Category:</span>
								<select 
									value={category} 
									onChange={(e) => setCategory(e.target.value)}
									className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
								>
									{categories.map((c) => (
										<option key={c} value={c}>{c}</option>
									))}
								</select>
							</div>

							<div className="flex-1 overflow-y-auto relative min-h-[300px]">
								<Tiptap setHtml={(newHtml) => { setHtml(newHtml); setPauseAiTips(false); }} child={""} onEditorReady={setEditorRef} />

								<label className="relative w-full">
									{!pop && (
										<div className="absolute right-40 w-fit hidden">
											<input
												className="dark:bg-[#070707] bg-[#fdfdfd] p-4 border-2 w-fit rounded-2xl"
												type="file"
												accept="image/*"
												id="imgUp"
												title="Please select image"
											/>
										</div>
									)}
								</label>
							</div>
						</div>

						{/* Sidebar Column: 30% */}
						<div className="w-full md:w-[30%] mt-4 md:mt-0 flex flex-col gap-4">
							<EngagementSidebar 
								score={score} 
								features={{ wordCount: html ? html.split(' ').length : 0 }} 
								isLoading={isLoading} 
								tips={tips} 
								onApplyTip={handleApplyTip}
								isApplyingTip={isApplyingTip}
							/>
						</div>
					</div>

					{/* Footer */}
					<div className="p-4 border-t dark:border-white/5 bg-white dark:bg-[#141416] flex justify-end shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
						<button
							type="submit"
							disabled={!html || title.length < 1}
							className="btn-primary px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
						>
							Publish
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default ArticleWriter;
