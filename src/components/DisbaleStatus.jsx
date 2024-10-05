import React from 'react'
import alert from "../assets/alert.png"
import { Link } from "react-router-dom"

const DisbaleStatus = () => {
  return (
    <div className='bg-[#d6eda1] flex justify-center items-center h-screen'>
      <div>
        <div className='h-[140px] mb-5'>
            <img src={alert} className='w-full h-full object-contain' alt="" />
        </div>
        <div className='text-center font-bold ItemText text-lg'>Pending Payment !!</div>
        <div className='text-sm'>Please complete your payment to access your account and continue.</div>
        <div className='flex justify-center items-center mt-5'>
            <Link to="/Login">
                <button className='text-sm px-8 py-3 bg-[#fff] GlassBackground rounded-2xl font-bold text-[#ff1717]'>Back to Login</button>
            </Link>
        </div>
      </div>
    </div>
  )
}

export default DisbaleStatus
