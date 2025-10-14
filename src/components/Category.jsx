import React, { useState, useEffect, useRef } from 'react';
import { FiSearch } from "react-icons/fi";
import { MdModeEdit, MdDelete } from "react-icons/md";
import { getDatabase, ref as dbRef, set, push, onValue, remove, update, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from './Firebase';
import DeleteAlert from './DeleteAlert';
import EditPopUp1 from './EditPopUp1';
import EditItemPopUP from './EditItemPopUP';
import DeleteItem from './DeleteItem';
import { toast } from 'react-hot-toast';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import defaultCategory from "../assets/defaultcategory.png";
import defaultItem from "../assets/defaultitem.png";
import allItemsImage from "../assets/all.jpg";

// ✅ Complete Currency Map (for all supported countries)
const CURRENCY_MAP = {
  IN: { symbol: "₹", code: "INR" },
  US: { symbol: "$", code: "USD" },
  GB: { symbol: "£", code: "GBP" },
  MY: { symbol: "RM", code: "MYR" },
  AE: { symbol: "د.إ", code: "AED" },
  SA: { symbol: "﷼", code: "SAR" },
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

// ✅ Unified helper for all components
const getCurrencySymbol = (countryCode) => {
  if (!countryCode) countryCode = "IN";
  const up = countryCode.toUpperCase();
  if (CURRENCY_MAP[up]) return CURRENCY_MAP[up].symbol || CURRENCY_MAP[up].code;
  if (up === "EU") return "€";
  return /^[A-Z]{2,3}$/.test(up) ? up : "₹";
};

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryEditPopUp, setCategoryEditPopUp] = useState(false);
  const [categoryDeletePopUp, setCategoryDeletePopUp] = useState(false);
  const [itemEditPopUp, setItemEditPopUp] = useState(false);
  const [itemDeletePopUp, setItemDeletePopUp] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemPrice2, setItemPrice2] = useState('');
  const [itemPrice3, setItemPrice3] = useState('');
  const [itemPrice4, setItemPrice4] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [itemImage, setItemImage] = useState(null);
  const [items, setItems] = useState([]);
  const inRef1 = useRef();
  const inRef2 = useRef();
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [hiddenItems, setHiddenItems] = useState({});
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const [adminId, setAdminId] = useState(null);

  // ✅ Default images
  const DEFAULT_CATEGORY_IMAGE_URL = "https://res.cloudinary.com/dqydgc2ky/image/upload/v1728627745/defaultcategory_a0dy81.png";
  const DEFAULT_ITEM_IMAGE_URL = "https://res.cloudinary.com/dqydgc2ky/image/upload/v1728627756/defaultitem_ko3p04.png";

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAdminId(currentUser ? currentUser.uid : null);
    });
    return () => unsubscribe();
  }, [auth]);

  // ✅ Load admin country for currency
  useEffect(() => {
    if (!adminId) return;
    const adminRef = dbRef(db, `admins/${adminId}`);
    get(adminRef).then(snap => {
      if (snap.exists()) {
        const admin = snap.val();
        const country = admin.country || "IN";
        setCurrencySymbol(getCurrencySymbol(country));
      } else {
        setCurrencySymbol(getCurrencySymbol("IN"));
      }
    }).catch(err => {
      console.error("Error fetching admin:", err);
      setCurrencySymbol(getCurrencySymbol("IN"));
    });
  }, [adminId]);

  // Load categories
  useEffect(() => {
    if (!adminId) return;
    const categoryRef = dbRef(db, `categories/`);
    const unsub = onValue(categoryRef, (snapshot) => {
      const data = snapshot.val() || {};
      const categoryList = Object.keys(data)
        .filter((key) => data[key].adminId === adminId)
        .map((key) => ({ id: key, ...data[key], items: data[key].items || {} }));

      const allCat = { id: 'all', name: 'All', imageUrl: allItemsImage };
      setCategories([allCat, ...categoryList]);

      if (!selectedCategory || (selectedCategory !== 'all' && !categoryList.find(c => c.id === selectedCategory))) {
        setSelectedCategory('all');
        setActiveCategoryId('all');
      }
    });
    return () => unsub();
  }, [adminId]);

  // Load items
  useEffect(() => {
    if (!adminId) return;

    if (selectedCategory === 'all') {
      const catRef = dbRef(db, `categories/`);
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
      const itemsRef = dbRef(db, `categories/${selectedCategory}/items`);
      const unsub = onValue(itemsRef, (snapshot) => {
        const data = snapshot.val() || {};
        const list = Object.keys(data).map(k => ({ id: k, categoryId: selectedCategory, ...data[k] }));
        setItems(list.filter(it => !it.isHidden));
      });
      return () => unsub();
    }
  }, [selectedCategory, adminId]);

  // Handlers
  const handleFileInputTrigger = () => inRef1.current.click();
  const handleFileInputTrigger2 = () => inRef2.current.click();

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      const sizeKB = file.size / 1024;
      if (sizeKB > 50) toast.error("File must be under 50KB!");
      else {
        setCategoryImage(file);
        toast.success("File Selected Successfully");
      }
    }
  };

  const handleItemImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const sizeKB = file.size / 1024;
      if (sizeKB > 50) toast.error("File must be under 50KB!");
      else {
        setItemImage(file);
        toast.success("File Selected Successfully");
      }
    }
  };

  const addCategory = () => {
    if (!categoryName) return toast.error("Category name is required!");
    if (!adminId) return toast.error("Not authenticated!");
    if (categoryImage) {
      const storage = getStorage();
      const imageRef = storageRef(storage, `categories/${categoryImage.name}`);
      uploadBytes(imageRef, categoryImage).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((downloadURL) => {
          createCategory(downloadURL);
        });
      });
    } else createCategory(DEFAULT_CATEGORY_IMAGE_URL);
  };

  const createCategory = (url) => {
    const newCatRef = push(dbRef(db, `categories/`));
    set(newCatRef, { name: categoryName, adminId, imageUrl: url })
      .then(() => {
        setCategoryName('');
        setCategoryImage(null);
        toast.success("Category Added!");
      });
  };

  const addItem = () => {
    if (!selectedCategory || selectedCategory === 'all') return toast.error("Select a category first!");
    if (!itemName || !itemPrice) return toast.error("Item name and price required!");
    if (itemImage) {
      const storage = getStorage();
      const imageRef = storageRef(storage, `categories/${selectedCategory}/items/${itemImage.name}`);
      uploadBytes(imageRef, itemImage).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((downloadURL) => {
          createItem(downloadURL);
        });
      });
    } else createItem(DEFAULT_ITEM_IMAGE_URL);
  };

  const createItem = (url) => {
    const newItemRef = push(dbRef(db, `categories/${selectedCategory}/items`));
    set(newItemRef, {
      name: itemName,
      price: itemPrice,
      price2: itemPrice2,
      price3: itemPrice3,
      price4: itemPrice4,
      imageUrl: url,
    }).then(() => {
      setItemName('');
      setItemPrice('');
      setItemPrice2('');
      setItemPrice3('');
      setItemPrice4('');
      setItemImage(null);
      toast.success("Item Added!");
    });
  };

  // Search filters
  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm2.toLowerCase()));

  return (
    <div className="px-6" id="addCategory">
      <div className="flex flex-col gap-6 mt-10">
        <div className="text-2xl font-bold">Categories</div>
        <input type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Category Name" className="w-full px-4 py-3 rounded-xl" />
        <div className="flex justify-between items-center">
          <button onClick={handleFileInputTrigger} className="px-8 py-2 bg-[#80964c] text-white rounded-xl">Select Image</button>
          <button onClick={addCategory} className="px-8 py-2 bg-[#80964c] text-white rounded-xl">Add Category</button>
        </div>

        <div className="flex gap-10 overflow-x-auto">
          {filteredCategories.map(cat => (
            <div key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex flex-col items-center cursor-pointer ${activeCategoryId === cat.id ? 'text-[#1eb5ad]' : ''}`}>
              <div className="w-[80px] h-[80px] rounded-lg overflow-hidden">
                <img src={cat.imageUrl || defaultCategory} alt={cat.name} className="object-cover w-full h-full" />
              </div>
              <div className="mt-2 font-bold">{cat.name}</div>
            </div>
          ))}
        </div>

        <div className="text-2xl font-bold mt-10">Items</div>
        <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Item Name" className="w-full px-4 py-3 rounded-xl" />
        <input type="text" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="Normal Price" className="w-full px-4 py-3 rounded-xl" />
        <input type="text" value={itemPrice2} onChange={(e) => setItemPrice2(e.target.value)} placeholder="A/C Price" className="w-full px-4 py-3 rounded-xl" />
        <input type="text" value={itemPrice3} onChange={(e) => setItemPrice3(e.target.value)} placeholder="Parcel Price" className="w-full px-4 py-3 rounded-xl" />
        <input type="text" value={itemPrice4} onChange={(e) => setItemPrice4(e.target.value)} placeholder="Combo Price" className="w-full px-4 py-3 rounded-xl" />

        <button onClick={handleFileInputTrigger2} className="px-8 py-2 bg-[#80964c] text-white rounded-xl">Select Item Image</button>
        <button onClick={addItem} className="px-8 py-2 bg-[#80964c] text-white rounded-xl">Add Item</button>

        <div className="mt-5">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div key={item.id} className="flex justify-between items-center GlassBackground px-2 py-3 rounded-2xl mb-3">
                <div className="flex items-center gap-4">
                  <img src={item.imageUrl || defaultItem} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="flex gap-4 text-sm">
                      <span>{currencySymbol}&nbsp;{item.price}</span>
                      {item.price2 && <div>{currencySymbol}{item.price2}</div>}
                      {item.price3 && <div>{currencySymbol}{item.price3}</div>}
                      {item.price4 && <div>{currencySymbol}{item.price4}</div>}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>No items found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
