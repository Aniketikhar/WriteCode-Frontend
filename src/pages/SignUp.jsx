import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import image from "../images/login-signup.jpg";
import api from "../api";
import toast from "react-hot-toast";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!username || !name || !email || !pwd) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/auth/signup", {
        username,
        name,
        email,
        password: pwd,
      });
      const data = await res.json();

      if (data.success) {
        setLoading(false);
        toast.success("Account created! Please login.");
        navigate("/login");
      } else {
        setLoading(false);
        setError(data.message);
      }
    } catch (err) {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  };

  return (
    <>
      <div className="w-screen min-h-screen flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-[85%] sm:w-[70%]">
            <h1 className="text-[25px] cursor-pointer font-bold">
              Write<span className="text-[#2764c0]">Code</span>
            </h1>
            <form onSubmit={submitForm} className="w-full mt-[60px]" action="">
              <div className="inputBox">
                <input
                  required
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                  value={username}
                  type="text"
                  placeholder="Username"
                />
              </div>

              <div className="inputBox">
                <input
                  required
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  value={name}
                  type="text"
                  placeholder="Name"
                />
              </div>

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

              <button className="btnBlue w-full mt-[20px]">{loading ? "Loading..." : "Sign Up"}</button>
            </form>
            <p className="text-[gray] mt-3">
              Already have an account?
              <Link to="/login" className="text-[#00AEEF]">
                login
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

export default SignUp;
