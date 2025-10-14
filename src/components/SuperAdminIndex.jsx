// SuperAdminIndex.jsx
import React, { useState, useEffect } from "react";
import { AiFillPlusSquare } from "react-icons/ai";
import { LuSearch } from "react-icons/lu";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { ref, onValue, update } from "firebase/database";
import { db, auth } from "./Firebase";
import { toast } from "react-hot-toast";
import { signOut } from "firebase/auth";

// Countries list (same set used elsewhere)
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
  { code: "SS", name: "South Sudan", currencyCode: "SSP", currencyName: "South Sudanese Pound" }
];

const SuperAdminIndex = () => {
  const [adminData, setAdminData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [statusTimers, setStatusTimers] = useState({});

  useEffect(() => {
    const adminRef = ref(db, "admins");
    const unsubscribe = onValue(adminRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const adminArray = Object.keys(data).map((key) => {
          const admin = data[key];
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

        // Update day counts in Firebase if changed
        adminArray.forEach(async (admin) => {
          if (data[admin.id] && admin.dayCount !== data[admin.id].dayCount) {
            await update(ref(db, `admins/${admin.id}`), {
              dayCount: admin.dayCount
            });
          }
        });

        // Check pending statuses
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
      Object.values(statusTimers).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const setTimer = (adminId, duration) => {
    if (statusTimers[adminId]) {
      clearTimeout(statusTimers[adminId]);
    }

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

    setStatusTimers(prev => ({ ...prev, [adminId]: newTimer }));
  };

  const updateAdminStatus = async (adminId, newStatus, isPending = true) => {
    try {
      const updates = {
        status: newStatus,
        pendingStatus: isPending,
        pendingStatusTime: isPending ? Date.now() + 60000 : null,
      };

      await update(ref(db, `admins/${adminId}`), updates);

      if (isPending) {
        setTimer(adminId, 60000);
        toast(`Status will change to ${newStatus} in 1 minute`);
      } else {
        toast.success(`Admin status updated to ${newStatus}!`);
      }
    } catch (error) {
      toast.error("Error updating status. Please try again.");
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Disable" : "Active";
    await updateAdminStatus(adminId, newStatus);
  };

  const handleEdit = (adminId) => {
    navigate(`/editAdmin/${adminId}`);
  };

  const handleDelete = (adminId) => {
    navigate("/securityCodeDialog", { state: { adminId } });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logout successful!");
      navigate("/login");
    } catch (error) {
      toast.error("Error during logout. Please try again.");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredAdminData = adminData.filter(
    (admin) =>
      admin.customerName &&
      admin.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to map country code to country name
  const getCountryName = (countryCode) => {
    if (!countryCode) return "-";
    const c = COUNTRIES.find(x => x.code === countryCode);
    return c ? c.name : countryCode;
  };

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
              <th>Country</th> {/* NEW column */}
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
                <td colSpan="14" className="text-center">No admins found.</td>
              </tr>
            ) : (
              filteredAdminData.map((admin, index) => (
                <tr key={admin.id}>
                  <td>{index + 1}</td>
                  <td>{admin.customerName}</td>
                  <td>{admin.shopName}</td>
                  <td className=" overflow-x-auto w-full text-nowrap">{admin.adminId}</td>
                  <td>{admin.userName}</td>
                  <td>{admin.phoneNumber}</td>

                  {/* Amount column shows ONLY the numeric amount (or '-') */}
                  <td>{ admin.amount ? admin.amount : "-" }</td>

                  {/* NEW: Country column shows the country name (or '-') */}
                  <td>{ getCountryName(admin.country) }</td>

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
                  </td>
                  <td className="text-center">{admin.dayCount}</td>
                  <td className="w-full text-nowrap">{admin.validity}</td>
                  <td className="text-[#1e8ca5]">
                    <FaEdit className="cursor-pointer" onClick={() => handleEdit(admin.id)} />
                  </td>
                  <td className="text-[#f00]">
                    <MdDelete className="cursor-pointer" onClick={() => handleDelete(admin.id)} />
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
