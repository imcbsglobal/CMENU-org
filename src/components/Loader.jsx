import React from 'react'
import loader from "../assets/loader.mp4"

const Loader = () => {
  return (
    <div className=' fixed top-0 bottom-0 right-0 left-0 bg-[#fff] z-50 w-full h-full flex justify-center items-center'>
        <div>
            <video src={loader} type="video/mp4" autoPlay muted loop className='w-auto h-[170px]'></video>
        </div>
    </div>
  )
}

export default Loader
