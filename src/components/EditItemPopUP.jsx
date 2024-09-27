import React, { useState } from 'react';
import { IoIosClose } from "react-icons/io";
import { motion } from "framer-motion";
import { toast } from 'react-toastify';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref, set } from 'firebase/database';  // Correct import for database reference
import { db } from './Firebase'; // Make sure you're importing your Firebase setup properly

const EditItemPopUP = ({ setItemEditPopUp, itemData, handleUpdateItem }) => {
  const [editedItemName, setEditedItemName] = useState(itemData.name);
  const [editedItemPrice, setEditedItemPrice] = useState(itemData.price);
  const [editedItemImage, setEditedItemImage] = useState(null);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 50 * 1024) {
      toast.error('File size must be under 50KB!');
    } else {
      setEditedItemImage(selectedFile);
    }
  };

  const handleSaveChanges = () => {
    handleUpdateItem(editedItemName, editedItemPrice, editedItemImage); // Pass edited values back to parent
    setItemEditPopUp(false); // Close the popup
  };

  return (
    <div className='fixed bottom-0 top-0 left-0 right-0 bg-[#006aff79] z-50 BgBlur flex justify-center items-center'>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, transition: { duration: .5, ease: 'backInOut' } }}
        className='w-full h-[370px] rounded-3xl mx-6 bg-[#ffffffb7] GlassBg relative px-6'
      >
        <div className='absolute right-5 top-5 text-2xl text-[#80964c] cursor-pointer' onClick={() => setItemEditPopUp(false)}>
          <IoIosClose />
        </div>
        <div className='text-[28px] px-6 pt-10 text-center font-bold mb-5'>Edit Item</div>
        <div className='w-full flex flex-col justify-center items-center gap-5 mb-10'>
          <input
            type="text"
            value={editedItemName}
            onChange={(e) => setEditedItemName(e.target.value)}
            className='w-full py-3 pl-2 rounded-xl border-none outline-none'
            placeholder='Item Name'
          />
          <input
            type="number"
            value={editedItemPrice}
            onChange={(e) => setEditedItemPrice(e.target.value)}
            className='w-full py-3 pl-3 rounded-xl border-none outline-none'
            placeholder='Item Price'
          />
          <div className='flex justify-center gap-10'>
            <input type="file" onChange={handleImageChange} className='hidden' id="editItemImage" />
            <label htmlFor="editItemImage" className='px-8 py-2 rounded-xl bg-[#ffffff00] GlassBg font-bold text-[#80964c] cursor-pointer'>
              Select Image
            </label>
          </div>
        </div>
        <div className='flex justify-between items-center'>
          <button className='px-8 py-2 rounded-xl bg-[#868282] text-[#fff] font-bold' onClick={() => setItemEditPopUp(false)}>Cancel</button>
          <button className='px-8 py-2 rounded-xl bg-[#80964c] text-[#fff] font-bold' onClick={handleSaveChanges}>Save Changes</button>
        </div>
      </motion.div>
    </div>
  );
};

export default EditItemPopUP;
