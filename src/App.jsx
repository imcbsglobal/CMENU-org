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
import { getAuth, onAuthStateChanged } from "firebase/auth";
import CustomerView from "./components/CustomerView";
import DisbaleStatus from "./components/DisbaleStatus";


function App() {
  const [loader, setLoader] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    const timer = setTimeout(() => {
      setLoader(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <>
      <Router>
        { loader ? (
          <Loader />
        ) : (
          <Routes>
            <Route path="/loader" element={<Loader />} />
            <Route path="/:adminId" element={<CustomerView />} /> {/* Changed from Home to CustomerView */}
            <Route path="/admin/:adminId" element={<Home />} /> {/* New route for admin view */}
            <Route path="/superAdminIndex" element={<ProtectedRoute element={<SuperAdminIndex />} />} />
            <Route path="/addAdmin" element={<ProtectedRoute element={<AddAdmin />} />} />
            <Route path="/disableStatus" element={<ProtectedRoute element={<DisbaleStatus />} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/editAdmin/:adminId" element={<ProtectedRoute element={<EditAdmin />} />} />
            <Route path="/category/:category" element={<ProtectedRoute element={<CategoryPage />} />} />
          </Routes>
        )}
      </Router>

      <ToastContainer/>
    </>
  );
}

export default App;
