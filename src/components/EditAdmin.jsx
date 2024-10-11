import React, { useState, useEffect } from 'react';
import { ref, update, get } from "firebase/database";
import { db, auth } from './Firebase';
import { toast } from 'react-hot-toast';
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useNavigate, useParams } from "react-router-dom";
import { 
    updateEmail, 
    updatePassword,
    signInWithEmailAndPassword,
    fetchSignInMethodsForEmail
} from "firebase/auth";

const EditAdmin = () => {
    const [openEye, setOpenEye] = useState(false);
    const { adminId } = useParams();
    const [formData, setFormData] = useState({
        customerName: '',
        shopName: '',
        location: '',
        phoneNumber: '',
        amount: '',
        userName: '',
        password: '',
        currentPassword: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [originalEmail, setOriginalEmail] = useState('');
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
                    setOriginalEmail(adminData.userName);
                    
                    // Verify if email exists in authentication
                    const signInMethods = await fetchSignInMethodsForEmail(auth, adminData.userName);
                    if (signInMethods.length === 0) {
                        toast.error("This admin's email is not found in the authentication system", {
                            duration: 5000
                        });
                    }
                } else {
                    toast.error("Admin not found");
                    navigate('/superAdminIndex');
                }
            } catch (error) {
                console.error("Error fetching admin data:", error);
                toast.error("Error loading admin data");
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
            if (!formData.currentPassword) {
                toast.error("Please enter the current password to make changes");
                setIsLoading(false);
                return;
            }

            // First, try to sign in with the current email and password
            let userCredential;
            try {
                userCredential = await signInWithEmailAndPassword(
                    auth, 
                    originalEmail,
                    formData.currentPassword
                );
            } catch (signInError) {
                console.error("Sign-in error:", signInError);
                toast.error("Current password is incorrect");
                setIsLoading(false);
                return;
            }

            const user = userCredential.user;

            // Update email if changed
            if (formData.userName !== originalEmail) {
                try {
                    await updateEmail(user, formData.userName);
                } catch (emailError) {
                    console.error("Email update error:", emailError);
                    toast.error("Could not update email. It might be in use by another account.");
                    setIsLoading(false);
                    return;
                }
            }

            // Update password if a new one is provided
            if (formData.password && formData.password !== formData.currentPassword) {
                try {
                    await updatePassword(user, formData.password);
                } catch (passwordError) {
                    console.error("Password update error:", passwordError);
                    toast.error("Could not update password. Please try again.");
                    setIsLoading(false);
                    return;
                }
            }

            // Update in database
            const updates = {
                ...formData,
                userName: formData.userName,
            };
            delete updates.currentPassword;
            delete updates.password; // Don't store password in database

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
                    <input type="email" name="userName" placeholder='User Email' value={formData.userName} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
                    
                    <div className='w-full relative flex items-center'>
                        <input 
                            type={showCurrentPassword ? "text" : "password"} 
                            name="currentPassword" 
                            placeholder='Current Password'
                            value={formData.currentPassword} 
                            onChange={handleChange} 
                            className='w-full py-3 pl-3 outline-none border-none rounded-xl'
                            required
                        />
                        <span className='absolute right-2 cursor-pointer' onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                            {showCurrentPassword ? <HiEyeOff/> : <HiEye/>}
                        </span>
                    </div>
                    
                    <div className='w-full relative flex items-center'>
                        <input 
                            type={showNewPassword ? "text" : "password"} 
                            name="password" 
                            placeholder='New Password (optional)' 
                            value={formData.password} 
                            onChange={handleChange} 
                            className='w-full py-3 pl-3 outline-none border-none rounded-xl'
                        />
                        <span className='absolute right-2 cursor-pointer' onClick={() => setShowNewPassword(!showNewPassword)}>
                            {showNewPassword ? <HiEyeOff/> : <HiEye/>}
                        </span>
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
        </div>
    );
};

export default EditAdmin;