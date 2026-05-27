import React from "react";

function AddArticle() {
  return (
    <div className="">
      <div className="w-[80%]  z-50 md:w-[50%] my-8 mx-auto  rounded-sm shadow-2xs  px-8 py-3 border border-gray-300 ">
      <input type="text" placeholder="  Publish a new article.." className="w-full h-full outline-0 "/>
      </div>
    </div>
  );
}

export default AddArticle;
