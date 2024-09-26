import React from 'react'
import { IoIosClose } from "react-icons/io";


const ConfirmationUrl = () => {
  return (
    <div className='fixed top-0 bottom-0 left-0 right-0 w-full h-full flex justify-center items-center bg-[#80964ca9] z-50 BgBlur px-6'>
      <div className='w-full h-[200px]  GlassBg rounded-3xl relative'>
        <div className=' absolute right-5 top-5 text-2xl text-[#fff]'>
            <IoIosClose/>
        </div>
        <div className=' px-8 text-[28px] font-bold py-5 text-[#fff]'>Generate Url</div>
        <div className='mb-5 px-8'>Genrate your url</div>
        <div className=' flex justify-between px-8 items-center'>
            <button className='px-8 py-2 rounded-xl bg-[#726d6db5] font-bold text-[#fff] GlassBg'>Cancel</button>
            <button className='px-8 py-2 bg-[#00ddff] rounded-xl font-bold GlassBg'>Generate</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationUrl
