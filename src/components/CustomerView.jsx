// CustomerView.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { db } from "./Firebase";
import { ref, onValue, get } from "firebase/database";
import { FiSearch } from "react-icons/fi";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import allItemsImage from "../assets/all.jpg";
import { FaPhoneAlt } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebook } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";
import BannerSection from "./BannerSection";
import { HiReceiptTax } from "react-icons/hi";

// small helper: maps some country codes to symbol; fallback to currency code or symbol
const CURRENCY_MAP = {
  IN: { symbol: "₹", code: "INR" },
  US: { symbol: "$", code: "USD" },
  GB: { symbol: "£", code: "GBP" },
  MY: { symbol: "RM", code: "MYR" },
  SA: { symbol: "﷼", code: "SAR" },
  AE: { symbol: "د.إ", code: "AED" },
  QA: { symbol: "﷼", code: "QAR" },
  KW: { symbol: "د.ك", code: "KWD" },
  OM: { symbol: "ر.ع", code: "OMR" },
  BH: { symbol: "ب.د", code: "BHD" },
  // ... add more mappings as needed
};

const getCurrencySymbol = (countryCode, fallbackCurrencyCode = "INR") => {
  if (!countryCode) countryCode = "IN";
  const upper = countryCode.toUpperCase();
  if (CURRENCY_MAP[upper]) return CURRENCY_MAP[upper].symbol || CURRENCY_MAP[upper].code;
  // fallback: show country code or common symbols
  if (upper === "EU") return "€";
  return upper === "IN" ? "₹" : upper; // show code if unknown
};

