import React, { useState } from "react";
import logo from "../images/logo.png";
import { Link, useNavigate } from "react-router-dom";
import image from "../images/login-signup.jpg";
import { api_base_url } from "../helper";

const Login = () => {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const submitForm = (e) => {
    e.preventDefault();
    setLoading(true);

    if (email && pwd) {
      fetch(api_base_url + "/login", {
        mode: "cors",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: pwd,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success === true) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("isLoggedIn", true);
            localStorage.setItem("userId", data.userId);
            setLoading(false);
            setTimeout(() => {
              window.location.href = "/";
            }, 200);
          } else {
            setLoading(false);
            setError(data.message);
          }
        });
    } else {
      setLoading(false);
      setError("All fields are required");
    }
  };

  return (
    <>
      {/* <div className="container w-screen min-h-screen flex items-center justify-between pl-[100px]">
        <div className="left w-[35%]">
          <h1 className="text-[25px] cursor-pointer font-bold">
            Write<span className="text-[#2764c0]">Code</span>
          </h1>
          <form onSubmit={submitForm} className="w-full mt-[60px]" action="">
            <div className="inputBox">
              <input
                required
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                value={email}
                type="email"
                placeholder="Email"
              />
            </div>

            <div className="inputBox">
              <input
                required
                onChange={(e) => {
                  setPwd(e.target.value);
                }}
                value={pwd}
                type="password"
                placeholder="Password"
              />
            </div>

            <p className="text-[gray]">
              Don't have an account{" "}
              <Link to="/signUp" className="text-[#00AEEF]">
                Sign Up
              </Link>
            </p>

            <p className="text-red-500 text-[14px] my-2">{error}</p>

            <button className="btnBlue w-full mt-[20px]">Login</button>
          </form>
        </div>
        <div className="right w-[55%]">
          <img className="h-[100vh] w-[100%] object-cover" src={image} alt="" />
        </div>
      </div> */}

      <div className="w-screen min-h-screen flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-[70%]">
            <h1 className="text-[25px] cursor-pointer font-bold">
              Write<span className="text-[#2764c0]">Code</span>
            </h1>
            <form onSubmit={submitForm} className="w-full mt-[60px]" action="">
              <div className="inputBox">
                <input
                  required
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  value={email}
                  type="email"
                  placeholder="Email"
                />
              </div>

              <div className="inputBox">
                <input
                  required
                  onChange={(e) => {
                    setPwd(e.target.value);
                  }}
                  value={pwd}
                  type="password"
                  placeholder="Password"
                />
              </div>

              <button className="btnBlue w-full mt-[20px]">{loading ? "Loading..." : "Login"}</button>
            </form>
            <p className="text-[gray] mt-3">
              Don't have an account?
              <Link to="/signUp" className="text-[#00AEEF]">
                Sign Up
              </Link>
            </p>

            <p className="text-red-500 text-[14px] my-2">{error}</p>
          </div>
        </div>
        <div className="flex-1 hidden md:block">
          <img className="h-[100vh] w-[100%] object-cover" src={image} alt="" />
        </div>
      </div>
    </>
  );
};

export default Login;
