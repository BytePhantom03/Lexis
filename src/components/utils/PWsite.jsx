import React from "react";
import CSStailwind from "./CSStailwind";

function PWsite() {
  return (
    <div className="bg-slate-900 min-h-screen">
      {/* //nav starts */}
      <nav className="bg-slate-200 flex justify-between px-4 items-center">
        <div className="text-2xl text-indigo-800 font-bold ">PW skills</div>
        <ul className="sm:flex font-semibold hidden [&>li]:mx-2.5 ">
          <li>Home</li>
          <li>About Us</li>
          <li>Contact Us</li>
        </ul>
        <div className="p-2 bg-blue-500 my-1 rounded hidden sm:block">
          Login/Signup
        </div>
        <div className="sm:hidden">
          <a href="" className="font-bold text-3xl">
            &#8801;
          </a>
        </div>
      </nav>

      {/* //nav ended */}
      {/* Hero section start */}

      <div>
        <div>
          <img
            className="w-full h-auto hidden sm:block"
            src="https://images.pexels.com/photos/51055/pexels-photo-51055.jpeg"
            alt=""
          />
        </div>
        <div>
          <img
            className="w-full h-auto hidden sm:block"
            src="https://images.pexels.com/photos/1275929/pexels-photo-1275929.jpeg"
            alt=""
          />
        </div>
      </div>

         {/* Hero section ends */}

         <div>
            
         </div>
    </div>
  );
}

export default PWsite;
