/**
 * Step 3.7 — Rule-based fallback model
 * Used when the platform has fewer than 50 articles and cannot train a meaningful ML model.
 */
export function predictScoreRuleBased(features) {
	let score = 0;

	// features is expected to be an array of exactly 9 values in order, OR an object.
	// Since Step 3.7 says "The function takes the same 9 features", we assume it receives an object.
	const {
		wordCount,
		titleLength,
		titleWordCount,
		fleschKincaid,
		authorFollowerCount,
		authorTotalArticles,
		authorAvgLikes,
		publishHour,
		categoryInt,
		formattingScore,
	} = features;

	// Base score from Category (Different categories have different baseline engagement potentials)
	const categoryBaseScores = [
		15, // 0: Technology
		12, // 1: Health
		14, // 2: Finance
		10, // 3: Lifestyle
		5,  // 4: Personal
		12, // 5: Business
		10, // 6: Science
		8,  // 7: Culture
		8,  // 8: Education
		10  // 9: Travel
	];
	score += categoryBaseScores[categoryInt] || 10;

	// Rule 1: Word count (Heavily penalize unformatted wall of text)
	if (wordCount >= 600 && wordCount <= 1500) {
		if (formattingScore < 10) {
			score += 5; // Wall of text penalty
		} else {
			score += 30; // Well-formatted long form
		}
	} else if (wordCount > 1500) {
		score += 15;
	} else if (wordCount > 300) {
		score += 10;
	}

	// Rule 2: Title length
	if (titleLength >= 40 && titleLength <= 70) {
		score += 20;
	} else if (titleLength > 10) {
		score += 10;
	}

	// Rule 3: Readability
	if (fleschKincaid >= 8 && fleschKincaid <= 12) {
		score += 15;
	} else if (fleschKincaid < 8) {
		score += 10;
	} else {
		score += 5;
	}

	// Rule 4: Author stats
	if (authorFollowerCount > 10) score += 15;
	else if (authorFollowerCount > 0) score += 5;

	if (authorTotalArticles > 3) score += 10;
	else if (authorTotalArticles > 0) score += 5;

	// Rule 5: Publish Hour
	if ((publishHour >= 7 && publishHour <= 10) || (publishHour >= 18 && publishHour <= 21)) {
		score += 10;
	}

	// Ensure score remains within 0-100 boundary
	return Math.min(100, Math.max(0, score));
}
