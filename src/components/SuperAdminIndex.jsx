import React, { useState, useEffect } from "react";
import { AiFillPlusSquare } from "react-icons/ai";
import { LuSearch } from "react-icons/lu";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { db, auth } from "./Firebase"; // Make sure to import Firebase setup
import EditAdmin from "./EditAdmin";
import { toast } from "react-hot-toast";
// import { remove } from "firebase/database";
import { update, remove } from "firebase/database";
import { signOut, getAuth } from "firebase/auth"; // Import signOut for logout
import { getStorage, ref as storageRef, deleteObject } from "firebase/storage"; // Import storage functionalities

const SuperAdminIndex = () => {
  const [adminData, setAdminData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); // Initialize navigate
  const [statusTimers, setStatusTimers] = useState({});

  useEffect(() => {
    const adminRef = ref(db, "admins");
    const unsubscribe = onValue(adminRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const adminArray = Object.keys(data).map((key) => {
          const admin = data[key];
          // Calculate days since creation
          const createdAt = admin.createdAt || new Date().getTime();
          const daysSinceCreation = Math.min(
            90,
            Math.ceil((new Date().getTime() - createdAt) / (1000 * 60 * 60 * 24))
          );

          return {
            id: key,
            ...admin,
            dayCount: daysSinceCreation,
            pendingStatus: admin.pendingStatus || false,
            pendingStatusTime: admin.pendingStatusTime || null,
          };
        });
        setAdminData(adminArray);

        // Update day counts in Firebase
        adminArray.forEach(async (admin) => {
          if (admin.dayCount !== data[admin.id].dayCount) {
            await update(ref(db, `admins/${admin.id}`), {
              dayCount: admin.dayCount
            });
          }
        });

        // Check and update pending statuses
        adminArray.forEach((admin) => {
          if (admin.pendingStatus && admin.pendingStatusTime) {
            const timeLeft = admin.pendingStatusTime - Date.now();
            if (timeLeft > 0) {
              setTimer(admin.id, timeLeft);
            } else {
              updateAdminStatus(
                admin.id,
                admin.status === "Active" ? "Disable" : "Active",
                false
              );
            }
          }
        });
      }
    });

    return () => {
      unsubscribe();
      // Clear all timers on unmount
      Object.values(statusTimers).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const setTimer = (adminId, duration) => {
    // Clear existing timer if any
    if (statusTimers[adminId]) {
      clearTimeout(statusTimers[adminId]);
    }

    // Set new timer
    const newTimer = setTimeout(() => {
      const admin = adminData.find((a) => a.id === adminId);
      if (admin) {
        updateAdminStatus(
          adminId,
          admin.status === "Active" ? "Disable" : "Active",
          false
        );
      }
    }, duration);

    setStatusTimers((prev) => ({
      ...prev,
      [adminId]: newTimer,
    }));
  };

  const updateAdminStatus = async (adminId, newStatus, isPending = true) => {
    try {
      const updates = {
        status: newStatus,
        pendingStatus: isPending,
        pendingStatusTime: isPending ? Date.now() + 60000 : null, // 1 minute = 60000 milliseconds
      };

      await update(ref(db, `admins/${adminId}`), updates);

      if (isPending) {
        setTimer(adminId, 60000);
        toast(`Status will change to ${newStatus} in 1 minute`);
      } else {
        toast.success(`Admin status updated to ${newStatus}!`);
      }
    } catch (error) {
      // console.error("Error updating status:", error);
      toast.error("Error updating status. Please try again.");
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Disable" : "Active";
    await updateAdminStatus(adminId, newStatus);
  };

  const handleEdit = (adminId) => {
    navigate(`/editAdmin/${adminId}`); // Navigate to the EditAdmin page
  };

  const handleDelete = (adminId) => {
    // Navigate to the security code dialog with the adminId
    navigate("/securityCodeDialog", { state: { adminId } });
  };

  // const handleDelete = async (adminId) => {
  //   const confirmDelete = window.confirm(
  //     "Are you sure you want to delete this admin?"
  //   );
  //   if (!confirmDelete) return;

  //   try {
  //     await remove(ref(db, `admins/${adminId}`));
  //     toast.success("Admin deleted successfully from the database!");

     
  //     setAdminData((prevData) =>
  //       prevData.filter((admin) => admin.id !== adminId)
  //     );

      
  //     const storage = getStorage();
  //     const fileRef = storageRef(storage, `admins/${adminId}/someFileName.ext`);
  //     await deleteObject(fileRef); // Delete the file

  //     toast.success("Admin deleted successfully from storage!");
  //   } catch (error) {
    
  //     toast.error("Error deleting admin. Please try again.");
  //   }
  // };

  // const handleToggleStatus = async (adminId, currentStatus) => {
  //     const newStatus = currentStatus === 'Active' ? 'Disable' : 'Active';
  //     try {
  //         await update(ref(db, `admins/${adminId}`), { status: newStatus });
  //         toast.success(`Admin status updated to ${newStatus}!`);
  //     } catch (error) {
  //         console.error("Error updating status:", error);
  //         toast.error('Error updating status. Please try again.');
  //     }
  // };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the current user
      toast.success("Logout successful!");
      navigate("/login"); // Redirect to login page
    } catch (error) {
      // console.error("Error during logout:", error);
      toast.error("Error during logout. Please try again.");
    }
  };

  // Function to handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter admin data based on search term
  const filteredAdminData = adminData.filter(
    (admin) =>
      admin.customerName &&
      admin.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex lg:justify-between mx-auto w-[90%] mb-10 mt-10 flex-wrap gap-5 justify-center">
        <div className=" flex justify-center items-center gap-5">
          <Link to="/addAdmin">
            <button className="px-8 py-3 bg-[#fff] rounded-xl font-bold flex justify-center items-center gap-2 text-[#80964c]">
              Add Admin{" "}
              <span>
                <AiFillPlusSquare />
              </span>
            </button>
          </Link>
          <div className="">
            <button
              className="bg-[#fff] px-8 py-3 rounded-xl text-sm font-bold text-[#80964c]"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
        <div className=" flex justify-center items-center gap-2">
          <Link to="/Login">
            <div>
              <button className="bg-[#fff] px-8 py-3 rounded-xl text-sm font-bold text-[#80964c]">
                Login
              </button>
            </div>
          </Link>
          <div className="flex relative items-center justify-center">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="rounded-xl px-8 py-3 border-none outline-none"
              placeholder="Search..."
            />
            <span className="absolute right-2 text-xl text-[#80964c]">
              <LuSearch />
            </span>
          </div>
        </div>
      </div>
      <div className="w-[90%] mx-auto bg-[#ffffff72] rounded-3xl overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Customer Name</th>
              <th>Shop Name</th>
              <th>Admin ID</th>
              <th>User Name</th>
              <th>Phone Number</th>
              <th>Amount</th>
              <th>Location</th>
              <th>Status</th>
              <th>No. Days</th>
              <th>Validity</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody className="text-[13px] font-semibold w-full">
            {filteredAdminData.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center">
                  No admins found.
                </td>
              </tr>
            ) : (
              filteredAdminData.map((admin, index) => (
                <tr key={admin.id}>
                  <td>{index + 1}</td>
                  <td>{admin.customerName}</td>
                  <td className="">{admin.shopName}</td>
                  <td className=" overflow-x-auto w-full text-nowrap">
                    {admin.adminId}
                  </td>
                  <td>{admin.userName}</td>
                  <td>{admin.phoneNumber}</td>
                  <td>{admin.amount}</td>
                  <td>{admin.location}</td>
                  <td>
                    <button
                      className={`px-6 py-2 rounded-xl font-bold ${
                        admin.status === "Active"
                          ? "bg-[#299816] text-white"
                          : "bg-[#ff0000] text-white"
                      }`}
                      onClick={() => handleToggleStatus(admin.id, admin.status)}
                    >
                      {admin.status}
                    </button>
                    {/* {admin.pendingStatus && (
                                        <span className="text-sm text-orange-500 mt-1">
                                            Pending Payment
                                        </span>
                                    )} */}
                  </td>
                  <td className="text-center">{admin.dayCount}</td>
                  <td className="w-full text-nowrap">{admin.validity}</td>
                  <td className="text-[#1e8ca5]">
                    <FaEdit
                      className="cursor-pointer"
                      onClick={() => handleEdit(admin.adminId)}
                    />
                  </td>
                  <td className="text-[#f00]">
                    <MdDelete
                      className="cursor-pointer"
                      onClick={() => handleDelete(admin.id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminIndex;
