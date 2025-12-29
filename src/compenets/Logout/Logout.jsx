"use client"
import { signOut } from '@/app/actions/server/auth'
import React from 'react'

const Logout = () => {
  return (
    <button onClick={() => signOut()} className="btn btn-primary">Logout</button>
  )
}

export default Logout
