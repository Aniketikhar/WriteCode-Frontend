import React from "react";
import logo from "../images/logo.png";
import { FiDownload } from "react-icons/fi";

const EditiorNavbar = ({ title, handledownload }) => {
  return (
    <>
      <div className="EditiorNavbar flex items-center justify-between px-[100px] h-[80px] bg-[#141414]">
        <div className="logo">
          <a href="/">
            <h1 className="text-[25px] cursor-pointer font-bold">
              Write<span className="text-[#2764c0]">Code</span>
            </h1>
          </a>
        </div>
        <p>
          File / <span className="text-[gray]">{title}</span>
        </p>
        <button onClick={() => handledownload()}>
          <FiDownload className="text-xl" />
        </button>
      </div>
    </>
  );
};

export default EditiorNavbar;
