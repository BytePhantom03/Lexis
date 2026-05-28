import NavbarPage from "./NavbarPage";
import ArticlePage from "./ArticlePage";
import AddArticle from "./AddArticle";
import FieldInput from "./ui/FieldInput";
import ArticleWriter from "./ArticleWriter";
import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";

import { FilePenLine, LogIn, PenLine } from "lucide-react";
import { commentUIContext, dataContext, userContext } from "../context/Context";
import { NavLink, useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";
import NoArticles from "./utils/NoArticles";
import HomeComment from "./HomeComment";
import FollowRecc from "./FollowRecc";
import Footer from "./Footer";

function Home() {
	let [scrolling, setScrolling] = useState(false);
	const [write, setWriter] = useState(false);
	const [crousel, setCrousel] = useState(true);
	const [userInfo, isLoading] = useContext(userContext);
	const navi = useNavigate();
	const [commentClicked, setCommentClicked] = useState();
	const [id, setId] = useState(-1); //used for Home Comment Ui

	const [articles, setArticlesData, , setLikedArcticles, , setMyFollowing] =
		useContext(dataContext);

	useEffect(() => {
		if (isLoading) return;

		async function loadeArticles() {
			try {
				const response = await Promise.race([
					supabase
						.from("ArticleTable")
						.select(`
							created_at,
							likes,
							comment_count,
							article_id,
							title,
							author_id,
							body,
							images,
							UserTable!author_id(
							name,
							username,
							profile_img,
							user_id
							)
							`)
						.order("created_at", { ascending: false }),
					new Promise((_, reject) => 
						setTimeout(() => reject(new Error("Fetch timeout")), 8000)
					)
				]);

				if (response.error) {
					console.error("Database error:", response.error);
					setArticlesData([]); // Set empty array on error
					return null;
				}
				if (response.data) {
					setArticlesData(response.data);
					document.title = "Lexis"

					// Only fetch liked articles if user is logged in
					if (userInfo && userInfo.user_id) {
						const { data, error } = await supabase.from("LikesTable").select();

						if (error) {
							console.error(error);
						} else if (data) {
							let tempSet = new Set();
							data.forEach((row) => {
								if (row.user_id == userInfo.user_id) tempSet.add(row.article_id);
							});

							setLikedArcticles(tempSet);
						}
					}
				}
			} catch (error) {
				console.error("Failed to load articles:", error.message);
				setArticlesData([]); // Set empty array on error
			}
		}

		loadeArticles();
	}, [
		userInfo,
		isLoading,
		navi,
		setLikedArcticles,
		setArticlesData,
		setMyFollowing,
	]);

	useEffect(() => {
		document.addEventListener("scroll", () => {
			setScrolling(true);
		});

		document.addEventListener("scrollend", () => {
			setScrolling(false);
		});
	}, []);

	return (
		<div className="w-full box-border h-fit min-h-screen bg-background relative overflow-hidden">
			<NavbarPage />

			{/* Abstract Glowing Background Blobs */}
			<div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden -z-10 pointer-events-none">
				<div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-float"></div>
				<div className="absolute top-20 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] animate-float stagger-2"></div>
				<div className="absolute top-80 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-400/10 rounded-full blur-[120px] animate-float stagger-4"></div>
			</div>

			{/* Hero Section */}
			{!userInfo && (
				<motion.div 
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					className="max-w-5xl mx-auto px-4 pt-36 pb-20 text-center flex flex-col items-center"
				>
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 mb-8 animate-fade-in-up">
						<span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
						<span className="text-sm font-medium text-foreground">Lexis AI Copilot v2.0 is live</span>
					</div>
					
					<h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
						Write smarter, <br className="hidden md:block" />
						not harder with <span className="gradient-text">AI.</span>
					</h1>
					
					<p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mb-10 leading-relaxed">
						Join the next generation of creators. Lexis blends a beautiful reading experience with an intelligent AI copilot that learns your voice and helps you write flawlessly.
					</p>

					<div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
						<button 
							onClick={() => navi("/login")}
							className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 hover:scale-105"
						>
							Start Writing for Free
						</button>
						<button 
							onClick={() => document.getElementById("trending").scrollIntoView({ behavior: "smooth" })}
							className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-foreground glass hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300"
						>
							Read Trending Blogs
						</button>
					</div>
				</motion.div>
			)}

			{/* Main Feed Container */}
			<div id="trending" className={`flex-col justify-center items-start md:gap-10 ${userInfo ? 'pt-32' : 'pt-16'}`}>
				<div className="max-w-4xl mx-auto px-4">
					
					{/* Section Header */}
					<div className="flex items-center justify-between mb-8 pb-4 border-b border-[#e8e8ec] dark:border-[#2a2a2e]">
						<h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
							<span className="w-4 h-8 rounded-sm bg-gradient-to-b from-indigo-500 to-purple-600"></span>
							{userInfo ? "Your Feed" : "Trending Blogs"}
						</h2>
					</div>

					<div className="mt-15 overflow-auto" id="writer">
						{write && <ArticleWriter setWriter={setWriter} />}
						<div
							hidden={write || !userInfo}
							onClick={() => setWriter(true)}
							className={`btn-primary rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] bottom-8 right-8 fixed z-20 w-fit transition-all duration-300 hover:-translate-y-1 ${scrolling ? "opacity-50" : "opacity-100"}`}
						>
							<div
								id="article_Button"
								className="h-full w-full cursor-pointer flex items-center gap-3 px-6 py-4 outline-0"
							>
								<PenLine size={20} color="white" />
								<span className="text-base font-semibold text-white">
									New Article
								</span>
							</div>
						</div>
					</div>

					<commentUIContext.Provider value={[commentClicked, setCommentClicked, id, setId]}>
						<motion.div 
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="box-border"
						>
							{articles && <ArticlePage articles={articles} />}
							{!articles && <NoArticles />}
						</motion.div>

						{commentClicked && (
							<div>
								<HomeComment setCommentUI={setCommentClicked} id={id} />
							</div>
						)}
					</commentUIContext.Provider>
				</div>

				{userInfo && (
					<div className="max-w-4xl mx-auto px-4 mt-16 mb-8">
						<FollowRecc />
					</div>
				)}
			</div>
			
			<Footer />
		</div>
	);
}

export default Home;
