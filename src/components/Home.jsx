import NavbarPage from "./NavbarPage";
import ArticlePage from "./ArticlePage";
import AddArticle from "./AddArticle";
import FieldInput from "./ui/FieldInput";
import ArticleWriter from "./ArticleWriter";
import { useContext, useEffect, useState } from "react";

import { FilePenLine, LogIn, PenLine } from "lucide-react";
import { commentUIContext, dataContext, userContext } from "../context/Context";
import { NavLink, useNavigate } from "react-router-dom";
import supabase from "../config/supabaseClient";
import NoArticles from "./utils/NoArticles";
import HomeComment from "./HomeComment";
import FollowRecc from "./FollowRecc";

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
		<div className="w-full box-border h-fit min-h-screen bg-[#fafafa] dark:bg-[#0a0a0b]">
			<NavbarPage />

			<div className="flex-col justify-center items-start md:gap-10 pt-16">
				<div className="max-w-2xl mx-auto px-4">
					<div
						className="mt-15 overflow-auto"
						id="writer">
						{write && <ArticleWriter setWriter={setWriter} />}
						<div
							hidden={write || !userInfo}
							onClick={() => {
								setWriter(true);
							}}
							className={`btn-primary rounded-full shadow-lg hover:shadow-xl bottom-4 right-4 fixed z-20 w-fit transition-all duration-300 hover:scale-105
					
					${scrolling ? "hidden" : "block"}
					`}>
							<div
								id="article_Button"
								className="h-full w-full cursor-pointer flex items-center gap-2 px-5 py-3 outline-0 [&:hover>.pencil]:-rotate-5 select-none"
								placeholder="">
								<PenLine size={18} color="white" className="pencil" />
								<span className="text-sm font-semibold text-white transition-all duration-350">
									Write Article
								</span>
							</div>
						</div>
					</div>

					<commentUIContext.Provider
						value={[commentClicked, setCommentClicked, id, setId]}>
						<div className="box-border">
							{articles && <ArticlePage articles={articles} />}
							{!articles && <NoArticles />}
						</div>

						{commentClicked && (
							<div>
								<HomeComment setCommentUI={setCommentClicked} id={id} />
							</div>
						)}
					</commentUIContext.Provider>
				</div>

				{userInfo && (
					<div className="pb-8 mt-8">
						<FollowRecc />
					</div>
				)}
			</div>
		</div>
	);
}

export default Home;
