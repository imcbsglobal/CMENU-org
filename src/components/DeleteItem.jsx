import React from 'react'
import { IoIosClose } from "react-icons/io";
import { motion } from "framer-motion"

const DeleteItem = ({setItemDeletePopUp}) => {
  return (
    <div className='fixed top-0 bottom-0 left-0 right-0 bg-[#ff0000a1] BgBlur z-50 flex justify-center items-center px-6'>
      <motion.div
      initial={{scale:0,opacity:0}}
      animate={{scale:1,opacity:1,transition:{duration:.5,ease:'backInOut'}}}
      className=' relative w-full h-[230px] bg-[#fff] rounded-3xl'>
        <div className=' absolute right-5 top-5 text-2xl text-[#80964c] cursor-pointer' onClick={() => setItemDeletePopUp(false)}>
            <IoIosClose/>
        </div>
        <div className='px-8 pt-8 mb-5 text-[28px] font-bold text-[#80964c]'>Are you sure ?</div>
        <div className='px-8 mb-7'>You want to delete this <span className='font-bold'>item</span> ? You can't view this <span className=' font-bold'>item</span> in your list anymore.</div>
        <div className='px-8 flex justify-between items-center'>
            <button className='px-8 py-2 rounded-xl bg-[#7a7171bc] font-bold text-[#fff]' onClick={() => setItemDeletePopUp(false)}>Cancel</button>
            <button className='px-8 py-2 rounded-xl bg-[#f80000] font-bold text-[#fff]'>Delete</button>
        </div>
      </motion.div>
    </div>
  )
}

export default DeleteItem
