import React,{ useState } from 'react'
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebook } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { RiGoogleFill } from "react-icons/ri";

const AdminProfilePage = ({setOpenAdminProfile}) => {
  return (
    <div>
        <div className='text-[20px] font-semibold text-center pt-5 mb-5'>Upload Your Social Links</div>
      <div className='flex flex-col w-full gap-5 px-2 lg:px-5 mb-5'>
        <div className='flex justify-center gap-3'>
            <input type="text" placeholder='Instagram Link' className='inputBg w-full py-2 pl-3' />
            <button className='px-6 py-2 bg-[#51841a] text-[#fff] rounded-xl font-semibold flex items-center gap-2'>Upload <AiFillInstagram/></button>
        </div>
        <div className='flex justify-center gap-3'>
            <input type="text" placeholder='Facebook Link' className='inputBg w-full py-2 pl-3' />
            <button className='px-6 py-2 bg-[#51841a] text-[#fff] rounded-xl font-semibold flex items-center gap-2'>Upload <FaFacebook/></button>
        </div>
        <div className='flex justify-center gap-3'>
            <input type="text" placeholder='Whatsapp Link' className='inputBg w-full py-2 pl-3' />
            <button className='px-6 py-2 bg-[#51841a] text-[#fff] rounded-xl font-semibold flex items-center gap-2'>Upload <IoLogoWhatsapp/></button>
        </div>
        <div className='flex justify-center gap-3'>
            <input type="text" placeholder='Google Link' className='inputBg w-full py-2 pl-3' />
            <button className='px-6 py-2 bg-[#51841a] text-[#fff] rounded-xl font-semibold flex items-center gap-2'>Upload <RiGoogleFill/></button>
        </div>
      </div>
      <div className='flex justify-center items-center'>
        <button className='text-[#fff] bg-[#51841a] px-8 py-2 rounded-lg font-semibold flex items-center gap-2' onClick={()=>setOpenAdminProfile(false)}>Back</button>
      </div>
    </div>
  )
}

export default AdminProfilePage
