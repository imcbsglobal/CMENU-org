import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; // Use Firebase Auth for login
import { ref, get } from "firebase/database"; // Add get from firebase/database
import { db } from './Firebase'; // Make sure this import exists

const Login = () => {
  const [email, setEmail] = useState(''); // Change from username to email
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("user credentials",user)

      if (user) {
        toast.success('Login successful!');
        localStorage.setItem('adminUid', user.uid);

        // Check if the email is the super admin's email
        if (email === 'info@imcbsglobal.com') {
          // Navigate to the superAdminIndex page
          navigate('/superAdminIndex');
        } 
        // For regular admins, check their status in the database
        const adminRef = ref(db, 'admins');
        const snapshot = await get(adminRef);
        
        if (snapshot.exists()) {
          let adminData = null;
          let adminId = null;
          
          // Find the admin entry that matches the logged-in user's UID
          Object.entries(snapshot.val()).forEach(([key, value]) => {
            console.log("Admin Data Values is",value)
            if (value.userName === email) {
              adminData = value;
              adminId = key;
            }
          });

          if (adminData) {
            // localStorage.setItem('adminUid', adminId);
            
            if (adminData.status === 'Disable') {
              toast('Account is disabled');
              navigate('/disableStatus');
            } else {
              toast.success('Login successful!');
              navigate(`/admin/${adminId}`);
            }
          } else {
            toast.error('Admin account not found');
          }
        } else {
          toast.error('No admin data found');
        }
      }

    } catch (error) {
      // console.error("Error during login: ", error);
      toast.error('Invalid email or password!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='bg-[#D5ED9F] h-screen flex justify-center items-center'>
      <div className='flex flex-col justify-center items-center w-[90%] lg:w-[40%] mx-auto h-[400px] rounded-3xl bg-[#ffffff56] GlassBg'>
        <div className='text-2xl font-bold mb-10'>Login</div>
        <form className='flex flex-col gap-5 w-full' onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Enter Email'
            className='mx-2 py-3 pl-3 rounded-xl outline-none border-none'
            required
            disabled={isLoading}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Enter Password'
            className='mx-2 py-3 pl-3 rounded-xl outline-none border-none'
            required
            disabled={isLoading}
          />
          <div className='flex justify-center items-center'>
            <button
              type='submit'
              className='px-8 py-3 bg-[#59ff0097] rounded-xl GlassBg font-bold text-[#fff]'
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
