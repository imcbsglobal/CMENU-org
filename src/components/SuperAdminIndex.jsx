import React, { useState, useEffect } from 'react';
import { AiFillPlusSquare } from "react-icons/ai";
import { LuSearch } from "react-icons/lu";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { db,auth } from './Firebase'; // Make sure to import Firebase setup
import EditAdmin from './EditAdmin';
import { toast, ToastContainer } from "react-toastify"
// import { remove } from "firebase/database";  
import { update, remove } from "firebase/database";
import { signOut, getAuth } from "firebase/auth";  // Import signOut for logout
import { getStorage, ref as storageRef, deleteObject } from "firebase/storage"; // Import storage functionalities



const SuperAdminIndex = () => {

    const [adminData, setAdminData] = useState([]);
    const [searchTerm, setSearchTerm] =  useState('')
    const navigate = useNavigate();  // Initialize navigate

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

    const handleEdit = (adminId) => {
        navigate(`/editAdmin/${adminId}`); // Navigate to the EditAdmin page
    };

    const handleDelete = async (adminId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this admin?');
        if (!confirmDelete) return;
    
        try {
            await remove(ref(db, `admins/${adminId}`));
            toast.success('Admin deleted successfully from the database!');
    
            // Immediately filter out the deleted admin from the state
            setAdminData((prevData) => prevData.filter(admin => admin.id !== adminId));
    
            // If you have files stored in Firebase Storage, delete them as well
            const storage = getStorage();
            const fileRef = storageRef(storage, `admins/${adminId}/someFileName.ext`);
            await deleteObject(fileRef); // Delete the file
    
            toast.success('Admin deleted successfully from storage!');
        } catch (error) {
            console.error("Error deleting admin:", error);
            toast.error('Error deleting admin. Please try again.');
        }
    };
    
    
    const handleToggleStatus = async (adminId, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Disable' : 'Active';
        try {
            await update(ref(db, `admins/${adminId}`), { status: newStatus });
            toast.success(`Admin status updated to ${newStatus}!`);
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error('Error updating status. Please try again.');
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);  // Sign out the current user
            toast.success("Logout successful!");
            navigate('/login');  // Redirect to login page
        } catch (error) {
            console.error("Error during logout:", error);
            toast.error("Error during logout. Please try again.");
        }
    };


    // Function to handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter admin data based on search term
    const filteredAdminData = adminData.filter(admin =>
        admin.customerName && admin.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    


    return (
        <div>
            <div className='flex justify-between mx-auto w-[90%] mb-10 mt-10'>
                <div className=' flex justify-center items-center gap-5'>
                    <Link to='/addAdmin'>
                        <button className='px-8 py-3 bg-[#fff] rounded-xl font-bold flex justify-center items-center gap-2 text-[#80964c]'>
                            Add Admin <span><AiFillPlusSquare /></span>
                        </button>
                    </Link>
                    <div className=''>
                        <button className='bg-[#fff] px-8 py-3 rounded-xl text-sm font-bold text-[#80964c]' onClick={handleLogout}>Logout</button>
                    </div>
                </div>
                <div className=' flex justify-center items-center gap-2'>
                    <Link to="/Login"><div>
                        <button className='bg-[#fff] px-8 py-3 rounded-xl text-sm font-bold text-[#80964c]'>Login</button>
                    </div></Link>
                    <div className='flex relative items-center justify-center'>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className='rounded-xl px-8 py-3 border-none outline-none'
                            placeholder='Search...'
                        />
                        <span className='absolute right-2 text-xl text-[#80964c]'><LuSearch /></span>
                    </div>
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
                        {filteredAdminData.length === 0 ? (
                            <tr>
                                <td colSpan="11" className="text-center">No admins found.</td>
                            </tr>
                        ) : (
                            filteredAdminData.map((admin, index) => (
                                <tr key={admin.id}>
                                    <td>{index + 1}</td>
                                    <td>{admin.customerName}</td>
                                    <td>{admin.shopName}</td>
                                    <td>{admin.adminId}</td>
                                    <td>{admin.userName}</td>
                                    <td>{admin.phoneNumber}</td>
                                    <td>{admin.amount}</td>
                                    <td>{admin.location}</td>
                                    <td>
                                        <button className='px-6 py-2 bg-[#fff] rounded-xl font-bold text-[#299816]' onClick={() => handleToggleStatus(admin.id, admin.status)}>
                                            {admin.status}
                                        </button>
                                    </td>
                                    <td className='text-[#1e8ca5]'>
                                        <FaEdit className='cursor-pointer' onClick={() => handleEdit(admin.adminId)} />
                                    </td>
                                    <td className='text-[#f00]'>
                                        <MdDelete className='cursor-pointer' onClick={() => handleDelete(admin.id)}  />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>

                    
                </table>
            </div>
        </div>
    );
}

export default SuperAdminIndex;
