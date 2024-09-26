import React from 'react';
import { IoIosClose } from "react-icons/io";
import { motion } from "framer-motion";

const DeleteAlert = ({ setCategoryDeletePopUp, category, deleteCategory }) => {
    const handleDelete = () => {
        if (category) {
            deleteCategory(category.id); // Call the delete function with the category ID
            setCategoryDeletePopUp(false); // Close the popup
        }
    };

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 bg-[#ff0000a1] z-50 flex justify-center items-center px-6 BgBlur'>
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { duration: .5, ease: 'backInOut' } }}
                className='w-full lg:w-[900px] mx-auto bg-[#fff] h-[230px] rounded-3xl relative'>
                <div className='absolute right-8 top-5 cursor-pointer text-2xl text-[#80964c]' onClick={() => setCategoryDeletePopUp(false)}>
                    <IoIosClose />
                </div>
                <div className='px-8 pt-8 text-[28px] mb-5 text-[#80964c] font-bold'>Are you sure?</div>
                <div className='px-8 mb-5 text-[#8e8a8a]'>
                    You want to reject this profile? You can't view this <span className='font-bold'>category</span> in your list anymore.
                </div>
                <div className='px-8 flex gap-10 items-center justify-between'>
                    <button className='px-8 py-2 rounded-xl bg-[rgba(165,163,163,0.84)] text-[#fff] font-bold' onClick={() => setCategoryDeletePopUp(false)}>Cancel</button>
                    <button className='px-8 py-2 rounded-xl bg-[#d30000] text-[#fff] font-bold' onClick={handleDelete}>Delete</button>
                </div>
            </motion.div>
        </div>
    );
};

export default DeleteAlert;
