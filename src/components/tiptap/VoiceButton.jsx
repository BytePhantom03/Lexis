import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Loader2 } from "lucide-react";
import { toast } from "sonner";
import supabase from "../../config/supabaseClient";

/**
 * VoiceButton — Real-time Web Speech API + Llama 3.3 cleanup
 *
 * States: idle → recording → processing → idle
 */
const VoiceButton = ({ editor }) => {
	const [state, setState] = useState("idle");
	const recognitionRef = useRef(null);
	const startPosRef = useRef(null);
	const rawTranscriptRef = useRef("");

	// Initialize Web Speech API
	useEffect(() => {
		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;

		if (!SpeechRecognition) {
			toast.error("Voice dictation is not supported in this browser.");
			return;
		}

		const recognition = new SpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = "en-US";

		recognition.onresult = (event) => {
			if (!editor) return;

			let transcript = "";
			for (let i = 0; i < event.results.length; i++) {
				transcript += event.results[i][0].transcript;
			}

			// Save the raw text for the LLM cleanup later
			rawTranscriptRef.current = transcript;

			// Live insert into Tiptap
			if (startPosRef.current !== null) {
				// Select everything we've injected so far and overwrite it with the latest interim text
				editor
					.chain()
					.focus()
					.setTextSelection({
						from: startPosRef.current,
						to: editor.state.selection.to,
					})
					.insertContent(transcript)
					.run();
			}
		};

		recognition.onerror = (event) => {
			console.error("Speech recognition error:", event.error);
			if (event.error !== "no-speech") {
				toast.error(`Mic error: ${event.error}`);
				setState("idle");
			}
		};

		recognitionRef.current = recognition;

		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.stop();
			}
		};
	}, [editor]);

	const startRecording = useCallback(() => {
		if (!recognitionRef.current || !editor) return;

		try {
			// Save the exact cursor position where the dictation starts
			const { state: editorState } = editor;
			startPosRef.current = editorState.selection
				? editorState.selection.to
				: editorState.doc.content.size;

			rawTranscriptRef.current = "";
			recognitionRef.current.start();
			setState("recording");
		} catch (err) {
			console.error(err);
			setState("idle");
		}
	}, [editor]);

	const stopRecording = useCallback(async () => {
		if (!recognitionRef.current) return;

		recognitionRef.current.stop();
		setState("processing");

		const finalRawText = rawTranscriptRef.current;

		if (!finalRawText || finalRawText.trim().length === 0) {
			toast.error("No speech detected.");
			setState("idle");
			return;
		}

		await sendToEdgeFunction(finalRawText);
	}, []);

	// ── Send raw text to Supabase Edge Function for Llama 3.3 cleanup ────
	const sendToEdgeFunction = async (rawText) => {
		try {
			const userApiKey = localStorage.getItem("lexis_groq_api_key");
			if (!userApiKey) {
				toast.error("Please add your Groq API Key in Control Settings first.");
				setState("idle");
				return;
			}

			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				toast.error("You must be logged in to use voice dictation.");
				setState("idle");
				return;
			}

			const { data, error } = await supabase.functions.invoke(
				"voice-to-article",
				{
					body: { raw_text: rawText, user_api_key: userApiKey },
				}
			);

			if (error) {
				console.error("Edge function error:", error);
				toast.error("AI cleanup failed. Keeping raw text.");
				setState("idle");
				return;
			}

			const cleaned_text = data?.cleaned_text;

			if (cleaned_text) {
				// Replace the raw live text with the perfectly formatted LLM text
				if (startPosRef.current !== null && editor) {
					editor
						.chain()
						.focus()
						.setTextSelection({
							from: startPosRef.current,
							to: editor.state.selection.to,
						})
						.insertContent(cleaned_text)
						.run();
				}
				toast.success("Voice transcribed and cleaned!");
			}
		} catch (err) {
			console.error("Voice fetch error:", err);
			toast.error("Voice cleanup failed.");
		} finally {
			setState("idle");
			startPosRef.current = null;
		}
	};

	const handleClick = () => {
		if (state === "idle") startRecording();
		if (state === "recording") stopRecording();
	};

	return (
		<div className="relative flex items-center">
			<button
				type="button"
				onClick={handleClick}
				disabled={state === "processing"}
				title={
					state === "idle"
						? "Voice to article"
						: state === "recording"
						? "Stop recording"
						: "Cleaning up text..."
				}
				className={`
					relative px-3 py-1 rounded-xl transition-all duration-300
					${
						state === "idle"
							? "bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
							: state === "recording"
							? "bg-red-500/15 dark:bg-red-500/20 text-red-600 dark:text-red-400 ring-2 ring-red-500/50"
							: "bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 cursor-wait"
					}
				`}
			>
				<div className="flex items-center gap-1.5">
					{state === "idle" && <Mic size={16} />}
					{state === "recording" && (
						<Mic size={16} className="animate-pulse" />
					)}
					{state === "processing" && (
						<Loader2 size={16} className="animate-spin" />
					)}
					<span className="text-xs font-medium hidden sm:inline">
						{state === "idle" && "Voice"}
						{state === "recording" && "Stop"}
						{state === "processing" && "Cleaning..."}
					</span>
				</div>

				{state === "recording" && (
					<span className="absolute inset-0 rounded-xl animate-ping bg-red-500/20 pointer-events-none" />
				)}
			</button>
		</div>
	);
};

export default VoiceButton;
