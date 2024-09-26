import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { ref, set } from "firebase/database";
import { db } from './Firebase';
import { v4 as uuidv4 } from 'uuid'; // To generate unique admin IDs
import { toast } from "react-toastify";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; // Import Firebase Authentication

const AddAdmin = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    shopName: '',
    location: '',
    phoneNumber: '',
    amount: '',
    userName: '', // Treat as email
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const adminId = uuidv4(); // Generate a unique admin ID
    const randomKey = uuidv4(); // Generate a unique random key

    const newAdmin = {
      customerName: formData.customerName,
      shopName: formData.shopName,
      location: formData.location,
      phoneNumber: formData.phoneNumber,
      amount: formData.amount,
      userName: formData.userName.trim(), // Treat as email
      password: formData.password.trim(),
      adminId,
      randomKey, // Store the random key
      status: 'active', // Default status
    };

    try {
      // Create user in Firebase Authentication
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, newAdmin.userName, newAdmin.password); // Email and password for authentication

      // Save admin data to Firebase Realtime Database
      await set(ref(db, `admins/${adminId}`), newAdmin);
      toast.success('Admin created successfully!');
      navigate('/superAdminIndex'); // Redirect to SuperAdminIndex after successful creation
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error('Error creating admin. Please try again.');
    }
  };

  return (
    <div>
      <div className='flex justify-center items-center w-full h-[100vh]'>
        <div className='w-[600px] rounded-3xl h-[96vh] GlassBg bg-[#ffffff58]'>
          <div className='text-center text-2xl font-bold mt-5 mb-5 text-[#322f2f]'>Create Admin</div>
          <form onSubmit={handleSubmit} className='w-full px-6 flex flex-col justify-center items-center gap-5'>
            <input type="text" name="customerName" placeholder='Customer Name' value={formData.customerName} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
            <input type="text" name="shopName" placeholder='Shop Name' value={formData.shopName} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
            <input type="text" name="location" placeholder='Location' value={formData.location} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
            <input type="number" name="phoneNumber" placeholder='Phone Number' value={formData.phoneNumber} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
            <input type="number" name="amount" placeholder='Amount / Price' value={formData.amount} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
            <input type="email" name="userName" placeholder='User Email' value={formData.userName} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
            <input type="password" name="password" placeholder='Password' value={formData.password} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
            <input type="password" name="confirmPassword" placeholder='Confirm Password' value={formData.confirmPassword} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
            <div className='flex justify-center gap-10 items-center'>
              <Link to='/superAdminIndex'>
                <button className='px-8 py-2 bg-[#ffc400] text-[#fff] GlassBg rounded-2xl font-bold'>Cancel</button>
              </Link>
              <button type="submit" className='px-8 py-2 bg-[#63c211] text-[#fff] GlassBg rounded-2xl font-bold'>Create Admin</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddAdmin;
