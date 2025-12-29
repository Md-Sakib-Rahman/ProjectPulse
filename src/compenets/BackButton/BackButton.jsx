"use client"
import { useRouter } from 'next/navigation';
import React from 'react'
import { FaArrowLeft } from 'react-icons/fa6';

const BackButton = () => {
    const router = useRouter();
  return (
    <button onClick={()=> router.back()} className='border rounded-full p-2 mb-2'>
              <FaArrowLeft/>
            </button>
  )
}

export default BackButton