const CustomerView = () => {
  const { adminId } = useParams();
  const [categories, setCategories] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [banners, setBanners] = useState([]);
  const [socialLinks, setSocialLinks] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState("#d6eda1");
  const [fontColor, setFontColor] = useState("#000");
  const [gstTitle, setGstTitle] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("₹"); // default
  const navigate = useNavigate();
  const categoryRef = useRef(null);
  const [activeCategoryId, setActiveCategoryId] = useState("all");

  // load admin info (for status + country)
  useEffect(() => {
    if (!adminId) return;
    const adminRef = ref(db, `admins/${adminId}`);
    onValue(adminRef, (snapshot) => {
      if (snapshot.exists()) {
        const admin = snapshot.val();
        if (admin.status === "Disable") {
          navigate("/pageNotFound");
        }
        const country = admin.country || "IN";
        const symbol = getCurrencySymbol(country);
        setCurrencySymbol(symbol);
      }
    });
  }, [adminId, navigate]);

  // fetch categories + items (same as before, but make sure to filter by adminId)
  useEffect(() => {
    if (!adminId) return;
    const categoryRefDB = ref(db, `categories/`);
    setIsLoading(true);
    onValue(categoryRefDB, (snapshot) => {
      const data = snapshot.val() || {};
      const allCategory = { id: "all", name: "All", imageUrl: allItemsImage };

      const categoryList = Object.keys(data)
        .filter((key) => data[key].adminId === adminId)
        .map((key) => ({ id: key, ...data[key] }));

      setCategories([allCategory, ...categoryList]);

      // collect all visible items
      let allItemsList = [];
      Object.keys(data)
        .filter((catId) => data[catId].adminId === adminId)
        .forEach((catId) => {
          if (data[catId].items) {
            const items = Object.keys(data[catId].items)
              .filter((itemId) => !data[catId].items[itemId].isHidden)
              .map((itemId) => ({ id: itemId, categoryId: catId, ...data[catId].items[itemId] }));
            allItemsList = [...allItemsList, ...items];
          }
        });
      setAllItems(allItemsList);
      setDisplayedItems(allItemsList);
      setIsLoading(false);
    });
  }, [adminId]);

  // logo
  useEffect(() => {
    if (!adminId) return;
    const logoRef = ref(db, `logos/${adminId}`);
    onValue(logoRef, (snapshot) => {
      if (snapshot.exists()) {
        const logos = snapshot.val();
        const keys = Object.keys(logos);
        if (keys.length) setLogoUrl(logos[keys[0]].url);
      }
    });
  }, [adminId]);

  // banners
  useEffect(() => {
    const bannerRef = ref(db, "offerbanners");
    onValue(bannerRef, (snapshot) => {
      if (snapshot.exists()) {
        const bannerData = snapshot.val();
        const adminBanners = Object.values(bannerData).filter((b) => b.adminUID === adminId);
        setBanners(adminBanners);
      }
    });
  }, [adminId]);

  // social links
  useEffect(() => {
    if (!adminId) return;
    const socialRef = ref(db, `socialLinks/${adminId}`);
    get(socialRef).then((snap) => {
      if (snap.exists()) {
        const links = snap.val();
        const filtered = Object.fromEntries(Object.entries(links).filter(([k,v]) => v && v.trim() !== ""));
        setSocialLinks(filtered);
      }
    });
  }, [adminId]);

  // category click
  const handleCategoryClick = (categoryId) => {
    setActiveCategoryId(categoryId);
    if (categoryId === "all") {
      const filtered = searchTerm2 ? allItems.filter(i => i.name.toLowerCase().includes(searchTerm2.toLowerCase())) : allItems;
      setDisplayedItems(filtered);
    } else {
      const filtered = allItems.filter(i => i.categoryId === categoryId && (!searchTerm2 || i.name.toLowerCase().includes(searchTerm2.toLowerCase())));
      setDisplayedItems(filtered);
    }
  };

  // search items
  useEffect(() => {
    if (activeCategoryId === "all") {
      setDisplayedItems(allItems.filter(i => i.name.toLowerCase().includes(searchTerm2.toLowerCase())));
    } else {
      setDisplayedItems(allItems.filter(i => i.categoryId === activeCategoryId && i.name.toLowerCase().includes(searchTerm2.toLowerCase())));
    }
  }, [searchTerm2, activeCategoryId, allItems]);

  // GST
  useEffect(() => {
    if (!adminId) return;
    const gstRef = ref(db, `adminGST/${adminId}`);
    onValue(gstRef, (snapshot) => {
      if (snapshot.exists()) {
        setGstTitle(snapshot.val().gstTitle);
      }
    });
  }, [adminId]);

  if (isLoading) return <Loader />;

  return (
    <div style={{ backgroundColor }} className="min-h-screen">
      <div>
        <header className="flex justify-center fixed items-center w-full py-2 px-5 bg-[#fff] z-50 rounded-b mb-5">
          <div className="flex items-center justify-between w-full">
            <div className="w-[120px] h-[70px]">{logoUrl && <img src={logoUrl} alt="logo" className="w-full h-full object-contain" />}</div>
            <div className="flex justify-center items-center gap-5 text-2xl">
              {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noreferrer"><AiFillInstagram/></a>}
              {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noreferrer"><FaFacebook/></a>}
              {socialLinks.whatsapp && <a href={socialLinks.whatsapp} target="_blank" rel="noreferrer"><IoLogoWhatsapp/></a>}
              {socialLinks.google && <a href={socialLinks.google} target="_blank" rel="noreferrer"><FcGoogle/></a>}
            </div>
          </div>
        </header>

        <div className="pt-28 px-2">
          <BannerSection banners={banners} />
        </div>

        {gstTitle && (
          <div className="mb-2 px-2 font-semibold flex justify-start items-center gap-2 ItemText" style={{ color: fontColor }}>
            {gstTitle} <HiReceiptTax />
          </div>
        )}

        {/* Categories */}
        <div className="mb-2 px-2">
          <input type="text" placeholder="Search Categories.." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full py-2 px-4 rounded" />
        </div>

        <div className="flex gap-4 overflow-x-auto px-2">
          {categories.map(cat => (
            <div key={cat.id} onClick={() => handleCategoryClick(cat.id)} className={`flex flex-col items-center cursor-pointer ${activeCategoryId === cat.id ? 'text-[#1eb5ad]' : ''}`}>
              <div className="w-[80px] h-[80px] rounded-lg overflow-hidden">
                <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover"/>
              </div>
              <div className="mt-2 font-bold ItemText" style={{ color: activeCategoryId === cat.id ? '#1eb5ad' : fontColor }}>{cat.name}</div>
            </div>
          ))}
        </div>

        {/* Items */}
        <div className="px-2 mt-4">
          <input type="text" placeholder="Search items.." value={searchTerm2} onChange={e => setSearchTerm2(e.target.value)} className="w-full py-2 px-4 rounded" />
        </div>

        <div className="px-2 mt-5">
          {displayedItems.length === 0 ? <div>No items found</div> : displayedItems.map(item => (
            <div key={item.id} className="flex justify-between items-center mb-3 GlassBackground px-2 h-[100px] rounded-2xl">
              <div className="flex items-center gap-4">
                <img src={item.imageUrl} alt={item.name} className="w-16 h-[85px] rounded-lg object-cover"/>
                <div>
                  <div className="text-base font-semibold ItemText leading-tight">{item.name}</div>
                  <div className="flex gap-4 mt-2">
                    {item.price && <div><div className="text-sm font-semibold">Norm</div><div className="text-sm flex items-center gap-1 font-bold ItemText">{currencySymbol}{item.price}</div></div>}
                    {item.price2 && <div><div className="text-sm font-semibold">A/C</div><div className="text-sm flex items-center gap-1 font-bold ItemText">{currencySymbol}{item.price2}</div></div>}
                    {item.price3 && <div><div className="text-sm font-semibold">Parc</div><div className="text-sm flex items-center gap-1 font-bold ItemText">{currencySymbol}{item.price3}</div></div>}
                    {item.price4 && <div><div className="text-sm font-semibold">Combo</div><div className="text-sm flex items-center gap-1 font-bold ItemText">{currencySymbol}{item.price4}</div></div>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default CustomerView;
