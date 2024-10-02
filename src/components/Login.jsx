import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; // Use Firebase Auth for login

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

      if (user) {
        toast.success('Login successful!');
        localStorage.setItem('adminUid', user.uid);

        // Check if the email is the super admin's email
        if (email === 'info@imcbsglobal.com') {
          // Navigate to the superAdminIndex page
          navigate('/superAdminIndex');
        } else {
          // Navigate to the home page for other users with their admin ID
          navigate(`/${user.uid}`); // Use the user ID to create the path
        }
      }
    } catch (error) {
      console.error("Error during login: ", error);
      toast.error('Invalid email or password!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='bg-[#D5ED9F] h-screen flex justify-center items-center'>
      <ToastContainer className="flex justify-center items-center w-full" />
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
