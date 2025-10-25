// CustomerView.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./Firebase";
import { ref, onValue, get } from "firebase/database";
import { FiSearch } from "react-icons/fi";
import { MdInfo } from "react-icons/md";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import allItemsImage from "../assets/all.jpg";
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebook } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import Loader from "./Loader";
import BannerSection from "./BannerSection";
import { HiReceiptTax } from "react-icons/hi";
import { TbCurrencyRupee } from "react-icons/tb";

const CURRENCY_MAP = {
  IN: { symbol: "₹", code: "INR" },
  US: { symbol: "$", code: "USD" },
  GB: { symbol: "£", code: "GBP" },
  MY: { symbol: "RM", code: "MYR" },
  SA: { symbol: "﷼", code: "SAR" },
  AE: { symbol: "د.إ", code: "AED" },
  QA: { symbol: "ر.ق", code: "QAR" },
  KW: { symbol: "KWD", code: "KWD" },
  OM: { symbol: "ر.ع.", code: "OMR" },
  BH: { symbol: "ب.د", code: "BHD" },
  JO: { symbol: "د.ا", code: "JOD" },
  LB: { symbol: "ل.ل", code: "LBP" },
  EG: { symbol: "ج.م", code: "EGP" },
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

const getCurrencySymbol = (code) => {
  if (!code) return "₹";
  const up = code.toUpperCase();
  if (CURRENCY_MAP[up]) return CURRENCY_MAP[up].symbol;
  if (up === "EU") return "€";
  return "₹";
};

const CustomerView = () => {
  const { adminId } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [logoUrl, setLogoUrl] = useState("");
  const [banners, setBanners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const [socialLinks, setSocialLinks] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState("#d6eda1");
  const [fontColor, setFontColor] = useState("#000");
  const [gstTitle, setGstTitle] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const categoryRef = useRef(null);
  const [showNotePopup, setShowNotePopup] = useState(false);
  const [selectedNote, setSelectedNote] = useState('');

  // amount icons state (from amountIcons/{adminId})
  const [amountIcons, setAmountIcons] = useState({});

  useEffect(() => {
    if (!adminId) return;
    const adminRef = ref(db, `admins/${adminId}`);
    onValue(adminRef, (snapshot) => {
      if (snapshot.exists()) {
        const admin = snapshot.val();
        if (admin.status === "Disable") navigate("/pageNotFound");
      }
    });
  }, [adminId, navigate]);

  // fetch colors (if saved)
  useEffect(() => {
    if (!adminId) return;
    const colorRef = ref(db, `adminColors/${adminId}`);
    onValue(colorRef, snap => {
      if (snap.exists()) setBackgroundColor(snap.val().color);
    });
    const fontRef = ref(db, `adminFontColors/${adminId}`);
    onValue(fontRef, snap => {
      if (snap.exists()) setFontColor(snap.val().fontColor || snap.val().fontcolor);
    });
  }, [adminId]);

  // load currency (tries adminCountry then fallback to admins/{adminId}.country)
  useEffect(() => {
    if (!adminId) return;
    const loadCurrency = async () => {
      // try adminCountry first
      const countryRef = ref(db, `adminCountry/${adminId}`);
      const snap = await get(countryRef);
      if (snap.exists()) {
        const val = snap.val();
        setCurrencySymbol(val.symbol || getCurrencySymbol(val.code || val.currencyCode));
        return;
      }
      // fallback to admins/{adminId}.country
      const adminRef = ref(db, `admins/${adminId}`);
      const adminSnap = await get(adminRef);
      if (adminSnap.exists()) {
        const c = adminSnap.val().country;
        setCurrencySymbol(getCurrencySymbol(c));
        return;
      }
      // default
      setCurrencySymbol("₹");
    };
    loadCurrency();
  }, [adminId]);

  // fetch logos
  useEffect(() => {
    if (!adminId) return;
    const logoRef = ref(db, `logos/${adminId}`);
    onValue(logoRef, (snapshot) => {
      if (snapshot.exists()) {
        const logos = snapshot.val();
        const logoKeys = Object.keys(logos || {});
        if (logoKeys.length > 0) {
          const first = logos[logoKeys[0]];
          setLogoUrl(first?.url || "");
        }
      }
    });
  }, [adminId]);

  // fetch banners
  useEffect(() => {
    if (!adminId) return;
    const bannerRef = ref(db, "offerbanners");
    onValue(bannerRef, (snapshot) => {
      if (snapshot.exists()) {
        const bannerData = snapshot.val();
        const adminBanners = Object.values(bannerData).filter(b => b.adminUID === adminId);
        setBanners(adminBanners);
      }
    });
  }, [adminId]);

  // fetch categories + aggregate items
  useEffect(() => {
    if (!adminId) return;
    const catRef = ref(db, `categories/`);
    setIsLoading(true);
    onValue(catRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const allCategory = {
          id: "all", name: "All", imageUrl: allItemsImage
        };
        const list = Object.keys(data)
          .filter(k => data[k].adminId === adminId)
          .map(k => ({ id: k, ...data[k] }));
        setCategories([allCategory, ...list]);

        // aggregate items
        let aggregated = [];
        Object.keys(data)
          .filter(cid => data[cid].adminId === adminId)
          .forEach(cid => {
            const cat = data[cid];
            if (cat.items) {
              Object.keys(cat.items).forEach(iid => {
                const it = cat.items[iid];
                if (!it.isHidden) aggregated.push({ id: iid, categoryId: cid, ...it });
              });
            }
          });
        setAllItems(aggregated);
        setDisplayedItems(aggregated);
      } else {
        setCategories([{ id: "all", name: "All", imageUrl: allItemsImage }]);
        setAllItems([]);
        setDisplayedItems([]);
      }
      setIsLoading(false);
    });
  }, [adminId]);

  // load social links
  useEffect(() => {
    if (!adminId) return;
    const loadSocialLinks = async () => {
      const socialRef = ref(db, `socialLinks/${adminId}`);
      const snap = await get(socialRef);
      if (snap.exists()) {
        const links = snap.val();
        const filtered = Object.fromEntries(Object.entries(links).filter(([_, v]) => v && v.toString().trim() !== ""));
        setSocialLinks(filtered);
      }
    };
    loadSocialLinks();
  }, [adminId]);

  // Load amount icons (prefer amountIcons/{adminId}, fallback to admins/{adminId}/amountIcons)
  useEffect(() => {
    if (!adminId) return;
    const primary = ref(db, `amountIcons/${adminId}`);
    onValue(primary, snap => {
      if (snap.exists()) {
        setAmountIcons(snap.val() || {});
      } else {
        // fallback to admins/{adminId}/amountIcons
        get(ref(db, `admins/${adminId}/amountIcons`)).then(snap2 => {
          if (snap2.exists()) setAmountIcons(snap2.val() || {});
        }).catch(() => {});
      }
    });
  }, [adminId]);

  // sticky category observer (same as before)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { /* no-op, you already manage classes on scroll below */ },
      { rootMargin: "-96px 0px 0px 0px", threshold: 0 }
    );
    if (categoryRef.current) observer.observe(categoryRef.current);
    return () => { if (categoryRef.current) observer.unobserve(categoryRef.current); };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const stickyCategory = document.getElementById("stickyCategory");
      if (!stickyCategory) return;
      const stickyNow = stickyCategory.getBoundingClientRect().top <= 0;
      if (stickyNow) stickyCategory.classList.add("border-visible");
      else stickyCategory.classList.remove("border-visible");
    };
    document.addEventListener("scroll", onScroll);
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  // GST
  useEffect(() => {
    if (!adminId) return;
    const gstRef = ref(db, `adminGST/${adminId}`);
    onValue(gstRef, snap => {
      if (snap.exists()) setGstTitle(snap.val().gstTitle || '');
    });
  }, [adminId]);

  // handle category click
  const handleCategoryClick = (categoryId) => {
    setActiveCategoryId(categoryId);
    if (categoryId === "all") setDisplayedItems(allItems);
    else setDisplayedItems(allItems.filter(i => i.categoryId === categoryId));
  };

  // filtered category list from search
  const filteredCategories = categories.filter(c => (c?.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  // items filtered by searchTerm2 from displayedItems
  const filteredDisplayedItems = displayedItems.filter(i => i.name.toLowerCase().includes(searchTerm2.toLowerCase()));

  const settings = { dots: true, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, autoplay: true };

  // helper to choose icon url if exists
  const iconFor = (key) => {
    if (!amountIcons) return null;
    // prefer exact keys
    if (amountIcons[key]) return amountIcons[key];
    // synonyms
    const map = {
      price: ["price", "norm", "normal"],
      price2: ["price2", "ac", "a_c"],
      price3: ["price3", "parc", "parcel"],
      price4: ["price4", "combo"]
    };
    for (const k in map) {
      if (map[k].includes(key)) {
        if (amountIcons[k]) return amountIcons[k];
        for (const s of map[k]) if (amountIcons[s]) return amountIcons[s];
      }
    }
    return amountIcons.norm || amountIcons.price || null;
  };

  const handleShowNote = (note) => {
    setSelectedNote(note);
    setShowNotePopup(true);
  };

  // Note Popup Modal
  const NotePopup = ({ note, onClose }) => {
    if (!note) return null;
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60' onClick={onClose}>
        <div className='bg-white rounded-xl p-6 w-full max-w-md mx-4' onClick={(e) => e.stopPropagation()}>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-xl font-semibold'>Description</h3>
            <button onClick={onClose} className='text-2xl hover:text-red-600'>✕</button>
          </div>
          <p className='text-gray-700 whitespace-pre-wrap'>{note}</p>
          <div className='flex justify-end mt-4'>
            <button onClick={onClose} className='px-6 py-2 rounded-lg bg-[#80964c] text-white font-semibold'>Close</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor }} className="min-h-screen">
      {isLoading ? <Loader /> : (
        <>
          <header className="flex justify-center fixed items-center w-full py-2 px-5 bg-[#fff] z-50 rounded-b">
            <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
              <div className="w-[120px] h-[70px]">
                {logoUrl && <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />}
              </div>
              <div className="flex justify-center items-center gap-5 text-2xl">
                {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noreferrer"><div className="text-[#d62976] cursor-pointer"><AiFillInstagram/></div></a>}
                {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noreferrer"><div className="text-[#4267B2] cursor-pointer"><FaFacebook/></div></a>}
                {socialLinks.whatsapp && <a href={socialLinks.whatsapp} target="_blank" rel="noreferrer"><div className="text-[#25D366] cursor-pointer"><IoLogoWhatsapp/></div></a>}
                {socialLinks.google && <a href={socialLinks.google} target="_blank" rel="noreferrer"><div className="cursor-pointer"><FcGoogle/></div></a>}
              </div>
            </div>
          </header>

          <div className="pt-24 mb-10">
            {banners.length > 0 && (
              <div className="max-w-6xl mx-auto px-4">
                <Slider {...settings} className="mx-auto">
                  {banners.map((banner, idx) => (
                    <div key={idx} className="w-full relative h-[150px] px-2 rounded-3xl shadow-[0_3px_10px_rgb(0,0,0,0.2)] lg:h-[400px]">
                      <img src={banner.url} className="w-full h-full rounded-3xl object-cover" alt={`offer-${idx}`} />
                    </div>
                  ))}
                </Slider>
              </div>
            )}
          </div>

          {gstTitle && <div className="mb-2 px-2 font-semibold flex justify-start items-center gap-2 ItemText max-w-6xl mx-auto" style={{ color: fontColor }}>{gstTitle} <HiReceiptTax/></div>}

          <div className="flex justify-start items-start mb-3 px-2 max-w-6xl mx-auto">
            <div className="relative flex justify-start items-center w-full">
              <input type="text" className="outline-none border-none rounded-lg py-2 px-8 w-full" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder="Search Categories.." />
              <span className="absolute text-2xl right-2 text-[#80964c] drop-shadow-md flex items-center justify-center"><FiSearch/></span>
            </div>
          </div>

          <div ref={categoryRef} id="stickyCategory" className="flex gap-10 overflow-x-auto whitespace-nowrap w-full HideScrollBar mb-2 px-2 backdrop-blur-xl sticky top-0 z-50" style={{ backgroundColor }}>
            <div className="max-w-6xl mx-auto flex gap-10 w-full px-2">
              {filteredCategories.map(category => (
                <div key={category.id} className={`flex flex-col justify-center items-center flex-shrink-0 cursor-pointer ${activeCategoryId === category.id ? "active-category text-[#1eb5ad]" : ""}`} onClick={() => handleCategoryClick(category.id)}>
                  <div className="w-[80px] h-[80px] bg-[#80964c] flex justify-center items-center rounded-lg overflow-hidden">
                    <img src={category.imageUrl} alt={category.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="mt-2 font-bold text-[13px] lg:text-lg ItemText" style={{ color: activeCategoryId === category.id ? "#1eb5ad" : fontColor }}>
                    {category.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-start items-start mb-5 px-2 max-w-6xl mx-auto">
            <div className="relative flex justify-start items-center w-full">
              <input type="text" className="outline-none border-none rounded-lg py-2 px-8 w-full" value={searchTerm2} onChange={(e)=>setSearchTerm2(e.target.value)} placeholder="Search items..." />
              <span className="absolute text-2xl right-2 text-[#80964c] drop-shadow-md flex items-center justify-center"><FiSearch/></span>
            </div>
          </div>

          <div className="mt-5 w-full px-2 pb-16 max-w-6xl mx-auto">
            {filteredDisplayedItems.length > 0 ? filteredDisplayedItems.map(item => (
              <div key={item.id} className="flex justify-between items-center mb-3 GlassBackground px-2 h-[100px] rounded-2xl">
                <div className="flex items-center gap-4">
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-[85px] rounded-lg object-cover GlassBackground" />
                  <div>
                    <div className="text-base font-semibold ItemText leading-tight flex items-center gap-2">
                      {item.name}
                      {item.note && (
                        <button 
                          onClick={() => handleShowNote(item.note)} 
                          className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                          title="View description"
                        >
                          <MdInfo size={20} />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-4 mt-1">
                      {item.price && (
                        <div className="flex flex-col justify-center items-center">
                          <div className="text-sm font-semibold flex items-center gap-1">
                            {iconFor("price") && <img src={iconFor("price")} alt="norm-icon" className="w-5 h-5 mr-1 object-contain" />}
                            Norm
                          </div>
                          <div className="text-sm flex items-center gap-1 font-bold ItemText">
                            <span className="font-medium">{currencySymbol}</span>
                            {item.price}
                          </div>
                        </div>
                      )}
                      {item.price2 && (
                        <div className="flex flex-col justify-center items-center">
                          <div className="text-sm font-semibold flex items-center gap-1">
                            {iconFor("price2") && <img src={iconFor("price2")} alt="ac-icon" className="w-5 h-5 mr-1 object-contain" />}
                            A/C
                          </div>
                          <div className="text-sm flex items-center gap-1 font-bold ItemText">
                            <span className="font-medium">{currencySymbol}</span>
                            {item.price2}
                          </div>
                        </div>
                      )}
                      {item.price3 && (
                        <div className="flex flex-col justify-center items-center">
                          <div className="text-sm font-semibold flex items-center gap-1">
                            {iconFor("price3") && <img src={iconFor("price3")} alt="parc-icon" className="w-5 h-5 mr-1 object-contain" />}
                            Parc
                          </div>
                          <div className="text-sm flex items-center gap-1 font-bold ItemText">
                            <span className="font-medium">{currencySymbol}</span>
                            {item.price3}
                          </div>
                        </div>
                      )}
                      {item.price4 && (
                        <div className="flex flex-col justify-center items-center">
                          <div className="text-sm font-semibold flex items-center gap-1">
                            {iconFor("price4") && <img src={iconFor("price4")} alt="combo-icon" className="w-5 h-5 mr-1 object-contain" />}
                            Combo Price
                          </div>
                          <div className="text-sm flex items-center gap-1 font-bold ItemText">
                            <span className="font-medium">{currencySymbol}</span>
                            {item.price4}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center">No items found.</div>
            )}
          </div>

          <div className="bg-[#fff] w-full py-2 px-2 flex flex-col justify-center items-center fixed bottom-0 z-50">
            <div className="text-center flex flex-col justify-center items-center text-[10px] text-[#383636] ItemText">
              Powered by{" "}
              <a href="https://imcbsglobal.com/">
                <span className="block text-sm font-semibold text-[#80964c]">IMC Business Solutions</span>
              </a>
            </div>
          </div>

          {showNotePopup && (
            <NotePopup
              note={selectedNote}
              onClose={() => { setShowNotePopup(false); setSelectedNote(''); }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CustomerView;