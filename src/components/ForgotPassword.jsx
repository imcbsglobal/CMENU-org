import React from 'react'

const ForgotPassword = ({setOpenForgotPassword}) => {
  return (
    <div className=' fixed top-0 bottom-0 left-0 right-0 bg-[rgba(0,0,0,0.35)] z-[50] backdrop-blur-3xl flex justify-center items-center px-2'>
      <div className='bg-[#ffffff] w-full lg:w-[600px] h-[230px] rounded-3xl backdrop-blur-xl border-[1px] border-[#fff] py-2 px-2'>
        <div className='text-center font-bold text-[#51841a] mb-10 text-2xl'>Reset Password</div>
        <input type="email" className='pl-4 inputBg w-full py-2 rounded-lg mb-10 border-none outline-none text-[#fff]' placeholder='Enter Your Email' />
        <div className='flex justify-center items-center gap-10'>
            <button className='px-8 py-2 rounded-lg bg-[#51841a] font-bold text-[#fff]' onClick={()=>setOpenForgotPassword(false)}>Cancel</button>
            <button className='px-8 py-2 rounded-lg bg-[#51841a] font-bold text-[#fff]'>Reset</button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
