import * as ort from "onnxruntime-web";
import { predictScoreRuleBased } from "./engagement_rules";
import { getAIEngagementScore } from "../components/tiptap/aiService";

// Set WASM paths based on Vite static copy configuration
ort.env.wasm.wasmPaths = "/onnxruntime-web/dist/";

let session = null;
let isLoading = false;
let loadError = false;

/**
 * Loads the ONNX model into memory. Caches it globally in this module.
 */
export async function loadModel() {
	if (session) return true;
	if (loadError) return false;
	if (isLoading) {
		while (isLoading) await new Promise((r) => setTimeout(r, 100));
		return !!session;
	}

	isLoading = true;
	try {
		session = await ort.InferenceSession.create("/models/engagement_model.onnx", {
			executionProviders: ["wasm"],
		});
		isLoading = false;
		return true;
	} catch (err) {
		console.warn("ONNX model load failed, falling back to rule-based model.", err);
		loadError = true;
		isLoading = false;
		return false;
	}
}

/**
 * Predicts the engagement score (0-100).
 * Blends static structural rules with the Groq AI relevance score.
 */
export async function predictScore(features, html, category) {
	let baseScore = 0;
	const modelLoaded = await loadModel();

	if (!modelLoaded || !session) {
		// Fallback to rules if ONNX isn't available
		baseScore = predictScoreRuleBased(features);
	} else {
		try {
			const inputArray = new Float32Array([
				features.wordCount, features.titleLength, features.titleWordCount,
				features.fleschKincaid, features.authorFollowerCount, features.authorTotalArticles,
				features.authorAvgLikes, features.publishHour, features.categoryInt,
			]);
			const tensor = new ort.Tensor("float32", inputArray, [1, 9]);
			const inputName = session.inputNames[0];
			const results = await session.run({ [inputName]: tensor });
			const outputData = results[session.outputNames[0]].data;
			baseScore = Math.max(0, Math.min(100, outputData[0])); 
		} catch (err) {
			console.warn("ONNX inference failed, using fallback.", err);
			baseScore = predictScoreRuleBased(features);
		}
	}

	// Augment with AI Score for deeper relevance evaluation
	let aiScore = 100; // Assume 100 if we don't query it
	try {
		// Only ask AI if the text has enough content to judge relevance
		if (features.wordCount > 15) {
			aiScore = await getAIEngagementScore(html, category);
			if (aiScore > 0 || aiScore === 0) {
				// Relevance Multiplier: If AI says 0 relevance, final score is 0. If AI says 50, final score is halved.
				const finalScore = baseScore * (aiScore / 100);
				return { score: Math.round(Math.max(0, Math.min(100, finalScore))), aiScore };
			}
		}
	} catch (error) {
		console.warn("AI scoring failed, using base score only", error);
	}

	return { score: Math.round(baseScore), aiScore };
}
