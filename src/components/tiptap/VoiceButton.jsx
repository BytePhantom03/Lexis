import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Mic, Loader2, Sparkles, Check, X } from "lucide-react";
import { toast } from "sonner";
import supabase from "../../config/supabaseClient";

/**
 * VoiceButton — Real-time Web Speech API + Llama 3.3 cleanup + Review UI
 *
 * States: idle → recording → processing → idle (with Review UI portal if processing succeeds)
 */
const VoiceButton = ({ editor }) => {
	const [state, setState] = useState("idle");
	
	// Review UI States
	const [showDiff, setShowDiff] = useState(false);
	const [cleanedText, setCleanedText] = useState("");
	const [coords, setCoords] = useState(null);

	const recognitionRef = useRef(null);
	const startPosRef = useRef(null);
	const rawTranscriptRef = useRef("");
	const silenceTimeoutRef = useRef(null);
	
	// Helper to clear the silence timeout
	const clearSilenceTimeout = () => {
		if (silenceTimeoutRef.current) {
			clearTimeout(silenceTimeoutRef.current);
			silenceTimeoutRef.current = null;
		}
	};

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

			// Reset silence timeout because speech was detected
			clearSilenceTimeout();
			silenceTimeoutRef.current = setTimeout(() => {
				if (recognitionRef.current) recognitionRef.current.stop();
				stopRecording();
			}, 5000);
		};

		recognition.onerror = (event) => {
			console.error("Speech recognition error:", event.error);
			if (event.error !== "no-speech") {
				toast.error(`Mic error: ${event.error}`);
				setState("idle");
			}
			clearSilenceTimeout();
		};

		recognitionRef.current = recognition;

		return () => {
			clearSilenceTimeout();
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

			// Start the 5-second silence timeout
			clearSilenceTimeout();
			silenceTimeoutRef.current = setTimeout(() => stopRecording(), 5000);
		} catch (err) {
			console.error(err);
			setState("idle");
		}
	}, [editor]); // stopRecording is omitted here to avoid circular dependencies, it is used safely inside setTimeout.

	const stopRecording = useCallback(async () => {
		if (!recognitionRef.current) return;
		
		clearSilenceTimeout();
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

			const cleanResult = data?.cleaned_text;

			if (cleanResult) {
				// Calculate position for the popup
				if (editor && editor.view) {
					const domCoords = editor.view.coordsAtPos(editor.state.selection.to);
					setCoords(domCoords);
				}
				
				// Open the Review UI instead of auto-inserting
				setCleanedText(cleanResult);
				setShowDiff(true);
			}
		} catch (err) {
			console.error("Voice fetch error:", err);
			toast.error("Voice cleanup failed.");
		} finally {
			setState("idle");
		}
	};

	// ── Review Handlers ──────────────────────────────────────────────────
	const handleAccept = () => {
		if (startPosRef.current !== null && editor) {
			editor
				.chain()
				.focus()
				.setTextSelection({
					from: startPosRef.current,
					to: editor.state.selection.to,
				})
				.insertContent(cleanedText)
				.run();
		}
		toast.success("Voice transcribed and cleaned!");
		closeReview();
	};

	const handleDiscard = () => {
		// Do nothing to the editor — keep the raw text exactly as it was typed out
		toast.info("Kept original dictation.");
		closeReview();
	};

	const closeReview = () => {
		setShowDiff(false);
		setCleanedText("");
		startPosRef.current = null;
		rawTranscriptRef.current = "";
	};

	const handleClick = () => {
		if (state === "idle") startRecording();
		if (state === "recording") stopRecording();
	};

	// ── Render ───────────────────────────────────────────────────────────
	const overlayStyle = coords?.width 
		? { top: `${coords.top - 10}px`, left: `${coords.left - 10}px`, width: `${coords.width + 20}px` } 
		: { top: `${(coords?.bottom || 0) + 8}px`, left: `${coords?.left || 0}px` };

	return (
		<>
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

			{/* Review UI Portal */}
			{showDiff && cleanedText && createPortal(
				<div
					className="fixed z-[9999] bg-[#1a1b23] border border-[#2d2e3d] rounded-2xl shadow-2xl overflow-hidden animate-scale-in max-w-2xl"
					style={overlayStyle}
					onMouseDown={(e) => e.stopPropagation()}
					onClick={(e) => e.stopPropagation()}
				>
					<div className="flex items-center gap-2 px-4 py-3 border-b border-[#2d2e3d] bg-[#15151c]">
						<Sparkles size={16} className="text-[#9d7cf7]" />
						<span className="text-xs font-semibold text-gray-300 tracking-wider">
							VOICE DICTATION — Review Grammar Check
						</span>
					</div>

					<div className="flex flex-col sm:flex-row gap-3 p-3">
						{/* Dimmed original with strikethrough */}
						<div className="flex-1 rounded-xl bg-[#1a1b23] p-4 border border-[#2d2e3d]/50 opacity-60 overflow-y-auto max-h-[300px]">
							<p className="text-sm text-[#7a7a8f] line-through leading-relaxed">
								{rawTranscriptRef.current}
							</p>
						</div>

						{/* Highlighted new version */}
						<div className="flex-1 rounded-xl bg-[#28243d] p-4 border border-[#483d8b] shadow-inner overflow-y-auto max-h-[300px]">
							<p className="text-sm text-[#e2d9ff] leading-relaxed">
								{cleanedText}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2 p-3 border-t border-[#2d2e3d] bg-[#15151c]">
						<button
							type="button"
							onClick={handleAccept}
							className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-white bg-[#6b4cde] hover:bg-[#7a5ce0] rounded-xl transition-colors cursor-pointer"
						>
							<Check size={16} />
							Accept
						</button>
						<button
							type="button"
							onClick={handleDiscard}
							className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-300 bg-[#2d2e3d] hover:bg-[#3d3e52] rounded-xl transition-colors cursor-pointer"
						>
							<X size={16} />
							Keep Original
						</button>
					</div>
				</div>,
				document.body
			)}
		</>
	);
};

export default VoiceButton;
