import React, { useState, useEffect } from 'react';
import { IoIosClose } from "react-icons/io";
import { motion } from "framer-motion";
import { toast } from 'react-hot-toast';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref, set } from 'firebase/database';
import { db } from './Firebase';

const EditItemPopUP = ({ setItemEditPopUp, itemData, handleUpdateItem }) => {
  const [editedItemName, setEditedItemName] = useState(itemData.name);
  const [editedItemNote, setEditedItemNote] = useState(itemData.note || '');
  const [editedItemPrice, setEditedItemPrice] = useState(itemData.price || '');
  const [editedItemPrice2, setEditedItemPrice2] = useState(itemData.price2 || '');
  const [editedItemPrice3, setEditedItemPrice3] = useState(itemData.price3 || '');
  const [editedItemPrice4, setEditedItemPrice4] = useState(itemData.price4 || '');
  const [editedItemImage, setEditedItemImage] = useState(null);

  useEffect(() => {
    setEditedItemName(itemData.name || '');
    setEditedItemNote(itemData.note || '');
    setEditedItemPrice(itemData.price || '');
    setEditedItemPrice2(itemData.price2 || '');
    setEditedItemPrice3(itemData.price3 || '');
    setEditedItemPrice4(itemData.price4 || '');
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
    const updates = {
      name: editedItemName,
      note: editedItemNote || '',
      price: editedItemPrice || '',
      price2: editedItemPrice2 || '',
      price3: editedItemPrice3 || '',
      price4: editedItemPrice4 || '',
      image: editedItemImage
    };

    handleUpdateItem(
      updates.name,
      updates.note,
      updates.price,
      updates.price2,
      updates.price3,
      updates.price4,
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
        className='w-full lg:w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl mx-6 bg-[#ffffffb7] GlassBg relative px-6 py-10'
      >
        <div className='absolute right-5 top-5 text-2xl text-[#80964c] cursor-pointer' onClick={() => setItemEditPopUp(false)}>
          <IoIosClose />
        </div>
        <div className='text-[28px] px-6 text-center font-bold mb-5'>Edit Item</div>
        <div className='w-full flex flex-col justify-center items-center gap-5 mb-5'>
          <input
            type="text"
            value={editedItemName}
            onChange={(e) => setEditedItemName(e.target.value)}
            className='w-full py-3 pl-2 rounded-xl border-none outline-none'
            placeholder='Item Name'
          />
          <textarea
            value={editedItemNote}
            onChange={(e) => setEditedItemNote(e.target.value)}
            className='w-full py-3 pl-2 rounded-xl border-none outline-none resize-none'
            placeholder='Item Description/Note (optional)'
            rows="3"
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
          <input
            type="text"
            value={editedItemPrice4}
            onChange={(e) => setEditedItemPrice4(e.target.value)}
            className='w-full py-3 pl-3 rounded-xl border-none outline-none'
            placeholder='Combo Price'
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