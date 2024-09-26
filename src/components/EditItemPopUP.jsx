import React from 'react'
import { IoIosClose } from "react-icons/io";
import { motion } from "framer-motion"


const EditItemPopUP = ({setItemEditPopUp}) => {
  return (
    <div className='fixed bottom-0 top-0 left-0 right-0 bg-[#006aff79] z-50 BgBlur flex justify-center items-center'>
      <motion.div
      initial={{scale:0,opacity:0}}
      animate={{scale:1,opacity:1,transition:{duration:.5,ease:'backInOut'}}}
      className=' w-full h-[370px] rounded-3xl mx-6 bg-[#ffffffb7] GlassBg relative px-6'>
        <div className=' absolute right-5 top-5 text-2xl text-[#80964c] cursor-pointer' onClick={() => setItemEditPopUp(false)}>
            <IoIosClose/>
        </div>
        <div className=' text-[28px] px-6 pt-10 text-center font-bold mb-5'>Edit Item</div>
        <div className=' w-full flex flex-col justify-center items-center gap-5 mb-10'>
            <input type="text" className=' w-full py-3 pl-2 rounded-xl border-none outline-none' />
            <input type="number" className=' w-full py-3 pl-3 rounded-xl border-none outline-none' />
            <div className=' flex justify-center gap-10'>
                <button className='px-8 py-2 rounded-xl bg-[#ffffff00] GlassBg  font-bold text-[#80964c]'>Select</button>
                <button className='px-8 py-2 rounded-xl GlassBg font-bold text-[#80964c]'>Upload</button>
            </div>
        </div>
        <div className=' flex justify-between items-center'>
            <button className=' px-8 py-2 rounded-xl bg-[#868282] text-[#fff] font-bold' onClick={() => setItemEditPopUp(false)}>Cancel</button>
            <button className=' px-8 py-2 rounded-xl bg-[#ee0000] text-[#fff] font-bold'>Delete</button>
        </div>
      </motion.div>
    </div>
  )
}

export default EditItemPopUP
