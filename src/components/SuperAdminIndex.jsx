import React, { useState, useEffect } from 'react';
import { AiFillPlusSquare } from "react-icons/ai";
import { LuSearch } from "react-icons/lu";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { db } from './Firebase'; // Make sure to import Firebase setup


const SuperAdminIndex = () => {

    const [adminData, setAdminData] = useState([]);

    useEffect(() => {
        const adminRef = ref(db, 'admins');
        onValue(adminRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const adminArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
            }));
            setAdminData(adminArray);
        }
        });
    }, []);


    return (
        <div>
            <div className='flex justify-between mx-auto w-[90%] mb-10 mt-10'>
                <Link to='/addAdmin'>
                    <button className='px-8 py-3 bg-[#fff] rounded-xl font-bold flex justify-center items-center gap-2 text-[#80964c]'>
                        Add Admin <span><AiFillPlusSquare /></span>
                    </button>
                </Link>
                <div className='flex relative items-center justify-center'>
                    <input
                        type="text"
                        className='rounded-xl px-8 py-3 border-none outline-none'
                        placeholder='Search...'
                    />
                    <span className='absolute right-2 text-xl text-[#80964c]'><LuSearch /></span>
                </div>
            </div>
            <div className='w-[90%] mx-auto bg-[#ffffff72] rounded-3xl'>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Customer Name</th>
                            <th>Shop Name</th>
                            <th>Admin ID</th>
                            <th>User Name</th>
                            <th>Phone Number</th>
                            <th>Amount</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {adminData.map((admin, index) => (
                            <tr key={admin.id}>
                                <td>{index + 1}</td>
                                <td>{admin.customerName}</td>
                                <td>{admin.shopName}</td>
                                <td>{admin.adminId}</td>
                                <td>{admin.userName}</td>
                                <td>{admin.phoneNumber}</td>
                                <td>{admin.amount}</td>
                                <td>{admin.location}</td>
                                <td>{admin.status}</td>
                                <td className='text-[#1e8ca5]'><FaEdit className='cursor-pointer' /></td>
                                <td className='text-[#f00]'><MdDelete className='cursor-pointer' /></td>
                            </tr>
                        ))}
                    </tbody>
                    
                </table>
            </div>
        </div>
    );
}

export default SuperAdminIndex;
