import React, { useRef, useState, useEffect } from 'react';
import { storage, db, auth } from './Firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, set, push } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { BiSolidFileImage } from 'react-icons/bi';
import { FaSquarePlus } from 'react-icons/fa6';

const UploadBanners = ({ storagePath, dbPath }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [user, setUser] = useState(null);
  const inRef = useRef();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const selectImage = () => {
    inRef.current.click();
  };

  const handleInputFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      let fileData = e.target.files[0];
      setFile(fileData);
      setFileName(fileData.name);
    } else {
      console.error('No file selected');
    }
  };

  const handleImageUpload = () => {
    if (!file || !user) return;
    setIsLoading(true);
    const storageRef = ref(storage, `${storagePath}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setPercentage(Math.round(progress));
      },
      (error) => {
        setIsError(true);
        setIsLoading(false);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          const newImageRef = push(dbRef(db, dbPath));
          const randomKey = newImageRef.key;

          // Save the image URL and admin UID to the database
          await set(newImageRef, {
            url,
            adminUID: user.uid,
            randomKey
          });

          setIsLoading(false);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 5000);
        } catch (error) {
          setIsError(true);
          setIsLoading(false);
        }
      }
    );
  };

  return (
    <div>
      <input type="file" accept="image/*" ref={inRef} className="hidden" onChange={handleInputFile} />
      <div className="flex justify-center items-center gap-10 mt-5">
        <button
          className="px-8 py-2 bg-[#ffffff4a] text-white font-bold rounded-lg flex items-center gap-2"
          onClick={selectImage}
        >
          Select <BiSolidFileImage />
        </button>
        <button
          onClick={handleImageUpload}
          className="px-8 py-2 bg-[#ffffff4a] text-white font-bold rounded-lg flex items-center gap-2"
        >
          Upload <FaSquarePlus />
        </button>
      </div>

      <div className="text-center mt-10">
        {isLoading && (
          <span className="text-sm md:text-xl font-semibold">
            Loading... {percentage}% 
          </span>
        )}
        {isError && (
          <span className="text-sm md:text-xl font-semibold">
            Error Uploading File
          </span>
        )}
        {showSuccess && (
          <span className="text-sm md:text-xl font-semibold">
            Uploaded Successfully!
          </span>
        )}
      </div>
    </div>
  );
};

export default UploadBanners;
