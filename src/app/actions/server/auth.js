"use server" 
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import { verify } from "@/app/api/auth/verify";
import { redirect } from "next/navigation";


const secretKey = new TextEncoder().encode(process.env.JWT_SECRET)
export async function createSession(userId) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
   
  const session = await new SignJWT({ userId: userId.toString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey)
  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true, 
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}


export const login = async (payload)=>{
  const {email, password} = payload;
  if(!email || !password ) return null;
  
  const client = await clientPromise
  const user = await client.db("projectpulse").collection("users").findOne({email})
  if(!user) return null;
  const isMatch = await bcrypt.compare(password, user.password)
  if(!isMatch) return null
  await createSession(user._id) 
  return {_id: user._id.toString(), email: user.email, name:user.name, role:user.role }
}
export const Register = async (payload) => {
  const { email, password, name, role } = payload;
  const cookieStorage = await cookies();
  const token = cookieStorage.get("session")?.value;
  const userRole = await verify(token);

  if (!userRole || userRole !== "admin") return null;

  const client = await clientPromise;
  const isExists = await client.db("projectpulse").collection("users").findOne({ email });
  if (isExists) return null;

  const password_hashed = await bcrypt.hash(password, 10);
  
  // Base schema for all users
  let newUser = {
    name,
    email,
    password: password_hashed,
    role,
    assignedProjects: [], // Initialize as empty array
    createdAt: new Date()
  };

  // Add role-specific fields
  if (role === "client") newUser.company = payload.company;
  else if (role === "employee") newUser.designation = payload.designation;

  const result = await client.db("projectpulse").collection("users").insertOne(newUser);
  return result.insertedId ? { success: true, id: result.insertedId.toString() } : null;
};

export async function signOut() {
  const cookieStore = await cookies(); 
  cookieStore.delete('session'); 
  redirect('/');
}
