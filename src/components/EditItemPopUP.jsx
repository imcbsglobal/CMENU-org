import React, { useState,useEffect } from 'react';
import { IoIosClose } from "react-icons/io";
import { motion } from "framer-motion";
import { toast } from 'react-hot-toast';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref, set } from 'firebase/database';  // Correct import for database reference
import { db } from './Firebase'; // Make sure you're importing your Firebase setup properly

const EditItemPopUP = ({ setItemEditPopUp, itemData, handleUpdateItem }) => {
  const [editedItemName, setEditedItemName] = useState(itemData.name);
  const [editedItemPrice, setEditedItemPrice] = useState(itemData.price || '');
  const [editedItemPrice2, setEditedItemPrice2] = useState(itemData.price2 || '');
  const [editedItemPrice3, setEditedItemPrice3] = useState(itemData.price3 || '');
  const [editedItemImage, setEditedItemImage] = useState(null);

  useEffect(() => {
    // Initialize state with existing values or empty strings
    setEditedItemName(itemData.name || '');
    setEditedItemPrice(itemData.price || '');
    setEditedItemPrice2(itemData.price2 || '');
    setEditedItemPrice3(itemData.price3 || '');
  }, [itemData]);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 50 * 1024) {
      toast.error('File size must be under 50KB!');
      setEditedItemImage(null);
    } else {
      setEditedItemImage(selectedFile);
    }
  };

  const handleSaveChanges = () => {
    // Create an object with the updates, including empty strings for cleared prices
    const updates = {
      name: editedItemName,
      price: editedItemPrice || '',
      price2: editedItemPrice2 || '',
      price3: editedItemPrice3 || '',
      image: editedItemImage
    };

    handleUpdateItem(
      updates.name,
      updates.price,
      updates.price2,
      updates.price3,
      updates.image
    )
      .then(() => {
        toast.success("Item updated successfully!");
        setItemEditPopUp(false);
      })
      .catch((error) => {
        toast.error("Error updating item: " + error.message);
      });
  };
  
  
  return (
    <div className='fixed bottom-0 top-0 left-0 right-0 bg-[#006aff79] z-50 BgBlur flex justify-center items-center'>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, transition: { duration: .5, ease: 'backInOut' } }}
        className='w-full lg:w-[600px] h-[500px] rounded-3xl mx-6 bg-[#ffffffb7] GlassBg relative px-6'
      >
        <div className='absolute right-5 top-5 text-2xl text-[#80964c] cursor-pointer' onClick={() => setItemEditPopUp(false)}>
          <IoIosClose />
        </div>
        <div className='text-[28px] px-6 pt-10 text-center font-bold mb-5'>Edit Item</div>
        <div className='w-full flex flex-col justify-center items-center gap-5 mb-5'>
          <input
            type="text"
            value={editedItemName}
            onChange={(e) => setEditedItemName(e.target.value)}
            className='w-full py-3 pl-2 rounded-xl border-none outline-none'
            placeholder='Item Name'
          />
          <input
            type="text"
            value={editedItemPrice}
            onChange={(e) => setEditedItemPrice(e.target.value)}
            className='w-full py-3 pl-3 rounded-xl border-none outline-none'
            placeholder='Normal Price'
          />
          <input
            type="text"
            value={editedItemPrice2}
            onChange={(e) => setEditedItemPrice2(e.target.value)}
            className='w-full py-3 pl-3 rounded-xl border-none outline-none'
            placeholder='A/C Price'
          />
          <input
            type="text"
            value={editedItemPrice3}
            onChange={(e) => setEditedItemPrice3(e.target.value)}
            className='w-full py-3 pl-3 rounded-xl border-none outline-none'
            placeholder='Parcel Price'
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
          <button className='px-8 py-2 rounded-xl bg-[#80964c] text-[#fff] font-bold' onClick={handleSaveChanges}>Save</button>
        </div>
      </motion.div>
    </div>
  );
};

export default EditItemPopUP;
