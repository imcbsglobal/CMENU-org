import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue, get } from 'firebase/database';
import { db } from '../components/Firebase';

// Currency map + helper (keeps consistent mapping with other files)
const CURRENCY_MAP = {
  IN: { symbol: "₹", code: "INR" },
  US: { symbol: "$", code: "USD" },
  GB: { symbol: "£", code: "GBP" },
  MY: { symbol: "RM", code: "MYR" },
  SA: { symbol: "﷼", code: "SAR" },
  AE: { symbol: "د.إ", code: "AED" },
  QA: { symbol: "﷼", code: "QAR" },
  KW: { symbol: "KD", code: "KWD" }, // <- changed to KD
  OM: { symbol: "ر.ع", code: "OMR" },
  BH: { symbol: "ب.د", code: "BHD" },
  JO: { symbol: "د.ا", code: "JOD" },
  LB: { symbol: "ل.ل", code: "LBP" },
  EG: { symbol: "£", code: "EGP" },
  MA: { symbol: "د.م.", code: "MAD" },
  DZ: { symbol: "د.ج", code: "DZD" },
  TN: { symbol: "د.ت", code: "TND" },
  IQ: { symbol: "ع.د", code: "IQD" },
  PS: { symbol: "₪", code: "ILS" },
  SY: { symbol: "£", code: "SYP" },
  SD: { symbol: "£", code: "SDG" },
  LY: { symbol: "ل.د", code: "LYD" },
  YE: { symbol: "﷼", code: "YER" },
  MR: { symbol: "UM", code: "MRU" },
  KM: { symbol: "CF", code: "KMF" },
  SS: { symbol: "£", code: "SSP" }
};

const getCurrencySymbol = (countryCode) => {
  if (!countryCode) countryCode = "IN";
  const up = countryCode.toUpperCase();
  if (CURRENCY_MAP[up]) return CURRENCY_MAP[up].symbol || CURRENCY_MAP[up].code;
  if (up === "EU") return "€";
  return /^[A-Z]{2,3}$/.test(up) ? up : "₹";
};

const CategoryPage = () => {
  const { category } = useParams(); // category ID from URL
  const [items, setItems] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  // Attempt to get adminId from localStorage (same pattern used elsewhere)
  const adminId = localStorage.getItem('adminUid');

  useEffect(() => {
    // fetch admin country to determine currency symbol
    if (!adminId) {
      setCurrencySymbol(getCurrencySymbol('IN'));
      return;
    }
    const adminRef = ref(db, `admins/${adminId}`);
    get(adminRef).then(snap => {
      if (snap.exists()) {
        const admin = snap.val();
        const country = admin.country || 'IN';
        setCurrencySymbol(getCurrencySymbol(country));
      } else {
        setCurrencySymbol(getCurrencySymbol('IN'));
      }
    }).catch(err => {
      console.error('Error fetching admin data:', err);
      setCurrencySymbol(getCurrencySymbol('IN'));
    });
  }, [adminId]);

  useEffect(() => {
    if (!category) {
      setItems([]);
      return;
    }

    const itemsRef = ref(db, `categories/${category}/items`);
    const unsubscribe = onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const itemList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setItems(itemList);
      } else {
        setItems([]);
      }
    });

    return () => unsubscribe();
  }, [category]);

  return (
    <div className="category-page">
      <h1>{category} Items</h1>
      <div>
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="item">
              <h2>{item.name}</h2>
              <p>Price: {currencySymbol} {item.price}</p>
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="item-image" />}
            </div>
          ))
        ) : (
          <p>No items found for this category.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
