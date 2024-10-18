import React, { useState } from 'react';
import { HiEye, HiEyeOff } from "react-icons/hi";
import { auth } from './Firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { toast } from 'react-hot-toast';

const ChangePassword = ({ setOpenPasswordChange }) => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long");
            setIsLoading(false);
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user is currently signed in");
            }

            // Re-authenticate the user
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Update the password
            await updatePassword(user, newPassword);
            
            toast.success("Password updated successfully!");
            setOpenPasswordChange(false);
        } catch (error) {
            console.error("Error updating password:", error);
            if (error.code === 'auth/wrong-password') {
                toast.error("Current password is incorrect");
            } else {
                toast.error(`Error updating password: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 z-[999] GlassBackground flex justify-center items-center'>
            <div className='w-full lg:w-[650px] h-[400px] bg-[#42728e] rounded-3xl'>
                <div className='text-center pt-5 text-[20px] font-bold text-[#fff] mb-5'>Change Password</div>
                <form onSubmit={handleChangePassword} className='w-full px-2 lg:px-5 flex flex-col justify-center items-center gap-5 mb-5'>
                    <div className='relative flex w-full items-center'>
                        <input 
                            type={showCurrentPassword ? "text" : "password"} 
                            value={currentPassword} 
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className='w-full px-2 py-2 rounded-lg outline-none border-none' 
                            placeholder="Current Password"
                            required
                        />
                        <span className='absolute right-2 cursor-pointer' onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                            {showCurrentPassword ? <HiEyeOff/> : <HiEye/>}
                        </span>
                    </div>
                    <div className='relative flex w-full items-center'>
                        <input 
                            type={showNewPassword ? "text" : "password"} 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)}
                            className='w-full px-2 py-2 rounded-lg outline-none border-none' 
                            placeholder="New Password"
                            required
                        />
                        <span className='absolute right-2 cursor-pointer' onClick={() => setShowNewPassword(!showNewPassword)}>
                            {showNewPassword ? <HiEyeOff/> : <HiEye/>}
                        </span>
                    </div>
                    <div className='relative flex w-full items-center'>
                        <input 
                            type={showNewPassword ? "text" : "password"} 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className='w-full px-2 py-2 rounded-lg outline-none border-none' 
                            placeholder="Confirm New Password"
                            required
                        />
                    </div>
                    <div className='flex justify-center items-center gap-5'>
                        <button type="button" onClick={() => setOpenPasswordChange(false)} className='px-8 py-2 rounded-2xl font-bold text-[#fff] bg-[#ffc400]'>Cancel</button>
                        <button type="submit" className='px-8 py-2 rounded-2xl font-bold text-[#fff] bg-[#63c211]' disabled={isLoading}>
                            {isLoading ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;