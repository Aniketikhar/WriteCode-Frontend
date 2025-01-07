import React, { useEffect, useState } from "react";
import logo from "../images/logo.png";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "react-avatar";
import { MdLightMode } from "react-icons/md";
import { BsGridFill } from "react-icons/bs";
import { api_base_url, toggleClass } from "../helper";
import { CgProfile } from "react-icons/cg";
import toonavatar from "cartoon-avatar";

const Navbar = ({ isGridLayout, setIsGridLayout }) => {
  const profile = toonavatar.generate_avatar();

  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(api_base_url + "/getUserDetails", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: localStorage.getItem("userId"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setData(data.user);
        } else {
          setError(data.message);
        }
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    window.location.reload();
  };

  return (
    <>
      <div className="navbar flex items-center justify-between px-4 sm:px-6 lg:px-[100px] h-[80px] bg-[#141414]">
        <div className="logo">
          <h1 className="text-[20px] sm:text-[25px] cursor-pointer font-bold">
            Write<span className="text-[#2764c0]">Code</span>
          </h1>
        </div>
        <div className="links flex items-center gap-2">
          <Link to={"https://port-folio-aniket-ikhar.vercel.app/"}>
            <span className="italic text-sm sm:text-base hover:text-[#2764c0] cursor-pointer">
              About
            </span>
          </Link>
          <span>|</span>
          <div
            onClick={() => {
              toggleClass(".dropDownNavbar", "hidden");
            }}
            className="rounded-full cursor-pointer ml-2"
          >
            <img
              src={profile}
              alt="Profile"
              className="w-[30px] sm:w-[40px] rounded-full"
            />
          </div>
        </div>

        {/* Dropdown menu */}
        <div className="dropDownNavbar hidden absolute right-4 sm:right-[60px] top-[80px] shadow-lg shadow-black/50 p-[10px] rounded-lg bg-[#1A1919] w-[150px] h-auto">
          <div className="py-[10px] border-b border-[#fff]">
            <i className="flex items-center gap-2 mt-3 mb-2 cursor-pointer">
              <CgProfile className="text-[18px] sm:text-[20px]" />{" "}
              <span className="text-sm sm:text-base">
                {data ? data.username : ""}
              </span>
            </i>
          </div>
          <i
            className="flex items-center gap-2 mt-3 mb-2 cursor-pointer"
            style={{ fontStyle: "normal" }}
          >
            <MdLightMode className="text-[18px] sm:text-[20px]" /> Light mode
          </i>
          <i
            onClick={() => setIsGridLayout(!isGridLayout)}
            className="flex items-center gap-2 mt-3 mb-2 cursor-pointer"
            style={{ fontStyle: "normal" }}
          >
            <BsGridFill className="text-[18px] sm:text-[20px]" />{" "}
            {isGridLayout ? "List" : "Grid"} layout
          </i>
          <button
            onClick={logout}
            className="rounded border border-[#eb1e1e] min-w-[120px] p-2 hover:bg-red-600 text-sm sm:text-base"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
