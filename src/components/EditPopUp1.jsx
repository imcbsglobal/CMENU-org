import React, { useState } from 'react';
import { IoIosClose } from "react-icons/io";
import { motion } from "framer-motion";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref, set } from 'firebase/database';  // Correct import for database reference
import { db } from './Firebase'; // Make sure you're importing your Firebase setup properly

const EditPopUp1 = ({ setCategoryEditPopUp, category }) => {
    const [newCategoryName, setNewCategoryName] = useState(category.name);
    const [newCategoryImage, setNewCategoryImage] = useState(null);

    // Handle file selection for a new image
    const handleFileInput = (e) => {
        setNewCategoryImage(e.target.files[0]);
    };

    // Function to update the category in Firebase
    const handleSave = async () => {
        let updatedCategoryData = { name: newCategoryName };

        if (newCategoryImage) {
            // If a new image is selected, upload the new image
            const storage = getStorage();
            const imageRef = storageRef(storage, `categories/${newCategoryImage.name}`);
            const snapshot = await uploadBytes(imageRef, newCategoryImage);
            const downloadURL = await getDownloadURL(snapshot.ref);
            updatedCategoryData.imageUrl = downloadURL; // Update with the new image URL
        }

        // Update category in Firebase
        set(ref(db, `categories/${category.id}`), {
            ...category, // Keep the other data like adminId and randomKey
            ...updatedCategoryData, // Update name and imageUrl if changed
        }).then(() => {
            setCategoryEditPopUp(false); // Close the popup
        }).catch((error) => {
            console.error("Error updating category: ", error);
        });
    };

    return (
        <div className='fixed top-0 bottom-0 right-0 left-0 bg-[#006aff79] z-50 BgBlur flex justify-center items-center'>
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { duration: .5, ease: 'backInOut' } }}
                className='w-full h-[300px] mx-6 bg-[#ffffffb7] rounded-3xl px-6 GlassBg relative'>
                <div className='absolute right-5 top-5 cursor-pointer text-2xl text-[#80964c]' onClick={() => setCategoryEditPopUp(false)}>
                    <IoIosClose />
                </div>
                <div className='mt-10 mb-5 text-[28px] font-bold text-[#4d4747]'>Category Edit</div>
                <div>
                    {/* Input to edit the category name */}
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className='GlassBg bg-[#80964c] w-full py-3 pl-3 outline-none border-none rounded-xl mb-5'
                    />

                    {/* Input to select a new category image */}
                    <input type="file" onChange={handleFileInput} className='hidden' id="fileInput" />
                    <div className='flex gap-10 mb-6'>
                        <label htmlFor="fileInput" className='px-8 py-2 rounded-xl bg-[#80964c] text-[#fff] font-bold GlassBg cursor-pointer'>Select</label>
                    </div>

                    <div className='flex justify-between items-center'>
                        <button className='px-8 py-2 rounded-xl font-bold text-[#868282] bg-[#fff]' onClick={() => setCategoryEditPopUp(false)}>Cancel</button>
                        <button className='px-8 py-2 rounded-xl font-bold bg-[#fff] text-[#0066ff]' onClick={handleSave}>Save</button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EditPopUp1;
