import { getID, verify } from '@/app/api/auth/verify'
import Client from '@/compenets/ClientRootComponent/Client'
import { cookies } from 'next/headers'
import React from 'react'

const page = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  const userID = token ? await getID(token) :  null;
  const userRole = token ? await verify(token) :  null;

  return (
    <div>
      <Client id={userID.toString()} role={userRole}/>
    </div>
  )
}

export default page
