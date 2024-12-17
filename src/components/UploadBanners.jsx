import React, { useRef, useState, useEffect } from 'react';
import { storage, db, auth } from './Firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, set, push } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { BiSolidFileImage } from 'react-icons/bi';
import { FaSquarePlus } from 'react-icons/fa6';
import { toast } from 'react-hot-toast';
import { ref as storageRef } from "firebase/storage"; // Ensure correct import for storageRef

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
      const fileSizeInKB = fileData.size / 1024; // Convert size from bytes to KB
      if (fileSizeInKB > 500) {
        // Show an error or pop-up message here
        // alert('File size exceeds the 50KB limit. Please select a smaller file.');
        toast.error("File size must be under 500KB!",{position:'top-center'})
        setIsError(true); 
        return; // Exit the function, do not set the file
      }
      setFile(fileData);
      setFileName(fileData.name);
    } else {
      console.error('No file selected');
    }
  };

  const handleImageUpload = () => {
    if (!file || !user) return;
    setIsLoading(true);
    const storagePathWithUID = `${storagePath}/${user.uid}/${fileName}`; // Include user ID in the path
    const storageRefInstance = storageRef(storage, storagePathWithUID);
    const uploadTask = uploadBytesResumable(storageRefInstance, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setPercentage(Math.round(progress));
      },
      (error) => {
        console.error(error);
        setIsLoading(false);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          const newImageRef = push(dbRef(db, dbPath));
          await set(newImageRef, {
            url,
            adminUID: user.uid // Save admin UID with the image
          });
          setIsLoading(false);
          toast.success("Upload successful!");
        } catch (error) {
          console.error(error);
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
          className="px-8 py-2 bg-[#ffffff4a] text-[#80964c] font-bold rounded-lg flex items-center gap-2 border border-[#fff]"
          onClick={selectImage}
        >
          Select <BiSolidFileImage />
        </button>
        <button
          onClick={handleImageUpload}
          className="px-8 py-2 bg-[#ffffff4a] text-[#80964c] font-bold rounded-lg flex items-center gap-2 border border-[#fff]"
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
