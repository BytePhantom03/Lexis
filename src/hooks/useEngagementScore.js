import { useState, useEffect } from "react";
import { predictScore } from "../utils/engagementModel";
import { extractFeatures } from "../utils/featureExtractor";
import { generateTips } from "../utils/generateTips";

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

				// 2. Run inference (unified AI call handles both score and tips)
				const { score: predictedScore, aiScore, aiTips } = await predictScore(features, html, category);
				setScore(predictedScore);
				
				// 3. Generate final hybrid tips immediately
				const newTips = generateTips(features, aiScore, category, aiTips);
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
