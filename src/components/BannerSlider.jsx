import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { ref, onValue, remove } from 'firebase/database';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { auth, db, storage } from './Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import UploadBanners from './UploadBanners';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const BannerSlider = () => {
  const [posters, setPosters] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch banners from Firebase Realtime Database
    const dbRef = ref(db, 'offerbanners');
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      const fetchedPosters = [];
      for (let key in data) {
        if (key !== 'latest') {
          fetchedPosters.push({ key, ...data[key] });
        }
      }
      setPosters(fetchedPosters);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (key, url) => {
    try {
      // Extract the file name from the URL
      const fileName = url.split('/').pop().split('?')[0];

      // Delete from Firebase Realtime Database
      await remove(ref(db, `offerbanners/${key}`));

      // Delete from Firebase Storage
      const postersRef = storageRef(storage, `offerbanners/${fileName}`);
      await deleteObject(postersRef);

      // Remove from local state
      setPosters(posters.filter((poster) => poster.key !== key));
    } catch (error) {
      console.error('Error deleting poster:', error);
    }
  };

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

  return (
    <div>
      <section className="mt-10 mb-5">
        <div className="flex justify-center items-center font-bold text-2xl mb-5">
          Upload Your Banners
        </div>
        <Slider {...settings} className="mx-auto">
          {posters.length > 0 ? (
            posters.map((poster, index) => (
              <div
                key={index}
                className="w-full relative h-[200px] px-2 rounded-3xl shadow-[0_3px_10px_rgb(0,0,0,0.2)] lg:h-[400px]"
              >
                <img
                  src={poster.url}
                  className="w-full h-full rounded-3xl object-cover"
                  alt={`offer-poster-${index + 1}`}
                />
                {user && (
                  <div className="absolute bottom-10 left-[50%] translate-x-[-50%]">
                    <button
                      onClick={() => handleDelete(poster.key, poster.url)}
                      className="px-8 py-1 mt-1 rounded-3xl bg-red-600 text-white font-bold"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="grid place-items-center">Loading...</div>
          )}
        </Slider>
      </section>

      {user && (
        <UploadBanners storagePath="offerbanners" dbPath="offerbanners" />
      )}
    </div>
  );
};

export default BannerSlider;
