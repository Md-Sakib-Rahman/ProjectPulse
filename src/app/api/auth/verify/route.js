import { NextResponse } from "next/server";
import { verify } from "../verify";

export async function POST(request) {
   
  const {token} = await request.json()
  const result = await verify(token)
  return NextResponse.json(result)  
}