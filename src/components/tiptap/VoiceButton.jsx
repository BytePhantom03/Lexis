import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Loader2 } from "lucide-react";
import { toast } from "sonner";
import supabase from "../../config/supabaseClient";

/**
 * VoiceButton — Tiptap toolbar button for voice-to-article dictation.
 *
 * States: idle → recording → processing → idle
 *
 * Flow:
 *   1. User taps mic → browser requests mic permission → MediaRecorder starts
 *   2. User taps again → recording stops → audio blob sent to edge function
 *   3. Edge function runs Whisper (transcription) + Llama (cleanup)
 *   4. Cleaned text inserted into Tiptap at cursor position
 */
const VoiceButton = ({ editor }) => {
	const [state, setState] = useState("idle"); // idle | recording | processing
	const recorderRef = useRef(null);
	const streamRef = useRef(null);
	const chunksRef = useRef([]);
	const canvasRef = useRef(null);
	const analyserRef = useRef(null);
	const animFrameRef = useRef(null);

	// Clean up on unmount — release mic if still active
	useEffect(() => {
		return () => {
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((t) => t.stop());
			}
			if (animFrameRef.current) {
				cancelAnimationFrame(animFrameRef.current);
			}
		};
	}, []);

	// ── Waveform visualiser ──────────────────────────────────────────────
	const drawWaveform = useCallback(() => {
		const canvas = canvasRef.current;
		const analyser = analyserRef.current;
		if (!canvas || !analyser) return;

		const ctx = canvas.getContext("2d");
		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);

		const draw = () => {
			animFrameRef.current = requestAnimationFrame(draw);
			analyser.getByteFrequencyData(dataArray);

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const barCount = 16;
			const barWidth = canvas.width / barCount - 1;
			const step = Math.floor(bufferLength / barCount);

			for (let i = 0; i < barCount; i++) {
				const value = dataArray[i * step];
				const barHeight = (value / 255) * canvas.height * 0.85;
				const x = i * (barWidth + 1);
				const y = canvas.height - barHeight;

				// Gradient from indigo → purple
				const gradient = ctx.createLinearGradient(x, y, x, canvas.height);
				gradient.addColorStop(0, "#818cf8");
				gradient.addColorStop(1, "#a78bfa");
				ctx.fillStyle = gradient;

				ctx.beginPath();
				ctx.roundRect(x, y, barWidth, barHeight, 1);
				ctx.fill();
			}
		};

		draw();
	}, []);

	// ── Start recording ──────────────────────────────────────────────────
	const startRecording = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;

			// Set up analyser for waveform
			const audioCtx = new AudioContext();
			const source = audioCtx.createMediaStreamSource(stream);
			const analyser = audioCtx.createAnalyser();
			analyser.fftSize = 256;
			source.connect(analyser);
			analyserRef.current = analyser;

			// Determine best mimeType
			const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
				? "audio/webm;codecs=opus"
				: "audio/webm";

			const recorder = new MediaRecorder(stream, { mimeType });
			chunksRef.current = [];

			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) chunksRef.current.push(e.data);
			};

			recorder.onstop = async () => {
				// Package chunks into a single blob
				const audioBlob = new Blob(chunksRef.current, { type: mimeType });

				// Release mic immediately
				stream.getTracks().forEach((t) => t.stop());
				streamRef.current = null;

				// Stop waveform animation
				if (animFrameRef.current) {
					cancelAnimationFrame(animFrameRef.current);
					animFrameRef.current = null;
				}

				// Check size — reject over 10MB
				if (audioBlob.size > 10 * 1024 * 1024) {
					toast.error("Recording too long. Keep it under 5 minutes.");
					setState("idle");
					return;
				}

				setState("processing");
				await sendToEdgeFunction(audioBlob);
			};

			recorder.start(250); // chunks every 250ms
			recorderRef.current = recorder;
			setState("recording");

			// Start waveform drawing
			drawWaveform();
		} catch (err) {
			console.error("Mic access error:", err);
			if (err.name === "NotAllowedError") {
				toast.error("Microphone permission denied. Please allow mic access.");
			} else {
				toast.error("Could not access microphone.");
			}
			setState("idle");
		}
	}, [drawWaveform]);

	// ── Stop recording ───────────────────────────────────────────────────
	const stopRecording = useCallback(() => {
		if (recorderRef.current && recorderRef.current.state === "recording") {
			recorderRef.current.stop();
		}
	}, []);

	// ── Convert blob to base64 ───────────────────────────────────────────
	const blobToBase64 = (blob) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				// Remove the data URL prefix (e.g., "data:audio/webm;base64,")
				const base64 = reader.result.split(",")[1];
				resolve(base64);
			};
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	};

	// ── Send audio to Supabase Edge Function ─────────────────────────────
	const sendToEdgeFunction = async (audioBlob) => {
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				toast.error("You must be logged in to use voice dictation.");
				setState("idle");
				return;
			}

			// Convert blob to base64 and send as JSON — avoids CORS preflight
			const audioBase64 = await blobToBase64(audioBlob);

			const { data, error } = await supabase.functions.invoke(
				"voice-to-article",
				{
					body: {
						audio_base64: audioBase64,
						mime_type: audioBlob.type || "audio/webm",
					},
				}
			);

			if (error) {
				console.error("Edge function error:", error);
				toast.error("Voice transcription failed. Try again.");
				setState("idle");
				return;
			}

			const cleaned_text = data?.cleaned_text;

			if (!cleaned_text) {
				toast.error("No speech detected. Try speaking louder.");
				setState("idle");
				return;
			}

			insertIntoTiptap(cleaned_text);
			toast.success("Voice inserted successfully!");
		} catch (err) {
			console.error("Voice fetch error:", err);
			toast.error("Voice failed, try again.");
		} finally {
			setState("idle");
		}
	};

	// ── Insert cleaned text into Tiptap at cursor ────────────────────────
	const insertIntoTiptap = (cleanedText) => {
		if (!editor) {
			console.error("Voice: editor instance not available");
			return;
		}

		if (!cleanedText) {
			console.error("Voice: invalid cleaned_text", cleanedText);
			return;
		}

		console.log("Voice: inserting text into editor:", cleanedText);

		// Tiptap natively handles plain text with newlines by creating paragraphs.
		// We insert it directly. If the editor lost focus, we insert at the end.
		const { state } = editor;
		const position = state.selection ? state.selection.to : state.doc.content.size;

		editor
			.chain()
			.focus()
			.insertContentAt(position, cleanedText)
			.run();
	};

	// ── Click handler ────────────────────────────────────────────────────
	const handleClick = () => {
		if (state === "idle") {
			setState("initializing");
			startRecording();
		}
		if (state === "recording") stopRecording();
		// processing / initializing states = button disabled, no action
	};

	return (
		<div className="relative flex items-center">
			<button
				type="button"
				onClick={handleClick}
				disabled={state === "processing" || state === "initializing"}
				title={
					state === "idle"
						? "Voice to article"
						: state === "recording"
						? "Stop recording"
						: state === "initializing"
						? "Starting microphone..."
						: "Processing..."
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
					{(state === "processing" || state === "initializing") && (
						<Loader2 size={16} className="animate-spin" />
					)}
					<span className="text-xs font-medium hidden sm:inline">
						{state === "idle" && "Voice"}
						{state === "recording" && "Stop"}
						{state === "initializing" && "Starting"}
						{state === "processing" && "Processing"}
					</span>
				</div>

				{/* Pulsing ring animation when recording */}
				{state === "recording" && (
					<span className="absolute inset-0 rounded-xl animate-ping bg-red-500/20 pointer-events-none" />
				)}
			</button>

			{/* Waveform canvas — only visible while recording */}
			{state === "recording" && (
				<canvas
					ref={canvasRef}
					width={80}
					height={28}
					className="ml-2 rounded-md"
				/>
			)}
		</div>
	);
};

export default VoiceButton;
