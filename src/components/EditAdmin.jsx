import React, { useState, useEffect } from 'react';
import { ref, update, get } from "firebase/database";
import { db, auth } from './Firebase';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from "react-router-dom";
import { 
    updateEmail, 
    fetchSignInMethodsForEmail
} from "firebase/auth";
import ChangePassword from './ChangePassword';

const EditAdmin = () => {
    const { adminId } = useParams();
    const [formData, setFormData] = useState({
        customerName: '',
        shopName: '',
        location: '',
        phoneNumber: '',
        amount: '',
        userName: '',
    });
    const [openPasswordChange, setOpenPasswordChange] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const adminRef = ref(db, `admins/${adminId}`);
                const snapshot = await get(adminRef);
                
                if (snapshot.exists()) {
                    const adminData = snapshot.val();
                    setFormData(prevState => ({
                        ...prevState,
                        ...adminData,
                    }));
                    
                    // Verify if email exists in authentication
                    const signInMethods = await fetchSignInMethodsForEmail(auth, adminData.userName);
                    if (signInMethods.length === 0) {
                        // toast.error("Admin email not found in authentication");
                    }
                } else {
                    toast.error("Admin not found");
                    navigate('/superAdminIndex');
                }
            } catch (error) {
                console.error("Error fetching admin data:", error);
                // toast.error("Error loading admin data");
            }
        };

        fetchAdminData();
    }, [adminId, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            // Update in database
            const updates = {
                ...formData,
            };

            await update(ref(db, `admins/${adminId}`), updates);
            
            toast.success("Admin updated successfully!");
            navigate('/superAdminIndex');
        } catch (error) {
            console.error("Error updating admin:", error);
            toast.error(`Error updating admin: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenPasswordChange = () => {
        setOpenPasswordChange(true);
    };

    return (
        <div className='flex justify-center items-center w-full h-[100vh]'>
            <div className='w-[600px] rounded-3xl h-[96vh] GlassBg bg-[#ffffff58]'>
                <div className='text-center text-2xl font-bold mt-5 mb-5 text-[#322f2f]'>
                    Edit Admin
                </div>
                <form onSubmit={handleSubmit} className='w-full px-6 flex flex-col justify-center items-center gap-5'>
                    <input type="text" name="customerName" placeholder='Customer Name' value={formData.customerName} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
                    <input type="text" name="shopName" placeholder='Shop Name' value={formData.shopName} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
                    <input type="text" name="location" placeholder='Location' value={formData.location} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
                    <input type="number" name="phoneNumber" placeholder='Phone Number' value={formData.phoneNumber} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
                    <input type="number" name="amount" placeholder='Amount / Price' value={formData.amount} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
                    <input type="email" name="userName" placeholder='User Email' value={formData.userName} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' readOnly />
                    
                    <div>
                    <button
                        type="button"
                        onClick={handleOpenPasswordChange}
                        className='px-8 py-2 rounded-2xl text-[#fff] bg-[#ff1f1f] font-semibold'>Change Password</button>
                    </div>

                    <div className='flex justify-center gap-10 items-center'>
                        <button 
                            type="button" 
                            className='px-8 py-2 bg-[#ffc400] text-[#fff] GlassBg rounded-2xl font-bold' 
                            onClick={() => navigate('/superAdminIndex')}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className='px-8 py-2 bg-[#63c211] text-[#fff] GlassBg rounded-2xl font-bold'
                            disabled={isLoading}
                        >
                            {isLoading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
           
            {openPasswordChange && (
                <ChangePassword 
                    setOpenPasswordChange={setOpenPasswordChange}
                />
            )}
        </div>
    );
};

export default EditAdmin;