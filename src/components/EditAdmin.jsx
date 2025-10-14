// EditAdmin.jsx
import React, { useState, useEffect } from 'react';
import { ref, update, get } from "firebase/database";
import { db } from './Firebase';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from "react-router-dom";
import { 
    getAuth,
    signInWithEmailAndPassword,
    fetchSignInMethodsForEmail,
    updateEmail
} from "firebase/auth";
import ChangePassword from './ChangePassword';

// Countries list same as AddAdmin (Malaysia added)
const COUNTRIES = [
  { code: "IN", name: "India", currencyCode: "INR", currencyName: "Indian Rupee" },
  { code: "US", name: "United States", currencyCode: "USD", currencyName: "US Dollar" },
  { code: "GB", name: "United Kingdom", currencyCode: "GBP", currencyName: "Pound Sterling" },
  { code: "MY", name: "Malaysia", currencyCode: "MYR", currencyName: "Malaysian Ringgit" },

  { code: "SA", name: "Saudi Arabia", currencyCode: "SAR", currencyName: "Saudi Riyal" },
  { code: "AE", name: "United Arab Emirates", currencyCode: "AED", currencyName: "UAE Dirham" },
  { code: "QA", name: "Qatar", currencyCode: "QAR", currencyName: "Qatari Riyal" },
  { code: "KW", name: "Kuwait", currencyCode: "KWD", currencyName: "Kuwaiti Dinar" },
  { code: "OM", name: "Oman", currencyCode: "OMR", currencyName: "Omani Rial" },
  { code: "BH", name: "Bahrain", currencyCode: "BHD", currencyName: "Bahraini Dinar" },
  { code: "JO", name: "Jordan", currencyCode: "JOD", currencyName: "Jordanian Dinar" },
  { code: "LB", name: "Lebanon", currencyCode: "LBP", currencyName: "Lebanese Pound" },
  { code: "EG", name: "Egypt", currencyCode: "EGP", currencyName: "Egyptian Pound" },
  { code: "MA", name: "Morocco", currencyCode: "MAD", currencyName: "Moroccan Dirham" },
  { code: "DZ", name: "Algeria", currencyCode: "DZD", currencyName: "Algerian Dinar" },
  { code: "TN", name: "Tunisia", currencyCode: "TND", currencyName: "Tunisian Dinar" },
  { code: "IQ", name: "Iraq", currencyCode: "IQD", currencyName: "Iraqi Dinar" },
  { code: "PS", name: "Palestine", currencyCode: "ILS", currencyName: "Israeli Shekel" },
  { code: "SY", name: "Syria", currencyCode: "SYP", currencyName: "Syrian Pound" },
  { code: "SD", name: "Sudan", currencyCode: "SDG", currencyName: "Sudanese Pound" },
  { code: "LY", name: "Libya", currencyCode: "LYD", currencyName: "Libyan Dinar" },
  { code: "YE", name: "Yemen", currencyCode: "YER", currencyName: "Yemeni Rial" },
  { code: "MR", name: "Mauritania", currencyCode: "MRU", currencyName: "Mauritanian Ouguiya" },
  { code: "KM", name: "Comoros", currencyCode: "KMF", currencyName: "Comorian Franc" },
  { code: "SDN", name: "South Sudan", currencyCode: "SSP", currencyName: "South Sudanese Pound" }
];

const EditAdmin = () => {
    const { adminId } = useParams();
    const [formData, setFormData] = useState({
        customerName: '',
        shopName: '',
        location: '',
        phoneNumber: '',
        amount: '',
        userName: '',
        password: '',
        country: ''
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
                        customerName: adminData.customerName || '',
                        shopName: adminData.shopName || '',
                        location: adminData.location || '',
                        phoneNumber: adminData.phoneNumber || '',
                        amount: adminData.amount || '',
                        userName: adminData.userName || '',
                        password: adminData.password || '',
                        country: adminData.country || ''
                    }));
                    setOriginalEmail(adminData.userName || '');
                    
                    const signInMethods = await fetchSignInMethodsForEmail(auth, adminData.userName);
                    if (signInMethods.length === 0) {
                        // email not found in auth — keep previous behavior
                    }
                } else {
                    navigate('/superAdminIndex');
                }
            } catch (error) {
                console.error("Error fetching admin data:", error);
            }
        };

        fetchAdminData();
    }, [adminId, navigate, auth]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // IMPORTANT: changing country should NOT change amount per your request
        setFormData(prev => ({ ...prev, [name]: value }));
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
            // If email changed, handle separately (as before)
            if (formData.userName !== originalEmail) {
                await handleEmailUpdate();
                return;
            }

            setIsLoading(true);
            const updates = {
                customerName: formData.customerName,
                shopName: formData.shopName,
                location: formData.location,
                phoneNumber: formData.phoneNumber,
                amount: formData.amount,
                userName: formData.userName,
                password: formData.password,
                country: formData.country
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
            <div className='w-[600px] rounded-3xl h-[96vh] GlassBg bg-[#ffffff58] overflow-auto'>
                <div className='text-center text-2xl font-bold mt-5 mb-5 text-[#322f2f]'>
                    Edit Admin
                </div>
                <form onSubmit={handleSubmit} className='w-full px-6 flex flex-col justify-center items-center gap-5 pb-6'>
                    <input type="text" name="customerName" placeholder='Customer Name' value={formData.customerName} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
                    <input type="text" name="shopName" placeholder='Shop Name' value={formData.shopName} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
                    <input type="text" name="location" placeholder='Location' value={formData.location} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
                    <input type="number" name="phoneNumber" placeholder='Phone Number' value={formData.phoneNumber} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />

                    {/* Country select (does not change amount) */}
                    <div className="w-full">
                      <label className="block text-sm font-medium mb-2">Select Country</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full py-3 pl-3 outline-none border-none rounded-xl bg-white"
                      >
                        <option value="">-- Select Country --</option>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name} ({c.currencyCode})
                          </option>
                        ))}
                      </select>
                    </div>

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
