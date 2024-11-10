import React from 'react'
import logo from "../images/logo.png"
import { FiDownload } from "react-icons/fi";


const EditiorNavbar = () => {
  return (
    <>
      <div className="EditiorNavbar flex items-center justify-between px-[100px] h-[80px] bg-[#141414]">
        <div className="logo">
        <h1 className='text-[25px] cursor-pointer font-bold'>Write<span className='text-[#2764c0]'>Code</span></h1>
        </div>
        <p>File / <span className='text-[gray]'>My first project</span></p>
        <i className='p-[8px] btn bg-black rounded-[5px] cursor-pointer text-[20px]'><FiDownload /></i>
      </div>
    </>
  )
}

export default EditiorNavbar