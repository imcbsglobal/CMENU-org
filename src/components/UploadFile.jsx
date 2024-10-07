import React, { useRef, useState, useEffect } from 'react';
import { storage, db } from './Firebase';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, set, push } from 'firebase/database';
import { BiSolidFileImage } from 'react-icons/bi';
import { FaSquarePlus } from 'react-icons/fa6';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const UploadFile = ({ user }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const inRef = useRef();

  // Ensure that user is authenticated before allowing upload
  useEffect(() => {
    if (!user) {
      setIsError(true);
    }
    console.log("user is",user)
  }, [user]);

  const selectImage = () => {
    inRef.current.click();
  };

  const handleInputFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileData = e.target.files[0];
      // Check if file size exceeds 50KB
      const fileSizeInKB = fileData.size / 1024; // Convert size from bytes to KB
      if (fileSizeInKB > 50) {
        // Show an error or pop-up message here
        // alert('File size exceeds the 50KB limit. Please select a smaller file.');
        toast.error("File size exceeds the 50KB limit. Please select a smaller file.")
        setIsError(true); // Set error state to true
        return; // Exit the function, do not set the file
      }
      setFile(fileData);
      setFileName(fileData.name); // Save the original file name
      setIsError(false); // Reset error state on file selection
    } else {
      console.error('No file selected');
    }
  };

  const handleImageUpload = () => {
    if (!file || !user) return; // Ensure user is defined and file is selected

    setIsLoading(true);
    const filePath = `logos/${user.uid}/${fileName}`;
    const storageRefPath = storageRef(storage, filePath); // Correct usage of storage ref

    const uploadTask = uploadBytesResumable(storageRefPath, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setPercentage(Math.round(progress));
      },
      (error) => {
        console.error("Error during upload:", error); // Log specific error
        setIsError(true);
        setIsLoading(false);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          const newImageRef = push(dbRef(db, `logos/${user.uid}`));
          const randomKey = newImageRef.key;

          await set(newImageRef, {
            url,
            adminUID: user.uid,
            randomKey,
          });

          setIsLoading(false);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 5000);
        } catch (error) {
          console.error("Error getting download URL or saving to database:", error); // Log error details
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
          <span className="text-sm md:text-xl font-semibold text-red-600">
            Error Uploading File
          </span>
        )}
        {showSuccess && (
          <span className="text-sm md:text-xl font-semibold text-green-600">
            Uploaded Successfully!
          </span>
        )}
      </div>
    </div>
  );
};

export default UploadFile;
