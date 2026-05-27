import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import {
	ChevronLeft,
	ChevronRight,
	Ellipsis,
	GeorgianLari,
	LoaderCircle,
	LogOut,
	MoveRight,
	Paintbrush,
	PencilIcon,
	Settings,
	User,
	Wallpaper,
} from "lucide-react";
import supabase from "../config/supabaseClient";
import { dataContext, userContext } from "../context/Context";
import userDp from "../assets/user.png";
import { cover_placeholder } from "../../public/resource";

// Components
import ImageUpdater from "./ImageUpdater";
import ProfileImageUpdater from "./ProfileEditor";
import UserProfilePosts from "./UserProfilePosts";
import ProfileFooter from "./ProfileFooter";
import { AlertDialogBasic } from "./ui/AlertDialogBasic";
import { toast } from "sonner";
import ShareProfile from "./ShareProfile";
import { SignDialogue } from "./SignDialogue";
import { UserNamePop } from "./UserNamePop";

import { ReaderMenu } from "./ReaderMenu";
import { EditProfileDetails } from "./EditProfileDetails";

function Profile() {
	// 1. Context and Params
	const { username: urlUsername } = useParams();
	const navigate = useNavigate();
	const [currentUser] = useContext(userContext);
	const [, , , , myFollowing] = useContext(dataContext);
	// 2. Local State
	const [profileData, setProfileData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [failed, setFailed] = useState(false);
	const [isFollow, setFollow] = useState(null);
	const [ImgEditor, setImgEditor] = useState(false);
	const [popup, SetPopup] = useState(false);
	// UI States (Synced with profileData)
	const [cover, setCover] = useState(cover_placeholder);
	const [profileImg, setProfileImg] = useState(userDp);

	const [control, setControl] = useState(false);
	const [follower, setFollower] = useState(0);
	const [following, setFollowing] = useState(0);
	const [showFollow, setShowFollow] = useState(false);
	// 3. Logic: Decide which data to load
	//check for viewing other profile
	let isMyProfile = useRef(true);
	const [info] = useContext(userContext);

	const usernameRef = useRef();
	const nameRef = useRef();
	const aboutRef = useRef();

	const [username, setUsername] = useState();
	const [name, setName] = useState();
	const [about, setAbout] = useState();

	//follow - unfollow function
	async function handleFollow(e) {
		e.stopPropagation();
		setFollow(true);
		setFollower((p) => p + 1);
		const { error: followError } = await supabase.from("FollowTable").insert({
			follower_id: currentUser?.user_id,
			following_id: profileData?.user_id,
		});

		if (followError) {
			setFollow(false);
			toast("Something went wrong.");
			setFollower((p) => p - 1);
			return;
		}
	}
	async function handleUnfollow(e) {
		e.stopPropagation();
		setFollow(false);
		setFollower((p) => p - 1);
		const { error: unfollowError } = await supabase
			.from("FollowTable")
			.delete()
			.eq("follower_id", currentUser?.user_id)
			.eq("following_id", profileData?.user_id);

		if (unfollowError) {
			setFollow(true);
			toast("Something went wrong.");
			setFollower((p) => p + 1);
			return;
		}
	}

	useEffect(() => {
		if (!currentUser && !urlUsername) {
			navigate("/login");
		}
		if (urlUsername) {
			isMyProfile.current = false;
		} else {
			toast("You are not logged In.");
			return;
		}

		async function fetchProfile() {
			setLoading(true);

			// Scenario A: Viewing someone else's profile (or own profile via URL)
			if (urlUsername) {
				const res = await supabase
					.from("UserTable")
					.select("*, ArticleTable(*)")
					.eq("username", urlUsername)
					.single();

				if (res.error) {
					setFailed(true);
				} else {
					setProfileData(res.data);
					document.title = res.data?.name ?? "Profile - Lexis";
					usernameRef.current = res.data?.username;
					nameRef.current = res.data?.name;
					aboutRef.current = res.data?.about ?? "I am a lexis user.";
					setFailed(false);
				}
			}
			// Scenario B: Viewing own profile page (no username in URL)
			else if (currentUser) {

				setProfileData(currentUser);
				setFailed(false);

				usernameRef.current = currentUser?.username;
				nameRef.current = currentUser?.name;
				aboutRef.current = currentUser?.about ?? "I am a lexis user.";
			}

			setUsername(usernameRef.current);
			setName(nameRef.current);
			setAbout(aboutRef.current);
			setLoading(false);
		}

		fetchProfile();
	}, [urlUsername, currentUser]);

	// 4. Update UI visuals when profileData changes
	useEffect(() => {
		function myFunction() {
			if (profileData) {
				setCover(profileData.cover_img || cover_placeholder);
				setProfileImg(profileData.profile_img || userDp);
			}
		}
		myFunction();
	}, [profileData]);

	// 5. Permission Check: Is this the logged-in user's own profile?
	const isOwnProfile = currentUser?.user_id === profileData?.user_id;
	useEffect(() => {
		if (!urlUsername) {
			navigate(`/profile/${currentUser?.username}`);
			return;
		}
	}, [isOwnProfile, navigate]);
	//check follow
	useEffect(() => {
		if (!isOwnProfile && !loading) {
			function fun() {
				setFollow(myFollowing.has(profileData?.user_id));

				setTimeout(() => {
					setShowFollow(true);
				}, 300);
			}

			fun();
		}
	}, [isOwnProfile, loading]);

	//load follower count
	useEffect(() => {
		if (!profileData) return;
		async function loadFollower() {
			const { count, error: followerError } = await supabase
				.from("FollowTable")
				.select("*", { count: "exact", head: true })
				.eq("following_id", profileData?.user_id);

			if (followerError) {
				toast("Error while loading follower count");

				return;
			}

			setFollower(count ?? 0);
		}

		loadFollower();
	}, [profileData]);

	//load following count
	useEffect(() => {
		if (!profileData) return;
		async function loadFollower() {
			const { count, error: followingError } = await supabase
				.from("FollowTable")
				.select("*", { count: "exact", head: true })
				.eq("follower_id", profileData?.user_id);

			if (followingError) {
				toast("Error while loading following count");

				return;
			}

			setFollowing(count ?? 0);
		}

		loadFollower();
	}, [profileData]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center dark:bg-black">
				<div className="flex items-center gap-2 text-gray-600">
					<LoaderCircle size={24} className="animate-spin" />
					<span>Loading profile...</span>
				</div>
			</div>
		);
	}
	if (failed || !profileData) {
		return (
			<div className="min-h-screen flex items-center justify-center dark:bg-black">
				<div className="bg-orange-100 p-4 rounded-xl border border-orange-200 text-orange-700">
					User not found or something went wrong.
				</div>
			</div>
		);
	}
	async function handleLogOut() {
		const res = await supabase.auth.signOut();
		if (res.error) {
			alert(`Can't LogOut.
        Error : ${res.error.message}`);
			return null;
		}

		localStorage.removeItem("theme");
		navigate("/login");
	}

	async function handleEditChanges() {
		event.preventDefault();

		setUsername(usernameRef.current.value);
		setName(nameRef.current.value);
		setAbout(aboutRef.current.value);
		let changes = {};

		if (profileData?.username != usernameRef.current.value) {
			changes["username"] = usernameRef.current.value;
		}

		if (profileData?.name != nameRef.current.value) {
			changes["name"] = nameRef.current.value;
		}

		if (profileData?.about != aboutRef.current.value) {
			changes["about"] = aboutRef.current.value;
		}

		if (Object.keys(changes).length === 0) return;
		if (Object.keys(changes).length > 0) {
			const { error } = await supabase
				.from("UserTable")
				.update(changes)
				.eq("user_id", profileData?.user_id)
				.select();

			if (error) {
				toast(error.message);
			} else {
				toast("Success. Changes made will reflect soon.");
			}
		}

		supabase.from("UserTable").update();
	}

	return (
		<div className="relative dark:text-gray-400 bg-[#fafafa] dark:bg-[#0a0a0b] pb-1 box-border w-full min-h-screen ">
			{/* Navigation & Edit Controls */}
			<div className="absolute w-full z-10 p-4">
				<div className="w-full flex justify-between items-center">
					<button
						onClick={() => navigate("/home", true)}
						className="p-2 rounded-full dark:bg-[#1c1c1f] bg-white shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
						<ChevronLeft />
					</button>
					{/* Only show Edit Pencil if it's the user's own profile */}
					<div
						onClick={() => {
							setControl((p) => !p);
						}}
						className={`p-2  relative text-foreground dark:bg-[#000000] bg-white flex justify-end rounded-full ${
							control && "bg-background text-foreground"
						}`}>
						{" "}
						<ReaderMenu
							child={
								<>
									<ul
										className=" z-50   w-fit min-w-[20vw] bg-inherit  sm:min-w-[10vw]  rounded-md   shadow-lg transition cursor-pointer p-1
                            *:hover:border
                            *:rounded-md
                            *:hover:bg-gray-600
							*:text-sm
                            ">
										{isOwnProfile && (
											<>
												<li>
													<EditProfileDetails
														title={"Edit profile"}
														trigger={
															<>
																<button
																	type="button"
																	className="p-1 px-4 whitespace-nowrap flex items-center   transition cursor-pointer  w-full ">
																	<User
																		size={14}
																		className="hover:-rotate-12 mx-1 mr-2"
																	/>{" "}
																	Edit Details
																</button>
															</>
														}
														child={
															<>
																<div
																	className="
															
															
															 *:w-full w-full *:my-2 
															
															">
																	<label className="*:border flex flex-col *:px-4 *:py-2 *:rounded-lg ">
																		Username
																		<input
																			type="text"
																			className=" lowercase text-gray-400"
																			placeholder="username"
																			defaultValue={username}
																			ref={usernameRef}
																		/>
																	</label>

																	<label className="*:border flex flex-col *:px-4 *:py-2 *:rounded-lg ">
																		Name
																		<input
																			className="text-gray-400"
																			type="text"
																			placeholder="username"
																			defaultValue={name}
																			ref={nameRef}
																		/>
																	</label>
																	<label className="*:border flex flex-col *:px-4 *:py-2 *:rounded-lg ">
																		About
																		<textarea
																			type="text"
																			className="text-gray-400 outline-1 focus:outline-blue-500"
																			placeholder="your bio"
																			defaultValue={about}
																			ref={aboutRef}
																		/>
																	</label>
																</div>
															</>
														}
														handleEditChanges={handleEditChanges}
													/>
												</li>
												<li>
													<button
														className="p-1 px-4 whitespace-nowrap flex items-center   transition cursor-pointer  w-full "
														onClick={() => SetPopup(true)}>
														<Paintbrush
															size={14}
															className="hover:-rotate-12 mx-1 mr-2"
														/>{" "}
														Change Banner
													</button>
												</li>

												<li>
													<div className="p-1 pl-4 whitespace-nowrap flex  transition cursor-pointer  w-full ">
														<AlertDialogBasic titleText={`Sign out`} />
													</div>
												</li>

												<li>
													<button
														className="p-1 px-4 whitespace-nowrap flex items-center   transition cursor-pointer "
														onClick={() => navigate("/control")}>
														<Settings
															size={14}
															className="hover:-rotate-12 mx-1 mr-2"
														/>{" "}
														Controls
													</button>
												</li>
											</>
										)}

										<li
											className={`${
												!isOwnProfile && "bg-background dark:bg-gray-700 py-1"
											}`}>
											<ShareProfile
												name={profileData.name}
												username={profileData.username}
											/>
										</li>
									</ul>
								</>
							}
						/>
					</div>
				</div>
			</div>

			{/* Cover Image */}
			<div className="w-full p-0 sm:p-0 sm:max-h-60 sm:h-52 flex   h-30">
				<img
					src={cover}
					alt="cover"
					className="min-w-full rounded-none   object-cover"
				/>
			</div>

			{/* Profile Info Section */}
			<div className="-mt-13 w-full md:w-1/2  px-4 flex flex-col justify-start  mx-auto  ">
				<div className="flex w-full items-center justify-between mx-2">
					<div className="relative group pl-4">
						<img
							src={profileImg}
							alt="profile"
							className="h-20 w-20 sm:w-25 sm:h-25 rounded-full shadow-2xs  object-cover"
						/>
						{/* Edit Profile Image Button (Only for owner) */}
						{isOwnProfile && (
							<button
								onClick={() => setImgEditor(true)}
								className="absolute bottom-1 right-1 p-1 sm:p-2 bg-white dark:bg-[#1c1c1f] rounded-full shadow-md border border-[#e8e8ec] dark:border-[#2a2a2e] transition-all duration-300 hover:scale-110 cursor-pointer">
								<PencilIcon size={14} />
							</button>
						)}
					</div>

					<SignDialogue
						child={
							<div>
								{!isOwnProfile && (
									<div
										onClick={
											info ? (isFollow ? handleUnfollow : handleFollow) : null
										}
										className={`
								${showFollow ? "" : "collapse"}
								border p-2 mt-16 rounded-full mx-2 px-4
								${!isFollow ? "bg-foreground text-background" : "bg-background text-foreground"}
							  hover:text-foreground  hover:bg-gray-500 transition-all duration-400  shadow-2xs cursor-pointer`}>
										{isFollow ? "Following" : "Follow"}
									</div>
								)}
							</div>
						}
						title={`Want to follow this author?`}
					/>
				</div>

				<div className="w-full ">
					<div className="flex pl-4 items-center mt-1 sm:mt-2 min-w-0">
						<h2 className="text-2xl max-w-[50%] truncate font-semibold text-gray-900 dark:text-gray-100">
							{name}
						</h2>
						<p className="text-sm ml-2 mt-2 text-gray-500 shrink-0">
							@{username}
						</p>
					</div>
				</div>
				{
					<div className="mt-1 pl-4 text-sm">
						<p className="text-gray-700 dark:text-gray-400 leading-relaxed max-w-sm">
							{about}
						</p>
					</div>
				}
				<div className=" pl-4  md:mt-4 text-xs  flex gap-8  mt-2  ">
					<NavLink
						to={info && `followers?id=${profileData?.user_id}`}
						className="flex flex-col justify-center items-center">
						<label className="text-sm" htmlFor="followers">
							Followers
						</label>
						<p className="font-semibold">{follower}</p>
					</NavLink>
					<NavLink
						to={info && `following?id=${profileData?.user_id}`}
						className="flex flex-col justify-center items-center">
						<label className="text-sm" htmlFor="following">
							Following
						</label>
						<p className="font-semibold">{following}</p>
					</NavLink>
				</div>
			</div>

			{/* Modals */}
			{popup && isOwnProfile && (
				<ImageUpdater
					setCover={setCover}
					SetPopup={SetPopup}
					cover={cover}
					user_id={profileData.user_id}
				/>
			)}

			{ImgEditor && isOwnProfile && (
				<ProfileImageUpdater
					profileImg={profileData?.profile_img}
					setProfileImg={setProfileImg}
					setImgEditor={setImgEditor}
					user_id={profileData?.user_id}
				/>
			)}

			{/* Posts Section */}
			<div className="mt-8  mb-40   sm:w-full sm:px-4 md:px-0 md:w-1/2 mx-auto border-t dark:border-gray-800">
				{profileData.ArticleTable && (
					<UserProfilePosts ArticleTable={profileData.ArticleTable} />
				)}
			</div>

			<div className="absolute bottom-0 right-0 w-full  ">
				<ProfileFooter />
			</div>

			<Outlet />
		</div>
	);
}

export default Profile;
