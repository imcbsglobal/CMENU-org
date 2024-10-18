import React, { useState, useEffect } from 'react';
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebook } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { RiGoogleFill } from "react-icons/ri";
import { db } from './Firebase';
import { ref, set, get } from "firebase/database";
import { toast } from 'react-hot-toast';

const AdminProfilePage = ({setOpenAdminProfile}) => {
    const [socialLinks, setSocialLinks] = useState({
        instagram: '',
        facebook: '',
        whatsapp: '',
        google: ''
    });

    const adminId = localStorage.getItem('adminUid');

    // Load existing social links when component mounts
    useEffect(() => {
        const loadSocialLinks = async () => {
            const socialLinksRef = ref(db, `socialLinks/${adminId}`);
            const snapshot = await get(socialLinksRef);
            
            if (snapshot.exists()) {
                setSocialLinks(snapshot.val());
            }
        };

        if (adminId) {
            loadSocialLinks();
        }
    }, [adminId]);

    const handleInputChange = (platform, value) => {
        setSocialLinks(prev => ({
            ...prev,
            [platform]: value
        }));
    };

    const handleUpload = async (platform) => {
        if (!socialLinks[platform]) {
            toast.error('Please enter a valid URL');
            return;
        }

        try {
            const socialLinksRef = ref(db, `socialLinks/${adminId}`);
            await set(socialLinksRef, {
                ...socialLinks
            });
            toast.success(`${platform} link updated successfully!`);
        } catch (error) {
            console.error('Error uploading link:', error);
            toast.error('Failed to update link');
        }
    };

  return (
    <div>
            <div className='text-[20px] font-semibold text-center pt-5 mb-5'>Upload Your Social Links</div>
            <div className='flex flex-col w-full gap-5 px-2 lg:px-5 mb-5'>
                <div className='flex justify-center gap-3'>
                    <input 
                        type="text" 
                        placeholder='Instagram Link' 
                        className='inputBg w-full py-2 pl-3'
                        value={socialLinks.instagram}
                        onChange={(e) => handleInputChange('instagram', e.target.value)}
                    />
                    <button 
                        className='px-6 py-2 bg-[#51841a] text-[#fff] rounded-xl font-semibold flex items-center gap-2'
                        onClick={() => handleUpload('instagram')}
                    >
                        Upload <AiFillInstagram/>
                    </button>
                </div>
                <div className='flex justify-center gap-3'>
                    <input 
                        type="text" 
                        placeholder='Facebook Link' 
                        className='inputBg w-full py-2 pl-3'
                        value={socialLinks.facebook}
                        onChange={(e) => handleInputChange('facebook', e.target.value)}
                    />
                    <button 
                        className='px-6 py-2 bg-[#51841a] text-[#fff] rounded-xl font-semibold flex items-center gap-2'
                        onClick={() => handleUpload('facebook')}
                    >
                        Upload <FaFacebook/>
                    </button>
                </div>
                <div className='flex justify-center gap-3'>
                    <input 
                        type="text" 
                        placeholder='Whatsapp Link' 
                        className='inputBg w-full py-2 pl-3'
                        value={socialLinks.whatsapp}
                        onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    />
                    <button 
                        className='px-6 py-2 bg-[#51841a] text-[#fff] rounded-xl font-semibold flex items-center gap-2'
                        onClick={() => handleUpload('whatsapp')}
                    >
                        Upload <IoLogoWhatsapp/>
                    </button>
                </div>
                <div className='flex justify-center gap-3'>
                    <input 
                        type="text" 
                        placeholder='Google Link' 
                        className='inputBg w-full py-2 pl-3'
                        value={socialLinks.google}
                        onChange={(e) => handleInputChange('google', e.target.value)}
                    />
                    <button 
                        className='px-6 py-2 bg-[#51841a] text-[#fff] rounded-xl font-semibold flex items-center gap-2'
                        onClick={() => handleUpload('google')}
                    >
                        Upload <RiGoogleFill/>
                    </button>
                </div>
            </div>
            <div className='flex justify-center items-center'>
                <button 
                    className='text-[#fff] bg-[#51841a] px-8 py-2 rounded-lg font-semibold flex items-center gap-2' 
                    onClick={() => setOpenAdminProfile(false)}
                >
                    Back
                </button>
            </div>
        </div>
  )
}

export default AdminProfilePage
