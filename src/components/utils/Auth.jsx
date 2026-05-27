import React, { useRef, useState } from "react";

function Auth() {
  let dataRef = useRef();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  let sendData = () => {
    event.preventDefault();
   console.log(email)
   console.log(password)
  };
  return (
    <div>
      <form
        action="."
        className="bg-slate-800 text-white border w-fit p-2 [&>input]:p-4 [&>input]:border [&>input]:m-2 [&>input]:rounded rounded "
        ref={dataRef}
        onSubmit={sendData}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          placeholder="email"
        />{" "}
        <br />
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          placeholder="paassword"
        />{" "}
        <br />
        <input type="submit" value="submit" className="bg-black text-white" />
      </form>
    </div>
  );
}

export default Auth;
