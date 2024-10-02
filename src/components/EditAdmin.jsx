import React, { useState, useEffect } from 'react';
import { ref, update,onValue } from "firebase/database";
import { db } from './Firebase';
import { toast } from "react-toastify";
// import { ref, onValue } from "firebase/database";
import { useNavigate, useParams } from "react-router-dom";

const EditAdmin = () => {
    const { adminId } = useParams(); // Get adminId from URL params
    const [formData, setFormData] = useState({
        customerName: '',
        shopName: '',
        location: '',
        phoneNumber: '',
        amount: '',
        userName: '',
    });

    const navigate = useNavigate();

    useEffect(() => {
        // Fetch admin data to pre-fill the form
        const adminRef = ref(db, `admins/${adminId}`);
        onValue(adminRef, (snapshot) => {
            if (snapshot.exists()) {
                setFormData(snapshot.val());
            }
        });
    }, [adminId]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await update(ref(db, `admins/${adminId}`), formData); // Update the admin data
            toast.success("Admin updated successfully!");
            navigate('/superAdminIndex'); // Redirect back to the admin list
        } catch (error) {
            console.error("Error updating admin:", error);
            toast.error("Error updating admin.");
        }
    };

    return (
        <div className='flex justify-center items-center w-full h-[100vh]'>
            <div className='w-[600px] rounded-3xl h-[96vh] GlassBg bg-[#ffffff58]'>
                <div className='text-center text-2xl font-bold mt-5 mb-5 text-[#322f2f]'>Edit Admin</div>
                <form onSubmit={handleSubmit} className='w-full px-6 flex flex-col justify-center items-center gap-5'>
                    <input type="text" name="customerName" placeholder='Customer Name' value={formData.customerName} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
                    <input type="text" name="shopName" placeholder='Shop Name' value={formData.shopName} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
                    <input type="text" name="location" placeholder='Location' value={formData.location} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
                    <input type="number" name="phoneNumber" placeholder='Phone Number' value={formData.phoneNumber} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
                    <input type="number" name="amount" placeholder='Amount / Price' value={formData.amount} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
                    <input type="email" name="userName" placeholder='User Email' value={formData.userName} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
                    <div className='flex justify-center gap-10 items-center'>
                        <button className='px-8 py-2 bg-[#ffc400] text-[#fff] GlassBg rounded-2xl font-bold' onClick={() => navigate('/superAdminIndex')}>Cancel</button>
                        <button type="submit" className='px-8 py-2 bg-[#63c211] text-[#fff] GlassBg rounded-2xl font-bold'>Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default EditAdmin
