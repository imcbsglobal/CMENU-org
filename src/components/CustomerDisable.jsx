import React from 'react'
import NotFound from "../assets/404.png"

const CustomerDisable = () => {
  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='max-w-[700px] w-full'>
        <div className='h-[150px] lg:h-[250px]'>
            <img src={NotFound} className='w-full h-full object-contain drop-shadow-md' alt="" />
        </div>
        <div className='text-[32px] font-bold ItemText text-center lg:text-[40px]'>404 Page Not Found</div>
        <div className='text-center px-2 text-sm lg:text-[16px]'>Lorem ipsum dolor sit amet consectetur adipisicing elit.voluptatum quibusdam a quia ipsam?</div>
      </div>
    </div>
  )
}

export default CustomerDisable
