import { cookies } from "next/headers";
import { getID } from "@/app/api/auth/verify"; // Your server-side function
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  
  if (!token) return NextResponse.json({ userId: null }, { status: 401 });

  const userId = await getID(token);
  return NextResponse.json({ userId });
}