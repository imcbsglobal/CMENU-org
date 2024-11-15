import React, {useState, useEffect} from 'react'
import { db } from "./Firebase";
import { ref, set, onValue } from 'firebase/database';
import { toast } from 'react-hot-toast';

const ColorPicker = () => {

    const [color, setColor] = useState("#d6eda1")
    const [fontColor, setFontColor] = useState("#000")
    const adminId = localStorage.getItem('adminUid');

    // Load saved color from Firebase on component mount
    useEffect(() => {
        if (adminId) {
            const colorRef = ref(db, `adminColors/${adminId}`);
            onValue(colorRef, (snapshot) => {
                if (snapshot.exists()) {
                    const savedColor = snapshot.val().color;
                    setColor(savedColor);
                }
            });
        }
    }, [adminId]);


    // Font Color Fetching
    // Font Color Fetching
useEffect(() => {
    if (adminId) {
        const colorRef = ref(db, `adminFontColors/${adminId}`);
        onValue(colorRef, (snapshot) => {
            if (snapshot.exists()) {
                const savedFontColor = snapshot.val().fontColor; // Correct key
                setFontColor(savedFontColor);
            }
        });
    }
}, [adminId]);


    const handleColorChange = async (event) => {
        const newColor = event.target.value;
        setColor(newColor);
        
        try {
            // Save to Firebase
            await set(ref(db, `adminColors/${adminId}`), {
                color: newColor
            });
        } catch (error) {
        }
    }


    const handleColorChange2 = async (event) => {
        const newFontColor = event.target.value;
        setFontColor(newFontColor);
    
        try {
            // Save to Firebase
            await set(ref(db, `adminFontColors/${adminId}`), {
                fontColor: newFontColor // Correct key
            });
        } catch (error) {
            console.error("Error saving font color:", error); // Add an error message for debugging
        }
    };

  return (
    <div className='lg:flex flex md:grid text-center p-1 border rounded-md border-[#6d8040] backdrop-blur-md bg-[#6d8040] text-[#fff]'>
      <div className='  right-2 top-5 p-2 rounded-lg'>
        {/* <button className='px-8 py-3 rounded-lg bg-[#d6eda1] border-[#550d0d] border-[.1px]'></button> */}
        <div className='color-display rounded-lg' style={{backgroundColor : color}}></div>
        <div className='font-semibold'>Background</div>
        <p className='text-sm'>{color}</p>
        <input 
            type="color" 
            value={color} 
            onChange={handleColorChange}
            className='w-full cursor-pointer' 
        />
      </div>

      <div className='  right-2 top-5 p-2 rounded-lg'>
        {/* <button className='px-8 py-3 rounded-lg bg-[#d6eda1] border-[#550d0d] border-[.1px]'></button> */}
        <div className='color-display rounded-lg px-8' style={{backgroundColor : fontColor}}></div>
        <div className='font-semibold'>Font</div>
        <p className='text-sm'>{fontColor}</p>
        <input 
            type="color" 
            value={fontColor} 
            onChange={handleColorChange2}
            className='w-full cursor-pointer' 
        />
      </div>
    </div>
  )
}

export default ColorPicker
