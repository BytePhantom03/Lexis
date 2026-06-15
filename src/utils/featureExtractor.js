/**
 * Extract 9 features for the engagement prediction model.
 * 
 * @param {string} editorContent - Plain text extracted from Tiptap editor
 * @param {string} titleText - The title of the article
 * @param {object} authorStats - The stats fetched from author_stats table
 * @param {string} categoryName - The string name of the selected category
 */
export function extractFeatures(editorContent, titleText, authorStats, categoryName) {
	// Strip HTML tags for accurate word counting and readability scores
	const plainText = (editorContent || "").replace(/<[^>]+>/g, " ");
	const bodyWords = plainText.trim().split(/\s+/).filter(word => word.length > 0);
	const wordCount = bodyWords.length;

	// Formatting Score (used by rule-based fallback to penalize unformatted text)
	let formattingScore = 0;
	if (editorContent) {
		const headingCount = (editorContent.match(/<h[1-6]>/g) || []).length;
		const listCount = (editorContent.match(/<ul>|<ol>/g) || []).length;
		const boldCount = (editorContent.match(/<strong>|<b>/g) || []).length;
		const blockquoteCount = (editorContent.match(/<blockquote>/g) || []).length;
		formattingScore = (headingCount * 5) + (listCount * 5) + (boldCount * 2) + (blockquoteCount * 3);
	}

	// 2. title character length
	const title = titleText || "";
	const titleLength = title.length;

	// 3. title word count
	const titleWords = title.trim().split(/\s+/).filter(w => w.length > 0);
	const titleWordCount = titleWords.length;

	// 4. Flesch-Kincaid grade level score of the body
	let fleschKincaid = 8.0; // Default
	if (wordCount > 0) {
		const sentences = (plainText.match(/[.!?]+/g) || []).length || 1;
		const syllables = (plainText.toLowerCase().match(/[aeiouy]+/g) || []).length || wordCount;
		fleschKincaid = 0.39 * (wordCount / sentences) + 11.8 * (syllables / wordCount) - 15.59;
		fleschKincaid = Math.max(0, Math.min(20, fleschKincaid)); // clamp 0-20
	}

	// 5, 6, 7. Author stats
	const authorFollowerCount = authorStats?.follower_count || 0;
	const authorTotalArticles = authorStats?.total_articles_published || 0;
	const authorAvgLikes = authorStats?.avg_likes_per_article || 0;

	// 8. Hour of day (0-23)
	const publishHour = new Date().getHours();

	// 9. Category as integer index
	const categories = [
		"Technology", "Health", "Finance", "Lifestyle", "Personal", 
		"Business", "Science", "Culture", "Education", "Travel"
	];
	let categoryInt = categories.indexOf(categoryName);
	if (categoryInt === -1) categoryInt = 0; // Default if not found

	return {
		wordCount,
		titleLength,
		titleWordCount,
		fleschKincaid,
		authorFollowerCount,
		authorTotalArticles,
		authorAvgLikes,
		publishHour,
		categoryInt,
		formattingScore
	};
}
