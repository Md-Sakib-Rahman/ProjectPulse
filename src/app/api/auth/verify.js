import clientPromise from "@/lib/mongodb";
import { jwtVerify } from "jose";
import { ObjectId } from "mongodb";
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
export const verify = async (token) => {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    const client = await clientPromise;
    const user = await client
      .db("projectpulse")
      .collection("users")
      .findOne({ _id: new ObjectId(payload.userId) });
    const userRole = user.role;
    return userRole
  } catch (error) {
    console.log("from verify js: ",error)
    return null
  }
};
export const getID = async (token)=>{
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload.userId
    
  } catch (error) {
    console.log("from verify js: ",error)
    return null
  }
}
