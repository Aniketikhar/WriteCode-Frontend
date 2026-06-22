import React from "react";
import { Link } from "react-router-dom";
import { BsGridFill } from "react-icons/bs";
import { toggleClass } from "../helper";
import { CgProfile } from "react-icons/cg";
import toonavatar from "cartoon-avatar";
import api, { clearAuth } from "../api";

const Navbar = ({ isGridLayout, setIsGridLayout, userData }) => {
  const profile = toonavatar.generate_avatar();

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Even if logout API fails, clear local state
    }
    clearAuth();
    window.location.href = "/login";
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
          <Link to={"https://port-folio-aniket-ikhar.vercel.app/"} target="_blank">
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
            <p className="flex items-center gap-2 mt-3 mb-2 cursor-pointer">
              <CgProfile className="text-[18px] sm:text-[20px]" />{" "}
              <span className="text-sm sm:text-base">
                {userData ? userData.name : ""}
              </span>
            </p>
          </div>
          
          <p
            onClick={() => setIsGridLayout(!isGridLayout)}
            className="flex items-center gap-2 mt-3 mb-2 cursor-pointer"
            style={{ fontStyle: "normal" }}
          >
            <BsGridFill className="text-[18px] sm:text-[20px]" />{" "}
            {isGridLayout ? "List" : "Grid"} layout
          </p>
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
