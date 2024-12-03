import React, { useState, useEffect } from "react";
import { db } from "./Firebase";
import { ref, set, onValue } from "firebase/database";

const GSTAdding = () => {
    const [gstTitle, setGstTitle] = useState(""); // State for GST title
  const adminId = localStorage.getItem("adminUid"); // Admin ID

  // Load saved GST title from Firebase on component mount
  useEffect(() => {
    if (adminId) {
      const gstRef = ref(db, `adminGST/${adminId}`);
      onValue(gstRef, (snapshot) => {
        if (snapshot.exists()) {
          const savedGstTitle = snapshot.val().gstTitle;
          setGstTitle(savedGstTitle);
        }
      });
    }
  }, [adminId]);

  // Function to handle GST title update
  const handleGstUpdate = async () => {
    if (adminId) {
      try {
        await set(ref(db, `adminGST/${adminId}`), { gstTitle });
        alert("GST Title updated successfully!");
      } catch (error) {
        console.error("Error updating GST title:", error);
      }
    }
  };

  return (
    <div className='flex justify-center items-center flex-col'>
      <div className='mb-5 ItemText text-2xl'>Adding GST Title</div>
      <div className='w-full md:w-auto mx-2 md:mx-auto flex justify-center items-center gap-2'>
        <input type="text" value={gstTitle} onChange={(e)=>setGstTitle(e.target.value)} placeholder='Add Your GST' className='py-2 px-8 w-full rounded-lg outline-none border-none'/>
        <button className='bg-[#fff] px-8 py-2 rounded-lg font-semibold ItemText' onClick={handleGstUpdate}>Upload</button>
      </div>
    </div>
  )
}

export default GSTAdding
