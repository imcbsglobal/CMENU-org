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

const CustomerView = () => {
  const { adminId } = useParams(); // adminId from URL
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [items, setItems] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState('₹');

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

  // Load categories
  useEffect(() => {
    if (!adminId) return;
    const categoryRef = ref(db, `categories/`);
    const unsub = onValue(categoryRef, (snapshot) => {
      const data = snapshot.val() || {};
      const categoryList = Object.keys(data)
        .filter((key) => data[key].adminId === adminId)
        .map((key) => ({ id: key, ...data[key] }));

      const allCat = { id: 'all', name: 'All', imageUrl: 'https://res.cloudinary.com/dqydgc2ky/image/upload/v1728627745/all_xtjq8h.jpg' };
      setCategories([allCat, ...categoryList]);
    });
    return () => unsub();
  }, [adminId]);

  // Load items based on selected category
  useEffect(() => {
    if (!adminId) return;

    if (selectedCategory === 'all') {
      const catRef = ref(db, `categories/`);
      const unsub = onValue(catRef, (snapshot) => {
        const data = snapshot.val() || {};
        let aggregated = [];
        Object.keys(data)
          .filter(k => data[k].adminId === adminId)
          .forEach(catId => {
            const cat = data[catId];
            if (cat.items) {
              Object.keys(cat.items).forEach(itemId => {
                const item = cat.items[itemId];
                aggregated.push({ id: itemId, categoryId: catId, ...item });
              });
            }
          });
        const visible = aggregated.filter(it => !it.isHidden);
        setItems(visible);
      });
      return () => unsub();
    } else {
      const itemsRef = ref(db, `categories/${selectedCategory}/items`);
      const unsub = onValue(itemsRef, (snapshot) => {
        const data = snapshot.val() || {};
        const list = Object.keys(data).map(k => ({ id: k, categoryId: selectedCategory, ...data[k] }));
        setItems(list.filter(it => !it.isHidden));
      });
      return () => unsub();
    }
  }, [selectedCategory, adminId]);

  return (
    <div className="customer-view">
      <div className="categories-section">
        <h2>Categories</h2>
        <div className="categories-grid">
          {categories.map(cat => (
            <div 
              key={cat.id} 
              onClick={() => setSelectedCategory(cat.id)} 
              className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
            >
              <img src={cat.imageUrl} alt={cat.name} className="category-image" />
              <span className="category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="items-section">
        <h2>{selectedCategory === 'all' ? 'All Items' : categories.find(c => c.id === selectedCategory)?.name + ' Items'}</h2>
        <div className="items-grid">
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item.id} className="item-card">
                <img src={item.imageUrl || 'https://res.cloudinary.com/dqydgc2ky/image/upload/v1728627756/defaultitem_ko3p04.png'} alt={item.name} className="item-image" />
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <div className="item-prices">
                    <span className="price">Price: {currencySymbol} {item.price}</span>
                    {item.price2 && <span className="price">A/C: {currencySymbol} {item.price2}</span>}
                    {item.price3 && <span className="price">Parcel: {currencySymbol} {item.price3}</span>}
                    {item.price4 && <span className="price">Combo: {currencySymbol} {item.price4}</span>}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No items found for this category.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerView;
