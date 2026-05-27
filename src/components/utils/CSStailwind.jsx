import React from "react";

function CSStailwind() {
  return (
    <div className="w-full h-full bg-yellow-400 flex justify-center flex-col items-center ">
      <h1 className="text-red-500 font-bold font-sans text-3xll bg-s">
        I am Ravi 😃👍
      </h1>
      <h1 className="text-green-500 font-bold font-sans text-3xl translate-x-12 -translate-y-1/2 hover:rotate-z-16">
        I am coder 😃👍
      </h1>

      <div className="container bg-blue-900 hover:bg-green-600 ">Buy Now</div>

      <div className="text-center my-2 sm:text-red-500">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio quaerat
          repudiandae repellat deserunt iure culpa fuga dolorum. Sequi doloribus
          est accusamus deleniti explicabo tenetur, vero et adipisci, facere
          ullam veniam.
        </p>
      </div>

      <div className="m-4 mt-3">
        <div className="max-w-sm mx-auto bg-white rounded-xl overflow-hidden md:max-w-2xl">
          <div className="md:flex">
            <div><img className="h-48 w-full sm:w-200" src="https://images.pexels.com/photos/34772119/pexels-photo-34772119.jpeg" alt="" /></div>
            <div className="p-4 lowercase text-sm font-semibold font">Lovely picture of <span className="bg
            bg-green-500 scroll-pe-0.5">father and son</span>.🥰
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aliquid deserunt laborum cum voluptates dolore at omnis eaque, rerum esse harum reprehenderit vel? Voluptate quaerat facere sequi quasi iusto, totam eligendi.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CSStailwind;
