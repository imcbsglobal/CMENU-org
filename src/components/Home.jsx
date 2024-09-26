import React from 'react'
import Navbar from './Navbar'
import BannerSlider from './BannerSlider'
import Category from './Category'
import { Outlet } from 'react-router-dom';


const Home = () => {
  return (
    <div>
        <div>
            <Navbar/>
        </div>
        <div>
            <BannerSlider/>
        </div>
        <div>
            <Category/>
        </div>
         {/* Dynamic Items Display */}
         <div className=''>
            <Outlet /> {/* Will display category-specific content */}
          </div>
    </div>
  )
}

export default Home
