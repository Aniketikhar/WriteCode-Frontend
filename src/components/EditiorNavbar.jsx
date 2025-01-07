import React from "react";
import logo from "../images/logo.png";
import { FiDownload, FiSave } from "react-icons/fi";

const EditiorNavbar = ({ title, handledownload, saveProject }) => {
  return (
    <div className="bg-[#141414]">
      <div className="EditiorNavbar flex items-center justify-between container mx-auto h-[80px] ">
        <div className="logo ms-2">
          <a href="/">
            <h1 className="text-[25px] cursor-pointer font-bold">
              Write<span className="text-[#2764c0]">Code</span>
            </h1>
          </a>
        </div>
        <p className="hidden md:block">
          File / <span className="text-[gray]">{title}</span>
        </p>
        <div className="mr-2">
          <button
            className="hover:bg-blue-600 rounded-sm px-2 md:px-4 py-1 md:py-2"
            onClick={() => saveProject()}
            title="ctrl + s"
          >
            <FiSave className="text-xl inline" />{" "}
            <span className="hidden md:inline">Save</span>
          </button>
          <button
            className="hover:bg-blue-600 rounded-sm px-2 md:px-4 py-1 md:py-2"
            onClick={() => handledownload()}
          >
            <FiDownload className="text-xl inline" />{" "}
            <span className="hidden md:inline">Download</span>
          </button>
        </div>
      </div>
      <p className="md:hidden py-2 text-center">
        File / <span className="text-[gray]">{title}</span>
      </p>
    </div>
  );
};

export default EditiorNavbar;
