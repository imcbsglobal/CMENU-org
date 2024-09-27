import React, { useState, useEffect, useRef } from 'react';
import { FiSearch } from "react-icons/fi";
import { MdModeEdit, MdDelete } from "react-icons/md";
import { ref as dbRef, set, push, onValue } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from './Firebase'; 
import DeleteAlert from './DeleteAlert';
import EditPopUp1 from './EditPopUp1';
import EditItemPopUP from './EditItemPopUP';
import DeleteItem from './DeleteItem';
import { ref, remove } from 'firebase/database';
import { TbCurrencyRupee } from "react-icons/tb";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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
    const [selectedCategory, setSelectedCategory] = useState(''); // To hold the selected category
    const [itemImage, setItemImage] = useState(null); 
    const [items, setItems] = useState([]); // To store items for the selected category
    const inRef1 = useRef();
    const inRef2 = useRef();
    const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null); // Store the category to be deleted
    const [activeCategoryId, setActiveCategoryId] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItemToDelete, setSelectedItemToDelete] = useState(null); // Item to delete state 
    const [itemToDelete, setItemToDelete] = useState(null); // State to hold the item to delete

    // Fetch categories and items when the component mounts
    useEffect(() => {
        const categoryRef = dbRef(db, 'categories/');
        onValue(categoryRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const categoryList = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                    items: data[key].items || [], // Ensure items are part of the category data
                }));
                setCategories(categoryList);
            }
        });
    }, []);

    // Trigger file input for category image
    const handleFileInputTrigger = () => {
        inRef1.current.click();
    };

    // Trigger file input for item image
    const handleFileInputTrigger2 = () => {
        inRef2.current.click();
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if(file){
            const fileSizeInKB = file.size / 1024
            if(fileSizeInKB > 50) {
                toast.error("File size must be under 50Kb!")
            }
            else{
                setCategoryImage(file)
                toast.success("File Selected Successfully",{position:'top-center'})
            }
        }
        // setCategoryImage(e.target.files[0]);
        e.target.value = null;
    };

    const handleItemImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileSizeInKB = file.size / 1024;
            if (fileSizeInKB > 50) {
                toast.error('File size must be under 50KB!',{ position:"top-center"});
            } else {
                setItemImage(file); // Only set the image if it's within the size limit
                toast.success("File selected successfully",{})
            }
        }
        e.target.value = null; // Reset file input
    };

    const addCategory = () => {
        if (categoryName && categoryImage) {
            const storage = getStorage();
            const imageRef = storageRef(storage, `categories/${categoryImage.name}`);
            uploadBytes(imageRef, categoryImage).then((snapshot) => {
                getDownloadURL(snapshot.ref).then((downloadURL) => {
                    const newCategoryRef = push(dbRef(db, 'categories/'));
                    const adminId = Math.random().toString(36).substring(2, 15);
                    const randomKey = Math.random().toString(36).substring(2, 15);
                    set(newCategoryRef, {
                        name: categoryName,
                        adminId: adminId,
                        randomKey: randomKey,
                        imageUrl: downloadURL,
                    }).then(() => {
                        setCategoryName('');
                        setCategoryImage(null);
                    });
                });
            });
        } else {
            console.error("Category name and image must be provided");
        }
    };

    const addItem = () => {
        if (itemName && itemPrice && selectedCategory && itemImage) {
            const storage = getStorage();
            const imageRef = storageRef(storage, `items/${itemImage.name}`);
            uploadBytes(imageRef, itemImage).then((snapshot) => {
                getDownloadURL(snapshot.ref).then((downloadURL) => {
                    const newItemRef = push(dbRef(db, `categories/${selectedCategory}/items`));
                    set(newItemRef, {
                        name: itemName,
                        price: itemPrice,
                        imageUrl: downloadURL,
                    }).then(() => {
                        setItemName('');
                        setItemPrice('');
                        setItemImage(null);
                    });
                });
            });
        }
    };

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
        setActiveCategoryId(categoryId)
    
        // Fetch the items for the selected category
        const itemsRef = dbRef(db, `categories/${categoryId}/items`);
        onValue(itemsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const itemList = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                }));
                setItems(itemList);
            } else {
                setItems([]); // Clear items if there are none
            }
        });
    };


    // Function to delete a category
    const deleteCategory = (categoryId) => {
        remove(ref(db, `categories/${categoryId}`))
            .then(() => {
                console.log('Category deleted successfully');
                // Optionally, you can also reset the selected category and items
                setSelectedCategory('');
                setItems([]);
            })
            .catch((error) => {
                console.error("Error deleting category: ", error);
            });
    };

    const openCategoryDeletePopUp = (category) => {
        setCategoryToDelete(category); // Store the category to be deleted
        setCategoryDeletePopUp(true);
    };

    // Handle the click of the edit button for a category
    const handleCategoryEditClick = (category) => {
        setSelectedCategoryForEdit(category); // Set the selected category to edit
        setCategoryEditPopUp(true); // Open the edit popup
    };

    // Function to open the edit pop-up and set the selected item
    const openItemEditPopUp = (item) => {
        setSelectedItem(item); // Set the item to be edited
        setItemEditPopUp(true); // Open the pop-up
    };

    // Function to handle the actual update logic (e.g., Firebase update)
    const handleUpdateItem = (name, price, image) => {
        const itemRef = ref(db, `categories/${selectedCategory}/items/${selectedItem.id}`);
    
        // If an image is selected, upload it first, then update the item with the new image URL.
        if (image) {
            const storage = getStorage();
            const imageRef = storageRef(storage, `items/${image.name}`);
            uploadBytes(imageRef, image).then((snapshot) => {
                getDownloadURL(snapshot.ref).then((downloadURL) => {
                    // Update the item with the new name, price, and image URL
                    set(itemRef, {
                        name: name,
                        price: price,
                        imageUrl: downloadURL,
                    }).then(() => {
                        toast.success("Item updated successfully!");
                    }).catch((error) => {
                        toast.error("Error updating item: " + error.message);
                    });
                });
            });
        } else {
            // If no image is updated, just update the name and price.
            set(itemRef, {
                name: name,
                price: price,
                imageUrl: selectedItem.imageUrl, // Keep the old image URL
            }).then(() => {
                toast.success("Item updated successfully!");
            }).catch((error) => {
                toast.error("Error updating item: " + error.message);
            });
        }
    };

    const deleteItem = (itemId, categoryId) => {
        const itemRef = ref(db, `categories/${categoryId}/items/${itemId}`);
        remove(itemRef)
            .then(() => {
                console.log('Item deleted successfully');
                // Optionally refresh the items list here
            })
            .catch((error) => {
                console.error("Error deleting item: ", error);
            });
    };

    const openItemDeletePopUp = (item) => {
        setItemToDelete(item); // Store the item to be deleted
        setItemDeletePopUp(true);
    };
    
    // const openCategoryEditPopUp = () => setCategoryEditPopUp(!categoryEditPopUp);
    // const openCategoryDeletePopUp = () => setCategoryDeletePopUp(!categoryDeletePopUp);
    // const openItemEditPopUp = () => setItemEditPopUp(!itemEditPopUp);
    // const openItemDeletePopUp = () => setItemDeletePopUp(!itemDeletePopUp);

    return (
        <div className='px-6'>
            <div className='flex justify-between items-center mt-10 flex-col gap-5 overflow-hidden'>
                <div className='relative flex justify-center items-center'>
                    <input type="text" className='outline-none border-none rounded-lg py-2 px-8' placeholder='Search...' />
                    <span className='absolute text-2xl right-2 text-[#80964c] drop-shadow-md flex items-center justify-center'><FiSearch /></span>
                </div>
                <div className='text-2xl font-bold'>Add Categories</div>
                    <ToastContainer/>
                <div className='w-full mb-5'>
                    <input
                        type="text"
                        placeholder='Category Name'
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className='w-full px-8 mb-5 py-3 rounded-xl border-none outline-none'
                    />
                    <input type="file" onChange={handleFileInput} ref={inRef1} className='mb-5 hidden' />
                    <div className='flex justify-center items-center gap-10'>
                        <button className='px-8 py-2 rounded-xl bg-[#fff4] GlassBg font-bold text-[#80964c]' onClick={handleFileInputTrigger}>Select</button>
                        <button onClick={addCategory} className='px-8 py-2 rounded-xl bg-[#fff4] GlassBg font-bold text-[#80964c]'>Upload</button>
                    </div>
                </div>

                <div className='text-2xl font-bold'>Add Items</div>
                <div className='mb-2 flex flex-col gap-5 w-full'>
                    <input
                        type="text"
                        placeholder='Item Name'
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className='py-3 px-8 outline-none border-none rounded-xl w-full'
                    />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className='py-3 px-8 rounded-xl border-none outline-none'
                    >
                        <option value="" selected disabled>Select Category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        placeholder='Item Price'
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                        className='px-8 py-3 rounded-xl border-none outline-none'
                    />
                    <div className='flex justify-center items-center gap-10'>
                        <input type="file" onChange={handleItemImage} ref={inRef2} className='hidden' />
                        <button onClick={handleFileInputTrigger2} className='px-8 py-2 rounded-xl bg-[#fff4] GlassBg font-bold text-[#80964c]'>Select Item Image</button>
                        <button onClick={addItem} className='px-8 py-2 rounded-xl bg-[#fff4] GlassBg font-bold text-[#80964c]'>Add Item</button>
                    </div>
                </div>

                {/* Categories Display */}
                <div className="flex gap-10 overflow-x-auto whitespace-nowrap w-full HideScrollBar">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className={`flex flex-col justify-center items-center flex-shrink-0 cursor-pointer ${activeCategoryId === category.id ? 'active-category text-[#1eb5ad]' : ''}`}
                            onClick={() => handleCategoryClick(category.id)} 
                        >
                            <div className="w-[80px] h-[80px] bg-[#80964c] flex justify-center items-center rounded-lg overflow-hidden">
                                <img src={category.imageUrl} alt={category.name} className='object-cover w-full h-full' />
                            </div>
                            <div className='mt-2 text-lg font-semibold'>{category.name}</div>
                            <div className='flex items-center gap-2'>
                                <div className='cursor-pointer text-[#80964c]' onClick={() => handleCategoryEditClick(category)}><MdModeEdit/></div>
                                <div className='cursor-pointer text-[#80964c]' onClick={(e) => { e.stopPropagation(); openCategoryDeletePopUp(category); }}><MdDelete/></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Items Display */}
                <div className='mt-5 w-full'>
                    {items.length > 0 ? (
                        items.map((item) => (
                            <div key={item.id} className='flex justify-between items-center mb-5 GlassBackground px-2 h-[100px] rounded-2xl'>
                                <div className='flex items-center gap-4'>
                                    <img src={item.imageUrl} alt={item.name} className='w-16 h-16 rounded-lg object-cover GlassBackground' />
                                    <div>
                                        <div className='text-xl font-bold'>{item.name}</div>
                                        <div className='text-lg flex items-center gap-1 font-bold'><TbCurrencyRupee />{item.price}</div>
                                    </div>
                                </div>
                                <div className='flex items-center gap-3'>
                                    
                                    <MdModeEdit className='cursor-pointer text-xl text-[#80964c]' onClick={() => openItemEditPopUp(item)} />
                                    <MdDelete className='cursor-pointer text-xl text-red-500' onClick={() => openItemDeletePopUp(item)}  />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>No items found for this category.</div>
                    )}
                </div>

            </div>

            {/* Category Popups Edit */}
            {categoryEditPopUp && (
                <EditPopUp1
                    setCategoryEditPopUp={setCategoryEditPopUp}
                    category={selectedCategoryForEdit} // Pass the selected category as props
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
