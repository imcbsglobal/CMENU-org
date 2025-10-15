import React, { useState, useEffect, useRef } from 'react';
import { FiSearch } from "react-icons/fi";
import { MdModeEdit, MdDelete } from "react-icons/md";
import { getDatabase, ref as dbRef, set, push, onValue, remove, update, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from './Firebase';
import EditItemPopUP from './EditItemPopUP';
import { toast } from 'react-hot-toast';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import defaultCategory from "../assets/defaultcategory.png";
import defaultItem from "../assets/defaultitem.png";
import allItemsImage from "../assets/all.jpg";

// Currency map + helper (kept from your code)
const CURRENCY_MAP = {
  IN: { symbol: "₹", code: "INR" },
  US: { symbol: "$", code: "USD" },
  GB: { symbol: "£", code: "GBP" },
  MY: { symbol: "RM", code: "MYR" },
  AE: { symbol: "د.إ", code: "AED" },
  SA: { symbol: "﷼", code: "SAR" },
  QA: { symbol: "﷼", code: "QAR" },
  KW: { symbol: "KD", code: "KWD" },
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

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryEditPopUp, setCategoryEditPopUp] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const [itemEditPopUp, setItemEditPopUp] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  const auth = getAuth();
  const [adminId, setAdminId] = useState(null);
  const DEFAULT_CATEGORY_IMAGE_URL = "https://res.cloudinary.com/dqydgc2ky/image/upload/v1728627745/defaultcategory_a0dy81.png";
  const DEFAULT_ITEM_IMAGE_URL = "https://res.cloudinary.com/dqydgc2ky/image/upload/v1728627756/defaultitem_ko3p04.png";

  // Auth listener to get adminId
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setAdminId(currentUser ? currentUser.uid : null);
    });
    return () => unsubscribe();
  }, [auth]);

  // Load admin country for currency
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

  // Load items (either all categories or selected category)
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

  // --- File handlers for selects ---
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

  // --- Category creation ---
  const addCategory = () => {
    if (!categoryName) return toast.error("Category name is required!");
    if (!adminId) return toast.error("Not authenticated!");
    if (categoryImage) {
      const storage = getStorage();
      const imageRef = storageRef(storage, `categories/${categoryImage.name}_${Date.now()}`);
      uploadBytes(imageRef, categoryImage).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((downloadURL) => {
          createCategory(downloadURL);
        });
      }).catch(err => {
        toast.error("Image upload failed");
        console.error(err);
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
      })
      .catch(err => {
        toast.error("Failed to add category");
        console.error(err);
      });
  };

  // --- Item creation ---
  const addItem = () => {
    if (!selectedCategory || selectedCategory === 'all') return toast.error("Select a category first!");
    if (!itemName || !itemPrice) return toast.error("Item name and price required!");
    if (itemImage) {
      const storage = getStorage();
      const imageRef = storageRef(storage, `categories/${selectedCategory}/items/${itemImage.name}_${Date.now()}`);
      uploadBytes(imageRef, itemImage).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((downloadURL) => {
          createItem(downloadURL);
        });
      }).catch(err => {
        toast.error("Image upload failed");
        console.error(err);
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
    }).catch(err => {
      toast.error("Failed to add item");
      console.error(err);
    });
  };

  // --- Filters ---
  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm2.toLowerCase()));

  // --- Category actions: edit / delete ---
  const openCategoryEdit = (cat) => {
    setCategoryToEdit(cat);
    setCategoryEditPopUp(true);
  };

  const handleUpdateCategory = async (catId, updatedName, imageFile) => {
    if (!catId) return Promise.reject(new Error("No category selected"));
    const updates = { name: updatedName || '' };
    if (imageFile) {
      const storage = getStorage();
      const imageRef = storageRef(storage, `categories/${imageFile.name}_${Date.now()}`);
      const snap = await uploadBytes(imageRef, imageFile);
      const url = await getDownloadURL(snap.ref);
      updates.imageUrl = url;
    }
    return update(dbRef(db, `categories/${catId}`), updates)
      .then(() => {
        toast.success("Category updated");
        setCategoryEditPopUp(false);
      })
      .catch(err => {
        toast.error("Failed to update category");
        console.error(err);
        throw err;
      });
  };

  const deleteCategoryConfirm = async (cat) => {
    if (!cat || !cat.id) return;
    const ok = window.confirm(`Delete category "${cat.name}" and all its items? This cannot be undone.`);
    if (!ok) return;
    try {
      await remove(dbRef(db, `categories/${cat.id}`));
      toast.success("Category deleted");
      if (selectedCategory === cat.id) {
        setSelectedCategory('all');
        setActiveCategoryId('all');
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
    }
  };

  // --- Item actions: edit / delete ---
  const openItemEdit = (item) => {
    setSelectedItem(item);
    setItemEditPopUp(true);
    // Ensure selectedCategoryFor edit is the item's category (if needed)
    setSelectedCategory(item.categoryId || selectedCategory);
  };

  const handleUpdateItem = async (name, price, price2, price3, price4, imageFile) => {
    // this function will be passed to EditItemPopUP -> it doesn't pass item id, so uses selectedItem from state
    if (!selectedItem) return Promise.reject(new Error("No item selected"));
    const itemPath = `categories/${selectedItem.categoryId}/items/${selectedItem.id}`;
    const updates = {
      name: name || '',
      price: price || '',
      price2: price2 || '',
      price3: price3 || '',
      price4: price4 || ''
    };

    try {
      if (imageFile) {
        const storage = getStorage();
        const imageRef = storageRef(storage, `categories/${selectedItem.categoryId}/items/${imageFile.name}_${Date.now()}`);
        const snap = await uploadBytes(imageRef, imageFile);
        const url = await getDownloadURL(snap.ref);
        updates.imageUrl = url;
      }
      await update(dbRef(db, itemPath), updates);
      // keep consistent state UI
      setItemEditPopUp(false);
      setSelectedItem(null);
      return Promise.resolve();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update item");
      return Promise.reject(err);
    }
  };

  const deleteItemConfirm = async (item) => {
    if (!item || !item.id) return;
    const ok = window.confirm(`Delete item "${item.name}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await remove(dbRef(db, `categories/${item.categoryId}/items/${item.id}`));
      toast.success("Item deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete item");
    }
  };

  // --- Inline Category Edit Modal (simple) ---
  const CategoryEditModal = ({ category, onClose, onSave }) => {
    const [name, setName] = useState(category?.name || '');
    const [imageFile, setImageFileLocal] = useState(null);

    const handleImagePick = (e) => {
      const f = e.target.files[0];
      if (!f) return;
      if (f.size / 1024 > 50) {
        toast.error("File must be under 50KB!");
        return;
      }
      setImageFileLocal(f);
    };

    const save = () => {
      if (!name) return toast.error("Name required");
      onSave(category.id, name, imageFile);
    };

    useEffect(() => {
      setName(category?.name || '');
      setImageFileLocal(null);
    }, [category]);

    if (!category) return null;
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
        <div className='bg-white rounded-xl p-6 w-full max-w-lg'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-xl font-semibold'>Edit Category</h3>
            <button onClick={onClose} className='text-lg'>✕</button>
          </div>
          <input className='w-full mb-3 p-2 rounded border' value={name} onChange={(e) => setName(e.target.value)} placeholder='Category name' />
          <input type="file" accept="image/*" onChange={handleImagePick} className='mb-3' />
          <div className='flex justify-end gap-3'>
            <button onClick={onClose} className='px-4 py-2 rounded bg-gray-300'>Cancel</button>
            <button onClick={save} className='px-4 py-2 rounded bg-green-600 text-white'>Save</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-6" id="addCategory">
      <div className="flex flex-col gap-6 mt-10">
        <div className="text-2xl font-bold">Categories</div>

        <div className="flex gap-3">
          <input type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Category Name" className="w-full px-4 py-3 rounded-xl" />
          <input type="file" accept="image/*" ref={inRef1} onChange={handleFileInput} className="hidden" />
          <button onClick={handleFileInputTrigger} className="px-6 py-2 bg-[#80964c] text-white rounded-xl">Select Image</button>
          <button onClick={addCategory} className="px-6 py-2 bg-[#80964c] text-white rounded-xl">Add Category</button>
        </div>

        <div className="flex gap-10 overflow-x-auto py-4">
          {filteredCategories.map(cat => (
            <div key={cat.id} onClick={() => { setSelectedCategory(cat.id); setActiveCategoryId(cat.id); }} className={`relative flex flex-col items-center cursor-pointer px-2 ${activeCategoryId === cat.id ? 'text-[#1eb5ad]' : ''}`}>
              <div className="w-[80px] h-[80px] rounded-lg overflow-hidden relative">
                <img src={cat.imageUrl || defaultCategory} alt={cat.name} className="object-cover w-full h-full" />
              </div>
              <div className="mt-2 font-bold">{cat.name}</div>

              {/* Edit & Delete icons shown for user-created categories (not for 'All') */}
              {cat.id !== 'all' && (
                <div className='absolute right-0 top-0 flex gap-1'>
                  <button onClick={(e) => { e.stopPropagation(); openCategoryEdit(cat); }} title="Edit Category" className='p-1 rounded bg-white/80'>
                    <MdModeEdit size={18} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteCategoryConfirm(cat); }} title="Delete Category" className='p-1 rounded bg-white/80'>
                    <MdDelete size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-2xl font-bold mt-6">Items</div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Item Name" className="w-full px-4 py-3 rounded-xl" />
          <input type="text" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="Normal Price" className="w-full px-4 py-3 rounded-xl" />
          <input type="text" value={itemPrice2} onChange={(e) => setItemPrice2(e.target.value)} placeholder="A/C Price" className="w-full px-4 py-3 rounded-xl" />
          <input type="text" value={itemPrice3} onChange={(e) => setItemPrice3(e.target.value)} placeholder="Parcel Price" className="w-full px-4 py-3 rounded-xl" />
          <input type="text" value={itemPrice4} onChange={(e) => setItemPrice4(e.target.value)} placeholder="Combo Price" className="w-full px-4 py-3 rounded-xl" />
        </div>

        <div className='flex gap-3'>
          <input type="file" accept="image/*" ref={inRef2} onChange={handleItemImage} className='hidden' />
          <button onClick={handleFileInputTrigger2} className="px-8 py-2 bg-[#80964c] text-white rounded-xl">Select Item Image</button>
          <button onClick={addItem} className="px-8 py-2 bg-[#80964c] text-white rounded-xl">Add Item</button>
        </div>

        <div className="mt-5">
          <div className="mb-3">
            <input type="text" value={searchTerm2} onChange={(e) => setSearchTerm2(e.target.value)} placeholder="Search items..." className="w-full px-4 py-2 rounded-xl" />
          </div>
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

                {/* item actions: edit / delete */}
                <div className="flex items-center gap-3">
                  <button onClick={() => openItemEdit(item)} title="Edit Item" className='p-2 rounded bg-white/80'>
                    <MdModeEdit size={20} />
                  </button>
                  <button onClick={() => deleteItemConfirm(item)} title="Delete Item" className='p-2 rounded bg-white/80'>
                    <MdDelete size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div>No items found.</div>
          )}
        </div>
      </div>

      {/* Edit item popup */}
      {itemEditPopUp && selectedItem && (
        <EditItemPopUP
          setItemEditPopUp={setItemEditPopUp}
          itemData={selectedItem}
          handleUpdateItem={handleUpdateItem}
        />
      )}

      {/* Category edit popup */}
      {categoryEditPopUp && categoryToEdit && (
        <CategoryEditModal
          category={categoryToEdit}
          onClose={() => { setCategoryEditPopUp(false); setCategoryToEdit(null); }}
          onSave={handleUpdateCategory}
        />
      )}
    </div>
  );
};

export default Category;
