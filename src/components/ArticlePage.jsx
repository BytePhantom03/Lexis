import React, { useContext } from "react";
import ArticleCard from "./ArticleCard";

import { dataContext } from "../context/Context";
import { LoaderCircle } from "lucide-react";

function ArticlePage({ articles }) {
	let [articlesData] = useContext(dataContext);

	if (articles !== undefined) articlesData = articles;

	// Check if articles have finished loading (array exists) vs still loading (undefined)
	const isLoading = articlesData === undefined;
	const isEmpty = Array.isArray(articlesData) && articlesData.length === 0;

	return (
		<div className="mt-3 px-auto  h-full min-h-screen w-full">
			{!isLoading && !isEmpty && articlesData?.length ? (
				<div
					className="flex  justify-center     flex-col items-center w-full box-border pb-8 
				">
					{articlesData &&
						articlesData.map((el) => <ArticleCard key={el.article_id} article={el} />)}
				</div>
			) : (
				""
			)}
			{isEmpty && (
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center text-gray-600">
						<p className="text-lg">No articles yet</p>
						<p className="text-sm">Be the first to write one!</p>
					</div>
				</div>
			)}
			{isLoading && (
				<div className="min-h-screen flex items-center  justify-center">
					<div className="flex items-center gap-2 text-gray-600">
						<LoaderCircle size={24} className="animate-spin" />
						<span>Loading...</span>
					</div>
				</div>
			)}
		</div>
	);
}

export default ArticlePage;
