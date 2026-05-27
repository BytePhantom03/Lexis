import { Cross, Notebook, NotepadTextIcon, X } from "lucide-react";
import React, { useContext, useEffect, useRef } from "react";
import { dataContext, userContext } from "../../context/Context";
import supabase from "../../config/supabaseClient";

function FieldInput({ showPopUp, setShowPopUp }) {
	const [articlesData, setArticlesData] = useContext(dataContext);
	const [userInfo, setUserInfo] = useContext(userContext);

	const titleRef = useRef();
	const bodyRef = useRef();

	function reset() {
		titleRef.current.value = "";
		bodyRef.current.value = "";
	}

	function handleSubmit() {
		event.preventDefault();
		let title = titleRef.current.value;
		let body = bodyRef.current.value;

		let newArticle = {
			UserTable: {
				name: userInfo.name,
				username: userInfo.username,
				profile_img: userInfo.profile_img,
			},
			body: body,
			id: crypto.randomUUID(),
			title: title,
		};

		if (body && title) {
			setArticlesData((p) => [...p, newArticle]);
			async function postArticle() {
				const res = await supabase
					.from("ArticleTable")
					.insert({
						body: body,
						author_id: userInfo.user_id,
						title: title,
					})
					.select();
				if (res.error) console.log(res.error);
			}

			postArticle();
			setShowPopUp((p) => !p);
		}
	}
	return (
		<div
			hidden={!showPopUp}
			className="bg-gray-200 dark:bg-[#1c1c1f] md:max-w-[60vw] md:mx-auto animate-[popup_30s_ease-in_1] backdrop-blur-2xl rounded-2xl fixed top-0 z-4 left-0 right-0    m-10 bottom-0 h-100">
			<form className="p-8 " onReset={reset} onSubmit={handleSubmit}>
				<X
					onClick={() => {
						setShowPopUp((p) => !p);
						reset();
					}}
					className="absolute bg-red-200  dark:bg-[#1c1c1f] rounded-full p-1 right-1 top-1 hover:text-red-600 cursor-pointer"
				/>
				<fieldset className=" py-2 px-4  dark:bg-[#1c1c1f] rounded pb-2 border border-gray-300">
					<legend className="text-lg font-[verdana] px-2"> Your Article</legend>
					<label className="">
						Enter the title
						<br />
						<input
							ref={titleRef}
							placeholder="Write here.."
							className="p-2 rounded border border-gray-600 min-w-1/2"
						/>
					</label>
					<br />
					<label>
						Enter the title
						<br />
						<textarea
							ref={bodyRef}
							placeholder="Write here.."
							className="p-2 rounded border border-gray-600 min-w-1/2"
						/>
					</label>
					<br />
					<button
						type="submit"
						className="bg-black mt-3 px-4 py-1 rounded-xl  dark:bg-[#1c1c1f] text-white cursor-pointer active:bg-gray-700">
						Publish
					</button>
					<button
						type="reset"
						onClick={reset}
						className="bg-black mt-3 mx-2 px-4 py-1 rounded-xl text-white cursor-pointer active:bg-gray-700">
						Reset
					</button>
				</fieldset>
			</form>
		</div>
	);
}

export default FieldInput;
