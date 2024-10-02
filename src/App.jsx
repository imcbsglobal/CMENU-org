import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; // Added Navigate here
import Login from "./components/Login";
import SuperAdminIndex from "./components/SuperAdminIndex";
import AddAdmin from "./components/AddAdmin";
import Home from "./components/Home";
import Loader from "./components/Loader";
import CategoryPage from "./components/CategoryPage";
import EditAdmin from "./components/EditAdmin";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoader(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const ProtectedRoute = ({ element }) => {
    const isAuthenticated = !!localStorage.getItem('adminUid'); // Check authentication status
    return isAuthenticated ? element : <Navigate to="/login" />; // Redirect to login if not authenticated
  };

  return (
    <>
      <Router>
        { loader ? (
          <Loader />
        ) : (
          <Routes>
            <Route path="/loader" element={<Loader />} />
            <Route path="/:admiId"  element={<Home />}/>
            <Route path="/superAdminIndex" element={<ProtectedRoute element={<SuperAdminIndex />} />} />
            <Route path="/addAdmin" element={<ProtectedRoute element={<AddAdmin />} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/editAdmin/:adminId" element={<ProtectedRoute element={<EditAdmin />} />} /> {/* Add the EditAdmin route */}
            <Route path="/category/:category" element={<ProtectedRoute element={<CategoryPage />} />} /> {/* Add the CategoryPage route */}
          </Routes>
        )}
      </Router>

      <ToastContainer/>
    </>
  );
}

export default App;
