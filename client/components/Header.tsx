
import Link from 'next/link'
import React from 'react'

const Header = () => {
  return (
    <div className="flex flex-row w-full h-4 p-10 bg-white shadow-sm justify-between items-center text-black">
      <div className='flex items-center gap-3'>
        <div className="bg-black p-[0.5rem] w-10 h-10 rounded-full">
            <h1 className="text-white font-bold text-3xl text-center">V</h1>
            
        </div>
           <h3 className='font-semibold'>VIZYO SYNC</h3>
        </div>
        <nav>
            <ul className='flex flex-row gap-4 justify-between items-center text-black'>
                <li>Home</li>
                <li>Services</li>
                <li>Plan</li>
                <li>Q&A</li>
                <li>contact</li>

                
            </ul>
        </nav>

        <div className='flex flex-row gap-2 '>
            <h4 ><Link href="/login" className="hover:text-gray-200">login</Link></h4>
        </div>
    </div> 
     )
}

export default Header
