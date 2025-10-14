// AddAdmin.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { ref, set } from "firebase/database";
import { db } from './Firebase';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Countries list including Arab countries + a few others
const COUNTRIES = [
  // Non-Arab examples
  { code: "IN", name: "India", currencyCode: "INR", currencyName: "Indian Rupee" },
  { code: "US", name: "United States", currencyCode: "USD", currencyName: "US Dollar" },
  { code: "GB", name: "United Kingdom", currencyCode: "GBP", currencyName: "Pound Sterling" },

  // Arab countries (comprehensive list)
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
  // add more if you want
];

const AddAdmin = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    shopName: '',
    location: '',
    phoneNumber: '',
    amount: '',
    userName: '',
    password: '',
    confirmPassword: '',
    country: '' // store country code
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.country) {
      toast.error("Please select a country.");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, formData.userName, formData.password);
      const uid = userCredential.user.uid;

      // validity period
      const startDate = new Date();
      const endDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const validity = `${startDate.toLocaleDateString('en-GB', options)} - ${endDate.toLocaleDateString('en-GB', options)}`;

      const newAdmin = {
        customerName: formData.customerName,
        shopName: formData.shopName,
        location: formData.location,
        phoneNumber: formData.phoneNumber,
        amount: formData.amount ? formData.amount : "", // can be empty
        userName: formData.userName.trim(),
        password: formData.password, // note: storing plain passwords is insecure
        adminId: uid,
        status: 'Disable',
        validity,
        createdAt: new Date().getTime(),
        dayCount: 1,
        country: formData.country // store country code
      };

      await set(ref(db, `admins/${uid}`), newAdmin);
      toast.success('Admin created successfully!');
      navigate('/superAdminIndex');
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error('Error creating admin. Please try again.');
    }
  };

  return (
    <div>
      <div className='flex justify-center items-center w-full h-[100vh]'>
        <div className='w-[600px] rounded-3xl h-[96vh] GlassBg bg-[#ffffff58] overflow-auto'>
          <div className='text-center text-2xl font-bold mt-5 mb-5 text-[#322f2f]'>Create Admin</div>
          <form onSubmit={handleSubmit} className='w-full px-6 flex flex-col justify-center items-center gap-5 pb-6'>
            <input type="text" name="customerName" placeholder='Customer Name' value={formData.customerName} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' required/>
            <input type="text" name="shopName" placeholder='Shop Name' value={formData.shopName} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' required/>
            <input type="text" name="location" placeholder='Location' value={formData.location} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' required/>
            <input type="number" name="phoneNumber" placeholder='Phone Number' value={formData.phoneNumber} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' required/>

            {/* Country dropdown (required) - does NOT change amount */}
            <div className="w-full">
              <label className="block text-sm font-medium mb-2">Select Country <span className="text-red-500">*</span></label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full py-3 pl-3 outline-none border-none rounded-xl bg-white"
                required
              >
                <option value="">-- Select Country --</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.currencyCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount stays empty by default and is user-entered */}
            <input type="number" name="amount" placeholder='Amount / Price' value={formData.amount} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' />
            <input type="email" name="userName" placeholder='User Email' value={formData.userName} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' required/>
            <input type="password" name="password" placeholder='Password' value={formData.password} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' required/>
            <input type="password" name="confirmPassword" placeholder='Confirm Password' value={formData.confirmPassword} onChange={handleChange} className='w-full py-3 pl-3 outline-none border-none rounded-xl' required/>
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
