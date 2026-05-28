import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useState } from "react";
import { ImageUploader } from "./ui/ImageUploader";
import Image from "@tiptap/extension-image";
import AICopilotExtension from "./tiptap/AICopilotExtension";
import AIPalette from "./tiptap/AIPalette";

const Tiptap = ({ setHtml }) => {
	// AI Copilot state
	const [aiPaletteOpen, setAiPaletteOpen] = useState(false);
	const [aiCoords, setAiCoords] = useState(null);
	const [aiParagraphText, setAiParagraphText] = useState("");
	const [aiContextWindow, setAiContextWindow] = useState("");
	const [aiInsertPos, setAiInsertPos] = useState(0);

	const editor = useEditor({
		extensions: [
			StarterKit,
			Image,
			AICopilotExtension.configure({
				onActivate: ({ coords, paragraphText, contextWindow, from }) => {
					setAiCoords(coords);
					setAiParagraphText(paragraphText);
					setAiContextWindow(contextWindow);
					setAiInsertPos(from);
					setAiPaletteOpen(true);
				},
				onDeactivate: () => {
					setAiPaletteOpen(false);
				},
			}),
		],
		content: "",
		editorProps: {
			attributes: {
				class: "*:img:rounded-full prose max-w-none p-4 focus:outline-none min-h-full",
			},
		},
		onUpdate({ editor }) {
			setHtml(editor.getHTML());
		},
	});

	useEffect(() => {
		return () => {
			editor?.destroy();
		};
	}, [editor]);

	const addImage = useCallback(
		(urlString) => {
			if (urlString) {
				editor.chain().focus().setImage({ src: urlString }).run();
			}
		},
		[editor]
	);

	if (!editor) {
		return null;
	}

	return (
		<div className="flex flex-col h-full relative">
			<div className="flex-1 tiptapEditor overflow-y-auto">
				<EditorContent editor={editor} />
			</div>

			{/* AI Copilot Palette */}
			<AIPalette
				isOpen={aiPaletteOpen}
				coords={aiCoords}
				paragraphText={aiParagraphText}
				contextWindow={aiContextWindow}
				editor={editor}
				insertPos={aiInsertPos}
				onClose={() => setAiPaletteOpen(false)}
			/>

			<div className="sticky mx-4 bottom-0 bg-white rounded-4xl my-2 shadow-md sm:w-fit sm:ml-1 dark:bg-[#010101] border-t p-3 flex flex-wrap gap-2 items-center">
				<div className="flex items-center">
					<ImageUploader addImage={addImage} />
				</div>

				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBold().run()}
					className="px-3 py-1 rounded-xl bg-gray-200 dark:bg-gray-900">
					Bold
				</button>

				<button
					type="button"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className="px-3 py-1 rounded-xl bg-gray-200 dark:bg-gray-900">
					Italic
				</button>

				<button
					type="button"
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 1 }).run()
					}
					className="px-3 py-1 rounded-xl bg-gray-200 dark:bg-gray-900">
					H1
				</button>

				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className="px-3 py-1 rounded-xl bg-gray-200 dark:bg-gray-900">
					• List
				</button>

				<button
					type="button"
					onClick={() => editor.chain().focus().undo().run()}
					className="px-3 py-1 rounded-xl bg-gray-200 dark:bg-gray-900">
					↩ Undo
				</button>

				<button
					type="button"
					onClick={() => editor.chain().focus().redo().run()}
					className="px-3 py-1 rounded-xl bg-gray-200 dark:bg-gray-900">
					↪ Redo
				</button>

				{/* AI Copilot hint */}
				<div className="hidden sm:flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-300 dark:border-gray-700">
					<span className="text-[10px] text-gray-400 font-medium tracking-wide">
						Type <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono text-[10px]">/ai</kbd> for AI assist
					</span>
				</div>
			</div>
		</div>
	);
};

export default Tiptap;
