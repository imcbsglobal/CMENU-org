import React, { useState, useEffect } from 'react';
import { ref, update, get } from "firebase/database";
import { db } from './Firebase';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from "react-router-dom";
import { 
    getAuth,
    updateEmail,
    signInWithEmailAndPassword,
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
        password: '', // Add password field
    });
    const [openPasswordChange, setOpenPasswordChange] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [originalEmail, setOriginalEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const auth = getAuth();

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
                    
                    const signInMethods = await fetchSignInMethodsForEmail(auth, adminData.userName);
                    if (signInMethods.length === 0) {
                        // toast.error("Admin email not found in authentication");

                    }
                } else {
                    // toast.error("Admin not found");
                    navigate('/superAdminIndex');
                }
            } catch (error) {
                // console.error("Error fetching admin data:", error);
                // toast.error("Error loading admin data");
            }
        };

        fetchAdminData();
    }, [adminId, navigate, auth]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'userName' && value !== originalEmail) {
            setShowPasswordPrompt(true);
        }
    };

    const handleEmailUpdate = async () => {
        if (!currentPassword) {
            toast.error("Please enter the current password");
            return;
        }

        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                originalEmail,
                currentPassword
            );

            await updateEmail(userCredential.user, formData.userName);

            const updates = {
                ...formData
            };
            await update(ref(db, `admins/${adminId}`), updates);

            setCurrentPassword('');
            setShowPasswordPrompt(false);
            setOriginalEmail(formData.userName);
            
            toast.success("Email updated successfully! Please log in with your new email.");
            
            await auth.signOut();
            navigate('/login');
            
        } catch (error) {
            console.error("Error updating email:", error);
            if (error.code === 'auth/wrong-password') {
                toast.error("Current password is incorrect");
            } else if (error.code === 'auth/email-already-in-use') {
                toast.error("Email is already in use by another account");
            } else if (error.code === 'auth/invalid-login-credentials') {
                // toast.error("Invalid login credentials");
            } else {
                toast.error(`Error updating email: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (formData.userName !== originalEmail) {
                await handleEmailUpdate();
                return;
            }

            setIsLoading(true);
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
                    <input type="email" name="userName" placeholder='User Email' value={formData.userName} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' readOnly/>
                    
                    {/* Password display field (read-only) */}
                    <div className='w-full relative'>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={formData.password} 
                            className='w-full py-3 pl-3 outline-none border-none rounded-xl bg-gray-100' 
                            readOnly 
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800'
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    
                    {showPasswordPrompt && (
                        <div className='w-full'>
                            <input 
                                type="password" 
                                placeholder="Enter current password to update email"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className='w-full py-3 pl-3 outline-none border-none rounded-xl'
                            />
                        </div>
                    )}
                    
                    {/* <div>
                        <button
                            type="button"
                            onClick={handleOpenPasswordChange}
                            className='px-8 py-2 rounded-2xl text-[#fff] bg-[#ff1f1f] font-semibold'>
                            Change Password
                        </button>
                    </div> */}

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