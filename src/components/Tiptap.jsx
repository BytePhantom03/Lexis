import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect } from "react";
import { ImageUploader } from "./ui/ImageUploader";
import Image from "@tiptap/extension-image";


const Tiptap = ({ setHtml}) => {
	const editor = useEditor({
		extensions: [StarterKit,Image],
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

	
  const addImage = useCallback((urlString) => {
   

    if (urlString) {
      editor.chain().focus().setImage({ src: urlString }).run()
    }
  }, [editor])

  if (!editor) {
    return null
  }

	if (!editor) return null;

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 tiptapEditor overflow-y-auto">
				<EditorContent editor={editor} />
			</div>

			<div className="sticky mx-4 bottom-0 bg-white rounded-4xl my-2 shadow-md sm:w-fit sm:ml-1 dark:bg-[#010101] border-t p-3 flex flex-wrap gap-2">

               	<button
					type="button"
					onClick={(e) => {
						e.preventDefault();
						editor.chain().focus().redo().run()
					}}
					className="px-3 py-1 rounded-xl bg-gray-200 dark:bg-gray-900">
					<ImageUploader addImage={addImage} />
				</button>

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

			
			</div>
		</div>
	);
};

export default Tiptap;
