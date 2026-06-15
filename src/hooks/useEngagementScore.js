import { useState, useEffect } from "react";
import { predictScore } from "../utils/engagementModel";
import { extractFeatures } from "../utils/featureExtractor";
import { generateTips } from "../utils/generateTips";
import { getAITips } from "../components/tiptap/aiService";

export function useEngagementScore(html, title, authorStats, category) {
	const [score, setScore] = useState(0);
	const [tips, setTips] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setIsLoading(true);

		// Debounce inference by 2000ms to protect API limits
		const timer = setTimeout(async () => {
			try {
				// 1. Extract features
				const features = extractFeatures(html, title, authorStats, category);

				// 2. Run inference & get AI tips in parallel
				const [prediction, aiTips] = await Promise.all([
					predictScore(features, html, category),
					getAITips(html, category)
				]);
				const { score: predictedScore, aiScore } = prediction;

				// 3. Generate hybrid tips
				const newTips = generateTips(features, aiScore, category, aiTips);

				setScore(predictedScore);
				setTips(newTips);
			} catch (error) {
				console.error("Error predicting engagement score:", error);
			} finally {
				setIsLoading(false);
			}
		}, 2000);

		return () => clearTimeout(timer);
	}, [html, title, authorStats, category]);

	return { score, tips, isLoading };
}
