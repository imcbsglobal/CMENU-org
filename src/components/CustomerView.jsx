import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./Firebase";
import { ref, onValue, get } from "firebase/database";
import { FiSearch } from "react-icons/fi";
import { TbCurrencyRupee } from "react-icons/tb";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import allItemsImage from "../assets/all.jpg";
import { FaPhoneAlt } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebook } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import Loader from "./Loader";
import BannerSection from "./BannerSection";
import { HiReceiptTax } from "react-icons/hi";

const CustomerView = () => {
  const { adminId } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [logoUrl, setLogoUrl] = useState("");
  const [banners, setBanners] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const [allItems, setAllItems] = useState([]); // Store all items
  const [displayedItems, setDisplayedItems] = useState([]); // Items to display
  const [socialLinks, setSocialLinks] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const categoryRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#d6eda1"); // Default color
  const [fontColor, setFontColor] = useState("#000"); // Default color
  const [gstTitle, setGstTitle] = useState(""); // State for GST title

  useEffect(() => {
    if (!adminId) return;
    const adminData = ref(db, `admins/${adminId}`);
    onValue(adminData, (snapshot) => {
      if (snapshot.exists()) {
        const storeAdminData = snapshot.val();
        if (storeAdminData.status === "Disable") {
          navigate("/pageNotFound");
        }
      }
    });
  }, [adminId, navigate]);

  useEffect(() => {
    if (!adminId) return;

    // Listen for background color changes
    const colorRef = ref(db, `adminColors/${adminId}`);
    onValue(colorRef, (snapshot) => {
      if (snapshot.exists()) {
        setBackgroundColor(snapshot.val().color);
      }
    });

    // Listen for font color changes
    const fontColorRef = ref(db, `adminFontColors/${adminId}`);
    onValue(fontColorRef, (snapshot) => {
      if (snapshot.exists()) {
        setFontColor(snapshot.val().fontColor || snapshot.val().fontcolor);
      }
    });
  }, [adminId]);

  // Fetch logo
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

  // Fetch banners
  useEffect(() => {
    if (!adminId) return;
    const bannerRef = ref(db, "offerbanners");
    onValue(bannerRef, (snapshot) => {
      if (snapshot.exists()) {
        const bannerData = snapshot.val();
        const adminBanners = Object.values(bannerData).filter(
          (banner) => banner.adminUID === adminId
        );
        setBanners(adminBanners);
      }
    });
  }, [adminId]);

  // Fetch categories and all items
  useEffect(() => {
    if (!adminId) return;
    const categoryRefDb = ref(db, `categories/`);
    setIsLoading(true);
    onValue(categoryRefDb, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        const allCategory = {
          id: "all",
          name: "All",
          imageUrl: allItemsImage,
        };

        const categoryList = Object.keys(data)
          .filter((key) => data[key].adminId === adminId)
          .map((key) => ({
            id: key,
            ...data[key],
          }));

        setCategories([allCategory, ...categoryList]);

        // Collect all visible items across categories
        let allItemsList = [];
        Object.keys(data)
          .filter((categoryId) => data[categoryId].adminId === adminId)
          .forEach((categoryId) => {
            if (data[categoryId].items) {
              const categoryItems = Object.keys(data[categoryId].items)
                .filter((itemId) => !data[categoryId].items[itemId].isHidden)
                .map((itemId) => ({
                  id: itemId,
                  categoryId,
                  ...data[categoryId].items[itemId],
                }));
              allItemsList = [...allItemsList, ...categoryItems];
            }
          });

        setAllItems(allItemsList);
        setDisplayedItems(allItemsList);
      } else {
        setCategories([{ id: "all", name: "All", imageUrl: allItemsImage }]);
        setAllItems([]);
        setDisplayedItems([]);
      }
      setIsLoading(false);
    });
  }, [adminId]);

  const handleCategoryClick = (categoryId) => {
    setActiveCategoryId(categoryId);

    if (categoryId === "all") {
      const filtered = searchTerm2
        ? allItems.filter((item) =>
            item.name.toLowerCase().includes(searchTerm2.toLowerCase())
          )
        : allItems;
      setDisplayedItems(filtered);
    } else {
      const filtered = allItems.filter(
        (item) =>
          item.categoryId === categoryId &&
          (!searchTerm2 ||
            item.name.toLowerCase().includes(searchTerm2.toLowerCase()))
      );
      setDisplayedItems(filtered);
    }
  };

  // Handle item search
  useEffect(() => {
    if (!activeCategoryId) return;
    if (activeCategoryId === "all") {
      const filtered = allItems.filter((item) =>
        item.name.toLowerCase().includes(searchTerm2.toLowerCase())
      );
      setDisplayedItems(filtered);
    } else {
      const filtered = allItems.filter(
        (item) =>
          item.categoryId === activeCategoryId &&
          item.name.toLowerCase().includes(searchTerm2.toLowerCase())
      );
      setDisplayedItems(filtered);
    }
  }, [searchTerm2, activeCategoryId, allItems]);

  // Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    (category?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load social links (only non-empty)
  useEffect(() => {
    if (!adminId) return;
    const loadSocialLinks = async () => {
      const socialLinksRef = ref(db, `socialLinks/${adminId}`);
      const snapshot = await get(socialLinksRef);
      if (snapshot.exists()) {
        const links = snapshot.val();
        const filteredLinks = Object.fromEntries(
          Object.entries(links).filter(
            ([_, value]) => value && value.toString().trim() !== ""
          )
        );
        setSocialLinks(filteredLinks);
      }
    };
    loadSocialLinks();
  }, [adminId]);

  // Sticky category observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { rootMargin: "-96px 0px 0px 0px", threshold: 0 }
    );

    if (categoryRef.current) {
      observer.observe(categoryRef.current);
    }

    return () => {
      if (categoryRef.current) {
        observer.unobserve(categoryRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const stickyCategory = document.getElementById("stickyCategory");
      if (!stickyCategory) return;
      const stickyNow = stickyCategory.getBoundingClientRect().top <= 0;
      if (stickyNow) {
        stickyCategory.classList.add("border-visible");
      } else {
        stickyCategory.classList.remove("border-visible");
      }
    };
    document.addEventListener("scroll", onScroll);
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  // Load saved GST title from Firebase
  useEffect(() => {
    if (!adminId) return;
    const gstRef = ref(db, `adminGST/${adminId}`);
    onValue(gstRef, (snapshot) => {
      if (snapshot.exists()) {
        const savedGstTitle = snapshot.val().gstTitle;
        setGstTitle(savedGstTitle);
      }
    });
  }, [adminId]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: false,
    arrows: false,
  };

  return (
    <div style={{ backgroundColor }} className="min-h-screen">
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div>
            {/* Logo Section */}
            <header className="flex justify-center fixed items-center w-full py-2 px-5 bg-[#fff] z-50 rounded-b">
              <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
                <div className="w-[120px] h-[70px]">
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <div className="flex justify-center items-center gap-5 text-2xl">
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="text-[#d62976] cursor-pointer">
                        <AiFillInstagram />
                      </div>
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="text-[#4267B2] cursor-pointer">
                        <FaFacebook />
                      </div>
                    </a>
                  )}
                  {socialLinks.whatsapp && (
                    <a
                      href={socialLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="text-[#25D366] cursor-pointer">
                        <IoLogoWhatsapp />
                      </div>
                    </a>
                  )}
                  {socialLinks.google && (
                    <a
                      href={socialLinks.google}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="cursor-pointer">
                        <FcGoogle />
                      </div>
                    </a>
                  )}
                </div>
              </div>
            </header>

            {/* Banners */}
            <div className="pt-24 mb-10">
              {banners.length > 0 && (
                <div className="max-w-6xl mx-auto px-4">
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
                </div>
              )}
            </div>

            {/* GST Display */}
            {gstTitle && (
              <div
                className="mb-2 px-2 font-semibold flex justify-start items-center gap-2 ItemText max-w-6xl mx-auto"
                style={{ color: fontColor }}
              >
                {gstTitle}
                <span>
                  <HiReceiptTax />
                </span>
              </div>
            )}

            {/* Categories Search */}
            <div className="flex justify-start items-start mb-3 px-2 max-w-6xl mx-auto">
              <div className="relative flex justify-start items-center w-full">
                <input
                  type="text"
                  className="outline-none border-none rounded-lg py-2 px-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Categories.."
                />
                <span className="absolute text-2xl right-2 text-[#80964c] drop-shadow-md flex items-center justify-center">
                  <FiSearch />
                </span>
              </div>
            </div>

            {/* Categories Row */}
            <div
              ref={categoryRef}
              id="stickyCategory"
              className="flex gap-10 overflow-x-auto whitespace-nowrap w-full HideScrollBar mb-2 px-2 backdrop-blur-xl sticky top-0 z-50"
              style={{ backgroundColor }}
            >
              <div className="max-w-6xl mx-auto flex gap-10 w-full px-2">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`flex flex-col justify-center items-center flex-shrink-0 cursor-pointer ${
                      activeCategoryId === category.id ? "active-category text-[#1eb5ad]" : ""
                    }`}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <div className="w-[80px] h-[80px] bg-[#80964c] flex justify-center items-center rounded-lg overflow-hidden">
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div
                      className="mt-2 font-bold text-[13px] lg:text-lg ItemText"
                      style={{
                        color: activeCategoryId === category.id ? "#1eb5ad" : fontColor,
                      }}
                    >
                      {category.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Items Search */}
            <div className="flex justify-start items-start mb-5 px-2 max-w-6xl mx-auto">
              <div className="relative flex justify-start items-center w-full">
                <input
                  type="text"
                  className="outline-none border-none rounded-lg py-2 px-8 w-full"
                  value={searchTerm2}
                  onChange={(e) => setSearchTerm2(e.target.value)}
                  placeholder="Search items..."
                />
                <span className="absolute text-2xl right-2 text-[#80964c] drop-shadow-md flex items-center justify-center">
                  <FiSearch />
                </span>
              </div>
            </div>

            {/* Items List */}
            <div className="mt-5 w-full px-2 pb-16 max-w-6xl mx-auto">
              {displayedItems.length > 0 ? (
                displayedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center mb-3 GlassBackground px-2 h-[100px] rounded-2xl"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-[85px] rounded-lg object-cover GlassBackground"
                      />
                      <div>
                        <div className="text-base font-semibold ItemText leading-tight">
                          {item.name}
                        </div>
                        <div className="flex gap-4 mt-1">
                          {item.price && (
                            <div className="flex flex-col justify-center items-center">
                              <div className="text-sm font-semibold">Norm</div>
                              <div className="text-sm flex items-center gap-1 font-bold ItemText">
                                <TbCurrencyRupee />
                                {item.price}
                              </div>
                            </div>
                          )}
                          {item.price2 && (
                            <div className="flex flex-col justify-center items-center">
                              <div className="text-sm font-semibold">A/C</div>
                              <div className="text-sm flex items-center gap-1 font-bold ItemText">
                                <TbCurrencyRupee />
                                {item.price2}
                              </div>
                            </div>
                          )}
                          {item.price3 && (
                            <div className="flex flex-col justify-center items-center">
                              <div className="text-sm font-semibold">Parc</div>
                              <div className="text-sm flex items-center gap-1 font-bold ItemText">
                                <TbCurrencyRupee />
                                {item.price3}
                              </div>
                            </div>
                          )}
                          {item.price4 && (
                            <div className="flex flex-col justify-center items-center">
                              <div className="text-sm font-semibold">Combo Price</div>
                              <div className="text-sm flex items-center gap-1 font-bold ItemText">
                                <TbCurrencyRupee />
                                {item.price4}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center">No items found.</div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#fff] w-full py-2 px-2 flex flex-col justify-center items-center fixed bottom-0 z-50">
              <div className="text-center flex flex-col justify-center items-center text-[10px] text-[#383636] ItemText">
                Powered by{" "}
                <a href="https://imcbsglobal.com/">
                  <span className="block text-sm font-semibold text-[#80964c]">
                    IMC Business Solutions
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerView;
