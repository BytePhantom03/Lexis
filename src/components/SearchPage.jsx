import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavbarPage from "./NavbarPage";
import supabase from "../config/supabaseClient";
import ArticlePage from "./ArticlePage";
import { LoaderCircle } from "lucide-react";

import { Player } from "@lottiefiles/react-lottie-player";
import SearchArticleResult from "./SearchArticleResult";

function SearchPage() {
	const [searchParams] = useSearchParams();
	const [searchQuery, SetSearchQuery] = useState(searchParams.get("q"));
	const [articles, setArticles] = useState([]);

	const [authors, setAuthors] = useState([]);
	const [loading, setLoading] = useState();
	const navigate = useNavigate();

	useEffect(() => {
		if (!searchQuery) {
			//	navigate("/home");
			return;
		} else {
			async function Search(text) {
				setLoading(true);

				let authorQuery = `username.ilike.%${text}%,name.ilike.%${text}%,about.ilike.%${text}%`;
				let orQuery = `title.ilike.%${text}%,body.ilike.%${text}%`;

				const { data: searchData, error: searchError } = await supabase
					.from("ArticleTable")
					.select("*,UserTable(*)")
					.or(orQuery);

				if (searchError) {

					setLoading(false);
				} else if (searchData) {
					setArticles(searchData);
					
				}

				const { data: authorData, error: authorSearchError } = await supabase
					.from("UserTable")
					.select("*")
					.or(authorQuery);

				if (authorSearchError) {
					setLoading(false);
				} else if (authorData) {
					setAuthors(authorData);
					setLoading(false);
				}
			}
			Search(searchQuery);
		}
	}, [navigate, searchQuery]);

	if (loading)
		return (
			<div className="h-screen w-full">
				<div className="min-h-full flex items-center justify-center">
					<div className="flex items-center gap-2 text-gray-600">
						<LoaderCircle size={24} className="animate-spin" />
						<span>Loading..</span>
					</div>
				</div>
			</div>
		);

	return (
		<div className="w-full min-h-screen pt-2">
			<NavbarPage SetSearchQuery={SetSearchQuery} />

			<div className="h-full  w-full flex mt-12 justify-center">
				{!loading && (
					<div className="w-full h-full">
						<SearchArticleResult articles={articles} authors={authors} />
					</div>
				)}
			</div>
		</div>
	);
}

export default SearchPage;
