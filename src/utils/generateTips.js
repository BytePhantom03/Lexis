/**
 * Generates actionable tips based on extracted features and AI evaluation.
 * 
 * @param {object} features - The 9 extracted features
 * @param {number} aiScore - The relevance score from Groq (0-100)
 * @param {string} category - The selected category
 * @param {string[]} aiTips - Array of AI-generated content tips
 * @returns {string[]} Array of tip strings (max 3)
 */
export function generateTips(features, aiScore = 100, category = "", aiTips = []) {
	const tips = [];

	if (!features) return tips;

	const {
		wordCount,
		titleLength,
		fleschKincaid,
		authorFollowerCount,
		formattingScore,
	} = features;

	// Rule 1: Relevance (Strict Penalty)
	if (aiScore < 40 && wordCount > 15) {
		tips.push(`Your text does not seem very relevant to "${category}". Ensure you stay on topic to maximize engagement.`);
	}

	// Rule 2: Formatting (Wall of Text)
	if (wordCount > 300 && formattingScore < 10) {
		tips.push("Your article lacks formatting. Add headings, bold text, or lists to make it easier to read.");
	}

	// Rule 3: Word Count
	if (wordCount < 300) {
		tips.push("Your article is quite short. Consider expanding the body to provide more depth (aim for 600+ words).");
	} else if (wordCount > 2000) {
		tips.push("This article is very long. Ensure you have clear headings and break up text to maintain reader attention.");
	}

	// Rule 4: Title Length
	if (titleLength < 20) {
		tips.push("Your title is a bit short. Try making it more descriptive to improve click-through rates.");
	} else if (titleLength > 80) {
		tips.push("Your title is quite long. Consider condensing it to make it punchier and easier to read.");
	}

	// Rule 5: Readability
	if (fleschKincaid > 14) {
		tips.push("Your sentence structure is quite complex. Try using shorter sentences to improve readability for a broader audience.");
	} else if (fleschKincaid < 6 && wordCount > 100) {
		tips.push("Your writing is very simple. If appropriate for your topic, you could incorporate more advanced vocabulary.");
	}

	// Rule 6: AI Content Tips (Dynamic Advice)
	if (aiTips && aiTips.length > 0) {
		tips.push(...aiTips);
	}

	// Return up to 3 tips (prioritizing critical static warnings, then AI tips, then generic advice)
	return tips.slice(0, 3);
}
