import React, { useState, useEffect, useRef } from 'react';
import { FiSearch } from "react-icons/fi";
import { MdModeEdit, MdDelete } from "react-icons/md";
import { getDatabase, ref as dbRef, set, push, onValue, remove, update, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from './Firebase'; 
import { ref } from 'firebase/database';
import DeleteAlert from './DeleteAlert';
import EditPopUp1 from './EditPopUp1';
import EditItemPopUP from './EditItemPopUP';
import DeleteItem from './DeleteItem';
import { toast } from 'react-hot-toast';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import defaultCategory from "../assets/defaultcategory.png"
import defaultItem from "../assets/defaultitem.png"
import allItemsImage from "../assets/all.jpg";

const CURRENCY_MAP = {
  IN: { symbol: "₹", code: "INR" },
  US: { symbol: "$", code: "USD" },
  GB: { symbol: "£", code: "GBP" },
  MY: { symbol: "RM", code: "MYR" },
  AE: { symbol: "د.إ", code: "AED" },
  SA: { symbol: "﷼", code: "SAR" }
};
const getCurrencySymbol = (countryCode) => {
  if (!countryCode) countryCode = "IN";
  const up = countryCode.toUpperCase();
  return (CURRENCY_MAP[up] && CURRENCY_MAP[up].symbol) ? CURRENCY_MAP[up].symbol : up;
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
  const [selectedCategory, setSelectedCategory] = useState('all'); // default to 'all' so items show
  const [itemImage, setItemImage] = useState(null); 
  const [items, setItems] = useState([]);
  const inRef1 = useRef();
  const inRef2 = useRef();
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemToDelete, setSelectedItemToDelete] = useState(null); 
  const [itemToDelete, setItemToDelete] = useState(null);
  const auth = getAuth();
  const [adminId, setAdminId] = useState(null); // fixed: adminId state
  const [searchTerm, setSearchTerm] = useState(''); 
  const [searchTerm2, setSearchTerm2] = useState(''); // State for item search input
  const [user, setUser] = useState(null);
  const [hiddenItems, setHiddenItems] = useState({});
  const [itemPrice4, setItemPrice4] = useState(''); // Combo Price
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  const DEFAULT_CATEGORY_IMAGE_URL = "https://res.cloudinary.com/dqydgc2ky/image/upload/v1728627745/defaultcategory_a0dy81.png";
  const DEFAULT_ITEM_IMAGE_URL = "https://res.cloudinary.com/dqydgc2ky/image/upload/v1728627756/defaultitem_ko3p04.png";

  // Listen for auth state and set adminId & user
  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setAdminId(currentUser ? currentUser.uid : null);
      });
      return () => unsubscribe();
  }, [auth]);

  // Load admin country to set currency symbol
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

  // Fetch categories for the logged-in admin and include an "All" pseudo-category
  useEffect(() => {
      if (!adminId) return;
      const categoryRef = dbRef(db, `categories/`);
      const unsub = onValue(categoryRef, (snapshot) => {
          const data = snapshot.val() || {};
          // build categories belonging to this admin
          const categoryList = Object.keys(data)
              .filter((key) => data[key].adminId === adminId)
              .map((key) => ({
                  id: key,
                  ...data[key],
                  items: data[key].items || {}
              }));

          // Add 'all' pseudo-category at beginning
          const allCat = { id: 'all', name: 'All', imageUrl: allItemsImage };
          const finalList = [allCat, ...categoryList];
          setCategories(finalList);

          // If selectedCategory was removed or not set, keep 'all'
          if (!selectedCategory || (selectedCategory !== 'all' && !finalList.find(c => c.id === selectedCategory))) {
            setSelectedCategory('all');
            setActiveCategoryId('all');
          }
      });

      return () => unsub();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminId]);

  // Load items for selectedCategory (aggregates when 'all' is selected)
  useEffect(() => {
      if (!adminId) return;

      if (!selectedCategory || selectedCategory === 'all') {
          // aggregate items across all categories of this admin
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
                      // include categoryId so we can edit/delete/hide properly later
                      aggregated.push({ id: itemId, categoryId: catId, ...item });
                    });
                  }
                });

              // If you want to hide hidden items from view in admin list, filter here:
              const visible = aggregated.filter(it => !it.isHidden);
              setItems(visible);

              // build hidden map (so toggles show correct state)
              const hiddenMap = {};
              aggregated.forEach(it => { if (it.isHidden) hiddenMap[it.id] = true; });
              setHiddenItems(hiddenMap);
          });
          return () => unsub();
      } else {
          // load items only for selected category
          const itemsRef = dbRef(db, `categories/${selectedCategory}/items`);
          const unsub = onValue(itemsRef, (snapshot) => {
              const data = snapshot.val() || {};
              const list = Object.keys(data).map(k => ({ id: k, categoryId: selectedCategory, ...data[k] }));
              const visible = list.filter(it => !it.isHidden);
              setItems(visible);

              const hidden = {};
              Object.keys(data).forEach(k => {
                if (data[k].isHidden) hidden[k] = true;
              });
              setHiddenItems(hidden);
          });
          return () => unsub();
      }
  }, [selectedCategory, adminId]);

  // file input triggers
  const handleFileInputTrigger = () => inRef1.current.click();
  const handleFileInputTrigger2 = () => inRef2.current.click();

  const handleFileInput = (e) => {
      const file = e.target.files[0];
      if(file){
          const fileSizeInKB = file.size / 1024;
          if(fileSizeInKB > 50) {
              toast.error("File size must be under 50Kb!");
          } else {
              setCategoryImage(file);
              toast.success("File Selected Successfully",{position:'top-center'});
          }
      }
      e.target.value = null;
  };

  const handleItemImage = (e) => {
      const file = e.target.files[0];
      if (file) {
          const fileSizeInKB = file.size / 1024;
          if (fileSizeInKB > 50) {
              toast.error('File size must be under 50KB!',{ position:"top-center"});
          } else {
              setItemImage(file);
              toast.success("File selected successfully");
          }
      }
      e.target.value = null;
  };

  const addCategory = () => {
      if (categoryName) {
          if (!adminId) { toast.error("Not authenticated"); return; }
          if (categoryImage) {
              const storage = getStorage();
              const imageRef = storageRef(storage, `categories/${categoryImage.name}`);
              uploadBytes(imageRef, categoryImage).then((snapshot) => {
                  getDownloadURL(snapshot.ref).then((downloadURL) => {
                      createCategoryInDatabase(downloadURL);
                  });
              }).catch(err => toast.error("Upload failed: " + err.message));
          } else {
              createCategoryInDatabase(DEFAULT_CATEGORY_IMAGE_URL);
          }
      } else {
          toast.error("Category name must be provided");
      }
  };

  const createCategoryInDatabase = (imageUrl) => {
      const newCategoryRef = push(dbRef(db, `categories/`));
      set(newCategoryRef, {
          name: categoryName,
          adminId: adminId,
          imageUrl: imageUrl,
      }).then(() => {
          setCategoryName('');
          setCategoryImage(null);
          toast.success("Category Added Successfully", {position: 'top-center'});
      }).catch(error => {
          toast.error("Error adding category: " + error.message);
      });
  };

  const addItem = () => {
      // ensure a specific category is selected (not 'all')
      if (!selectedCategory || selectedCategory === 'all') {
        toast.error("Please select a specific category to add an item");
        return;
      }
      if (itemName && itemPrice && selectedCategory) {
          if (itemImage) {
              const storage = getStorage();
              const imageRef = storageRef(storage, `categories/${selectedCategory}/items/${itemImage.name}`);
              uploadBytes(imageRef, itemImage).then((snapshot) => {
                  getDownloadURL(snapshot.ref).then((downloadURL) => {
                      createItemInDatabase(downloadURL);
                  });
              }).catch(err => toast.error("Upload failed: " + err.message));
          } else {
              createItemInDatabase(DEFAULT_ITEM_IMAGE_URL);
          }
      } else {
          toast.error("Item name, price, and category must be provided");
      }
  };

  const createItemInDatabase = (imageUrl) => {
      const newItemRef = push(dbRef(db, `categories/${selectedCategory}/items`));
      set(newItemRef, {
          name: itemName,
          price: itemPrice,
          price2 :itemPrice2,
          price3 :itemPrice3,
          price4: itemPrice4,
          imageUrl: imageUrl,
      }).then(() => {
          setItemName('');
          setItemPrice('');
          setItemPrice2('');
          setItemPrice3('');
          setItemPrice4('');
          setItemImage(null);
          toast.success("Item Added Successfully", {position: 'top-center'});
      }).catch(error => {
          toast.error("Error adding item: " + error.message);
      });
  };

  const handleCategoryClick = (categoryId) => {
      setSelectedCategory(categoryId);
      setActiveCategoryId(categoryId);
      // For UX we aggregate in the useEffect so no extra fetch required here
  };

  const deleteCategory = (categoryId) => {
      remove(ref(db, `categories/${categoryId}`))
          .then(() => {
              setSelectedCategory('all');
              setItems([]);
              toast.success("Category deleted");
          })
          .catch((error) => {
              console.error("Error deleting category: ", error);
              toast.error("Error deleting category");
          });
  };

  const openCategoryDeletePopUp = (category) => {
      setCategoryToDelete(category);
      setCategoryDeletePopUp(true);
  };

  const handleCategoryEditClick = (category) => {
      setSelectedCategoryForEdit(category);
      setCategoryEditPopUp(true);
  };

  const openItemEditPopUp = (item) => {
      setSelectedItem(item);
      setItemEditPopUp(true);
  };

  const handleUpdateItem = (name, price, price2, price3, price4, image) => {
    return new Promise((resolve, reject) => {
      if (!selectedItem) return reject("No item selected");
      const itemRef = dbRef(db, `categories/${selectedItem.categoryId}/items/${selectedItem.id}`);

      get(itemRef)
        .then((snapshot) => {
          const existingData = snapshot.val() || {};

          const updatedItemData = {
            name: name || existingData.name,
            price: price !== undefined ? price : existingData.price,
            price2: price2 !== undefined ? price2 : existingData.price2,
            price3: price3 !== undefined ? price3 : existingData.price3,
            price4: price4 !== undefined ? price4 : existingData.price4,
            imageUrl: existingData.imageUrl,
          };

          if (image) {
            const storage = getStorage();
            const imageRef = storageRef(storage, `categories/${selectedItem.categoryId}/items/${image.name}`);
            uploadBytes(imageRef, image)
              .then((snapshot) => getDownloadURL(snapshot.ref))
              .then((downloadURL) => {
                updatedItemData.imageUrl = downloadURL;
                return set(itemRef, updatedItemData);
              })
              .then(resolve)
              .catch((error) => reject("Error uploading image: " + error.message));
          } else {
            set(itemRef, updatedItemData)
              .then(resolve)
              .catch((error) => reject("Error updating item: " + error.message));
          }
        })
        .catch((error) => reject("Error fetching item: " + error.message));
    });
  };

  const deleteItem = async (itemToDelete) => {
      if (itemToDelete) {
          const itemId = itemToDelete.id;
          const categoryId = itemToDelete.categoryId || selectedCategory;

          try {
              await remove(ref(db, `categories/${categoryId}/items/${itemId}`));
              toast.success('Item deleted successfully!');
              setItems((prevItems) => prevItems.filter(item => item.id !== itemId));
          } catch (error) {
              toast.error('Error deleting item: ' + error.message);
          }
      }
  };

  const openItemDeletePopUp = (item) => {
      setItemToDelete(item);
      setItemDeletePopUp(true);
  };

  const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
  };

  const filteredCategories = categories.filter((category) =>
      category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange2 = (e) => {
      setSearchTerm2(e.target.value);
  };

  const filteredItems = items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm2.toLowerCase())
  );

  const handleToggleItemVisibility = (itemId, isHidden) => {
    // find the item in current items (aggregated items include categoryId)
    const item = items.find(it => it.id === itemId);
    const catId = item?.categoryId;
    if (!catId) {
      toast.error("Cannot determine item's category");
      return;
    }
    const updatedRef = dbRef(db, `categories/${catId}/items/${itemId}`);
    update(updatedRef, { isHidden }).then(() => {
      setHiddenItems(prev => ({ ...prev, [itemId]: isHidden }));
      toast.success(isHidden ? 'Item hidden successfully' : 'Item is now visible');
    }).catch(error => {
      console.error("Error updating item visibility:", error);
      toast.error('Failed to update item visibility');
    });
  };

  return (
      <div className="px-6" id="addCategory">
        <div className="flex justify-between items-center mt-10 flex-col gap-5 overflow-hidden">
          {user ? (
            <div className="text-2xl font-bold ItemText">Add Categories</div>
          ) : (
            <div className="text-2xl font-bold">Categories</div>
          )}

          {user && (
            <div className="w-full mb-5">
              <input
                type="text"
                placeholder="Category Name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-8 mb-5 py-3 rounded-xl border-none outline-none"
              />
              <input
                type="file"
                onChange={handleFileInput}
                ref={inRef1}
                className="mb-5 hidden"
              />
              <div className="flex justify-center items-center gap-10">
                <button
                  className="px-8 py-2 rounded-xl bg-[#fff4] GlassBg font-bold text-[#80964c]"
                  onClick={handleFileInputTrigger}
                >
                  Select
                </button>
                <button
                  onClick={addCategory}
                  className="px-8 py-2 rounded-xl bg-[#fff4] GlassBg font-bold text-[#80964c]"
                >
                  Upload
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-start items-start">
            <div className="relative flex justify-start items-center">
              <input
                type="text"
                className="outline-none border-none rounded-lg py-2 px-8"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search Categories.."
              />
              <span className="absolute text-2xl right-2 text-[#80964c] drop-shadow-md flex items-center justify-center">
                <FiSearch />
              </span>
            </div>
          </div>

          <div className="flex gap-10 overflow-x-auto whitespace-nowrap w-full">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className={`flex flex-col justify-center items-center flex-shrink-0 cursor-pointer ${activeCategoryId === category.id ? "active-category text-[#1eb5ad]" : ""}`}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <div className="w-[80px] h-[80px] bg-[#80964c] flex justify-center items-center rounded-lg overflow-hidden">
                    <img
                      src={category.imageUrl || DEFAULT_CATEGORY_IMAGE_URL}
                      alt={category.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="mt-2 font-bold text-[13px] lg:text-lg">
                    {category.name}
                  </div>
                  {user && category.id !== "all" && (
                    <div className="flex items-center gap-2">
                      <div
                        className="cursor-pointer text-[#80964c]"
                        onClick={(e) => { e.stopPropagation(); handleCategoryEditClick(category); }}
                      >
                        <MdModeEdit />
                      </div>
                      <div
                        className="cursor-pointer text-[#80964c]"
                        onClick={(e) => { e.stopPropagation(); openCategoryDeletePopUp(category); }}
                      >
                        <MdDelete />
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No categories found</p>
            )}
          </div>

          {user ? (
            <div className="text-2xl font-bold ItemText" id="addItems">Add Items</div>
          ) : (
            <div className="text-2xl font-bold" id="addItems">Available Dishes</div>
          )}

          {user && (
            <div className="mb-2 flex flex-col gap-5 w-full">
              <input
                type="text"
                placeholder="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="py-3 px-8 outline-none border-none rounded-xl w-full"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-3 px-8 rounded-xl border-none outline-none text-sm"
              >
                <option value="" disabled>Select Category</option>
                {categories.filter(c => c.id !== 'all').map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Normal Price"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                className="px-8 py-3 rounded-xl border-none outline-none"
              />
              <input
                type="text"
                placeholder="A/C"
                value={itemPrice2}
                onChange={(e) => setItemPrice2(e.target.value)}
                className="px-8 py-3 rounded-xl border-none outline-none"
              />
              <input
                type="text"
                placeholder="Parcel"
                value={itemPrice3}
                onChange={(e) => setItemPrice3(e.target.value)}
                className="px-8 py-3 rounded-xl border-none outline-none"
              />
              <input
                type="text"
                placeholder="Combo Price"
                value={itemPrice4}
                onChange={(e) => setItemPrice4(e.target.value)}
                className="px-8 py-3 rounded-xl border-none outline-none"
              />
              <div className="flex justify-center items-center gap-10 text-sm">
                <input
                  type="file"
                  onChange={handleItemImage}
                  ref={inRef2}
                  className="hidden"
                />
                <button
                  onClick={handleFileInputTrigger2}
                  className="px-8 py-2 rounded-xl bg-[#fff4] GlassBg font-bold text-[#80964c]"
                >
                  Select Item Image
                </button>
                <button
                  onClick={addItem}
                  className="px-8 py-2 rounded-xl bg-[#fff4] GlassBg font-bold text-[#80964c]"
                >
                  Add Item
                </button>
              </div>
            </div>
          )}

          <div className="relative flex justify-center items-center">
            <input
              type="text"
              className="outline-none border-none rounded-lg py-2 px-8"
              value={searchTerm2}
              onChange={handleSearchChange2}
              placeholder="Search items..."
            />
            <span className="absolute text-2xl right-2 text-[#80964c] drop-shadow-md flex items-center justify-center">
              <FiSearch />
            </span>
          </div>

          <div className="mt-5 w-full">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center mb-5 GlassBackground px-2 h-[125px] md:h-[100px] rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.imageUrl || DEFAULT_ITEM_IMAGE_URL}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover GlassBackground"
                    />
                    <div>
                      <div className="md:text-xl font-bold">{item.name}</div>
                      <div className="flex gap-4">
                        {item.price && (
                          <div className=" flex flex-col justify-center items-center">
                            <div className="md:text-sm text-[10px] font-semibold">Norm</div>
                            <div className="md:text-sm text-[10px]  flex items-center gap-1 font-bold ItemText">
                              {currencySymbol}{item.price}
                            </div>
                          </div>
                        )}
                        {item.price2 && (
                          <div className=" flex flex-col justify-center items-center">
                            <div className="md:text-sm text-[10px] font-semibold">A/C</div>
                            <div className="md:text-sm text-[10px] flex items-center gap-1 font-bold ItemText">
                              {currencySymbol}{item.price2}
                            </div>
                          </div>
                        )}
                        {item.price3 && (
                          <div className=" flex flex-col justify-center items-center">
                            <div className="md:text-sm text-[10px] font-semibold">Parcel</div>
                            <div className="md:text-sm text-[10px] flex items-center gap-1 font-bold ItemText">
                              {currencySymbol}{item.price3}
                            </div>
                          </div>
                        )}
                        {item.price4 && (
                          <div className=" flex flex-col justify-center items-center">
                            <div className="md:text-sm text-[10px] font-semibold">Combo Price</div>
                            <div className="md:text-sm text-[10px] flex items-center gap-1 font-bold ItemText">
                              {currencySymbol}{item.price4}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {user && (
                    <div className="flex items-center gap-3 bg-[#fff] rounded-[5px] px-2 py-1 absolute md:relative md:bg-[#fff0] top-2 right-2">
                      {hiddenItems[item.id] ? (
                        <button
                          onClick={() => handleToggleItemVisibility(item.id, false)}
                          className="md:px-6 md:py-2 rounded-xl bg-[#fff] text-[10px] md:text-sm font-bold cursor-pointer text-[#80964c]"
                        >
                          Display
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleItemVisibility(item.id, true)}
                          className="md:px-6 md:py-2 text-[10px] rounded-xl bg-[#fff] md:text-sm font-bold cursor-pointer text-[#80964c]"
                        >
                          Hide
                        </button>
                      )}
                      <MdModeEdit
                        className="cursor-pointer text-xl text-[#80964c]"
                        onClick={() => openItemEditPopUp(item)}
                      />
                      <MdDelete
                        className="cursor-pointer text-xl text-red-500"
                        onClick={() => deleteItem(item)}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className=" text-center">
                No items found for this category.
              </div>
            )}
          </div>
        </div>

        {categoryEditPopUp && (
          <EditPopUp1
            setCategoryEditPopUp={setCategoryEditPopUp}
            category={selectedCategoryForEdit}
          />
        )}
        {categoryDeletePopUp && (
          <DeleteAlert
            setCategoryDeletePopUp={setCategoryDeletePopUp}
            category={categoryToDelete}
            deleteCategory={deleteCategory}
          />
        )}
        {itemEditPopUp && selectedItem && (
          <EditItemPopUP
            setItemEditPopUp={setItemEditPopUp}
            itemData={selectedItem}
            handleUpdateItem={handleUpdateItem}
          />
        )}
        {itemDeletePopUp && (
          <DeleteItem
            setItemDeletePopUp={setItemDeletePopUp}
            itemToDelete={itemToDelete}
            deleteItem={deleteItem}
          />
        )}
      </div>
    );
};

export default Category;
