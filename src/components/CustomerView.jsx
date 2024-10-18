import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './Firebase';
import { ref, onValue } from 'firebase/database';
import { FiSearch } from "react-icons/fi";
import { TbCurrencyRupee } from "react-icons/tb";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import allItemsImage from "../assets/all.jpg"
import { FaPhoneAlt } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebook } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import {useNavigate} from "react-router-dom"
import { get } from "firebase/database";


const CustomerView = () => {
    const { adminId } = useParams();
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [activeCategoryId, setActiveCategoryId] = useState('all');
    const [logoUrl, setLogoUrl] = useState('');
    const [banners, setBanners] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchTerm2, setSearchTerm2] = useState('');
    const [allItems, setAllItems] = useState([]); // Store all items
    const [displayedItems, setDisplayedItems] = useState([]); // Items to display
    const [socialLinks, setSocialLinks] = useState({});
    const navigate = useNavigate()


    console.log("AdminId Is",adminId)
    useEffect(()=>{
        const adminData = ref(db,`admins/${adminId}`)
        onValue(adminData,(snapshot)=>{
            if(snapshot.exists()){
                const storeAdminData = snapshot.val()
                console.log("Store Admin Data",storeAdminData)
                if(storeAdminData.status === "Disable"){
                    navigate('/pageNotFound')
                }
            }
        })
    },[adminId])

    // Fetch logo
    useEffect(() => {
        const logoRef = ref(db, `logos/${adminId}`);
        console.log("admin id",adminId)
        console.log("logo display",logoRef)
        onValue(logoRef, (snapshot) => {
            console.log("snapshot",snapshot.val())
            if (snapshot.exists()) {
                const logos = snapshot.val();
                console.log("logo only",logos)
                const logoKeys = Object.keys(logos);
                console.log("logo keys",logoKeys)
                if (logoKeys.length > 0) {
                    setLogoUrl(logos[logoKeys[0]].url);
                }
            }
        });
    }, [adminId]);

    // Fetch banners
    useEffect(() => {
        const bannerRef = ref(db, 'offerbanners');
        onValue(bannerRef, (snapshot) => {
            if (snapshot.exists()) {
                const bannerData = snapshot.val();
                // Filter banners for the specific admin
                const adminBanners = Object.values(bannerData).filter(
                    banner => banner.adminUID === adminId
                );
                setBanners(adminBanners);
            }
        });
    }, [adminId]);

      // Fetch categories and all items
      // Modify the useEffect hook that fetches items in CustomerView.jsx
    useEffect(() => {
        const categoryRef = ref(db, `categories/`);
        onValue(categoryRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                // Add "All" category first
                const allCategory = {
                    id: 'all',
                    name: 'All',
                    imageUrl: allItemsImage
                };
                
                const categoryList = Object.keys(data).filter((key)=>data[key].adminId===adminId).map((key) => ({
                    id: key,
                    ...data[key],
                }));

                setCategories([allCategory, ...categoryList]);

                // Collect all visible items across categories
                let allItemsList = [];
                Object.keys(data)
                .filter((categoryId) => data[categoryId].adminId === adminId) // Filter by adminId
                .forEach((categoryId) => {
                    console.log(`Data for category ${categoryId}:`, data[categoryId]);
                    // console.log("items is",categoryId)
                    if (data[categoryId].items) {
                        console.log("hey hello")
                        const categoryItems = Object.keys(data[categoryId].items)
                            .filter(itemId => !data[categoryId].items[itemId].isHidden) // Only include visible items
                            .map(itemId => ({
                                id: itemId,
                                categoryId,
                                ...data[categoryId].items[itemId]
                            }));
                        allItemsList = [...allItemsList, ...categoryItems];
                    }
                });
                console.log("All Item is",allItemsList)
                setAllItems(allItemsList);
                setDisplayedItems(allItemsList);
            }
        });
    }, [adminId]);

    const handleCategoryClick = (categoryId) => {
        setActiveCategoryId(categoryId);
        
        if (categoryId === 'all') {
            // Show all items, filtered by search term if any
            const filtered = searchTerm2 
                ? allItems.filter(item => item.name.toLowerCase().includes(searchTerm2.toLowerCase()))
                : allItems;
            setDisplayedItems(filtered);
        } else {
            // Show items from selected category, filtered by search term if any
            const filtered = allItems.filter(item => 
                item.categoryId === categoryId && 
                (!searchTerm2 || item.name.toLowerCase().includes(searchTerm2.toLowerCase()))
            );
            setDisplayedItems(filtered);
        }
    };

    // Handle item search
    useEffect(() => {
        if (activeCategoryId === 'all') {
            const filtered = allItems.filter(item =>
                item.name.toLowerCase().includes(searchTerm2.toLowerCase())
            );
            setDisplayedItems(filtered);
        } else {
            const filtered = allItems.filter(item =>
                item.categoryId === activeCategoryId &&
                item.name.toLowerCase().includes(searchTerm2.toLowerCase())
            );
            setDisplayedItems(filtered);
        }
    }, [searchTerm2, activeCategoryId, allItems]);


    // Filter categories based on search
    const filteredCategories = categories.filter((category) =>
        category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter items based on search
    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm2.toLowerCase())
    );

    
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: false,
        arrows: false
    };

    useEffect(() => {
        const loadSocialLinks = async () => {
            const socialLinksRef = ref(db, `socialLinks/${adminId}`);
            const snapshot = await get(socialLinksRef);
            
            if (snapshot.exists()) {
                // Only store links that are not empty strings
                const links = snapshot.val();
                const filteredLinks = Object.fromEntries(
                    Object.entries(links).filter(([_, value]) => value && value.trim() !== '')
                );
                setSocialLinks(filteredLinks);
            }
        };
    
        if (adminId) {
            loadSocialLinks();
        }
    }, [adminId]);

    return (
        <div className=''>
            {/* Logo Section */}
            <header className='flex justify-center fixed items-center w-full py-2 px-5 bg-[#fff] z-50 rounded-b mb-5'>
                <div className='flex items-center justify-between w-full'>
                    {logoUrl && (
                        <img src={logoUrl} alt="Logo" className="w-[100px] h-[80px] object-contain" />
                    )}
                    <div className='flex justify-center items-center gap-2'>
                        {socialLinks.instagram && (
                            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                                <div className='text-[#d62976] cursor-pointer'><AiFillInstagram/></div>
                            </a>
                        )}
                        {socialLinks.facebook && (
                            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                                <div className='text-[#4267B2] cursor-pointer'><FaFacebook/></div>
                            </a>
                        )}
                        {socialLinks.whatsapp && (
                            <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                                <div className='text-[#25D366] cursor-pointer'><IoLogoWhatsapp/></div>
                            </a>
                        )}
                        {socialLinks.google && (
                            <a href={socialLinks.google} target="_blank" rel="noopener noreferrer">
                                <div className='cursor-pointer'><FcGoogle/></div>
                            </a>
                        )}
                    </div>
                </div>
            </header>

            {/* Banner Section */}
            <div className='pt-28 mb-10'>
                {banners.length > 0 ? (
                    <Slider {...settings} className="mx-auto">
                        {banners.map((banner, index) => (
                            <div
                                key={index}
                                className="w-full relative h-[150px] px-2 rounded-3xl shadow-[0_3px_10px_rgb(0,0,0,0.2)] lg:h-[400px]"
                            >
                                <img
                                    src={banner.url}
                                    className="w-full h-full rounded-3xl object-cover"
                                    alt={`offer-poster-${index + 1}`}
                                />
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <div className="grid place-items-center text-center">No banners available</div>
                )}
            </div>

            {/* Categories Section */}
            <div className='flex justify-start items-start mb-5 px-2'>
                <div className='relative flex justify-start items-center'>
                    <input 
                        type="text" 
                        className='outline-none border-none rounded-lg py-2 px-8'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder='Search Categories..'
                    />
                    <span className='absolute text-2xl right-2 text-[#80964c] drop-shadow-md flex items-center justify-center'>
                        <FiSearch />
                    </span>
                </div>
            </div>

            <div className="flex gap-10 overflow-x-auto whitespace-nowrap w-full HideScrollBar mb-10 px-2">
                {filteredCategories.map((category) => (
                    <div
                        key={category.id}
                        className={`flex flex-col justify-center items-center flex-shrink-0 cursor-pointer 
                            ${activeCategoryId === category.id ? 'active-category text-[#1eb5ad]' : ''}`}
                        onClick={() => handleCategoryClick(category.id)}
                    >
                        <div className="w-[80px] h-[80px] bg-[#80964c] flex justify-center items-center rounded-lg overflow-hidden">
                            <img src={category.imageUrl} alt={category.name} className='object-cover w-full h-full' />
                        </div>
                        <div className='mt-2 font-bold text-[11px] lg:text-lg ItemText'>{category.name}</div>
                    </div>
                ))}
            </div>

            {/* Items Section */}
            <div className='flex justify-start items-start mb-5 px-2'>
                <div className='relative flex justify-start items-center'>
                    <input 
                        type="text" 
                        className='outline-none border-none rounded-lg py-2 px-8'
                        value={searchTerm2}
                        onChange={(e) => setSearchTerm2(e.target.value)}
                        placeholder='Search items...'
                    />
                    <span className='absolute text-2xl right-2 text-[#80964c] drop-shadow-md flex items-center justify-center'>
                        <FiSearch />
                    </span>
                </div>
            </div>

            <div className='mt-5 w-full px-2 mb-20'>
                {displayedItems.length > 0 ? (
                    displayedItems.map((item) => (
                        <div key={item.id} className='flex justify-between items-center mb-5 GlassBackground px-2 h-[80px] rounded-2xl'>
                            <div className='flex items-center gap-4'>
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className='w-16 h-16 rounded-lg object-cover GlassBackground'
                                />
                                <div>
                                    <div className='text-md font-bold ItemText'>{item.name}</div>
                                    <div className='text-md flex items-center gap-1 font-bold ItemText'>
                                        <TbCurrencyRupee />
                                        {item.price}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='text-center'>No items found.</div>
                )}
            </div>
            {/* Footer */}
            <div className='bg-[#fff] w-full py-2 px-2 flex flex-col justify-center items-center fixed bottom-0'>
                <div className='text-center flex flex-col justify-center items-center text-[10px] text-[#383636] ItemText'>Design and Developed by <span className='block text-sm font-semibold text-[#80964c]'>IMC Business Solutions</span>
                <span className=' flex justify-center items-center gap-2 font-bold text-[#383636]'><FaPhoneAlt className='text-[#80964c]'/>+91 7593820007</span>
                </div>
            </div>
        </div>
    );
};


export default CustomerView;