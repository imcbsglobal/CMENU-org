import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ref, remove } from "firebase/database";
import { db } from "./Firebase"; // Import Firebase database reference
import { toast } from "react-hot-toast";


const SecurityCodeDialog = () => {
  const [enteredSecurityCode, setEnteredSecurityCode] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve the adminId from the location state
  const { adminId } = location.state || {};
  const correctSecurityCode = "12345"; // Replace with your actual security code logic

  const handleSecurityCodeChange = (e) => {
    setEnteredSecurityCode(e.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the security code matches
    if (enteredSecurityCode === correctSecurityCode) {
      try {
        // Delete the admin from Firebase
        await remove(ref(db, `admins/${adminId}`));
        toast.success("Admin deleted successfully!");
        navigate("/superAdminIndex"); // Redirect back to the admin list after deletion
      } catch (error) {
        toast.error("Failed to delete admin. Please try again.");
      }
    } else {
      toast.error("Incorrect security code.");
    }
  };


  const handleCancel = () => {
    navigate("/superAdminIndex"); // Redirect back without deleting
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:max-w-md w-full">
        <div className="text-center font-semibold ItemText mb-6 text-lg">
          Enter Security Code to Delete Admin
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={enteredSecurityCode}
            onChange={handleSecurityCodeChange}
            className="pl-3 py-2 rounded-lg inputBg w-full mb-5"
            placeholder="Enter your security code"
            required
          />
          <div className="flex justify-center items-center gap-10">
            <button className="bg-[#51841a] font-semibold text-[#ffff] px-8 py-2 rounded-lg" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="bg-[#ff1a1a] font-semibold text-[#fff] px-8 py-2 rounded-lg">
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecurityCodeDialog;
