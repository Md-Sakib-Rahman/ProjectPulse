import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { verify } from "../../auth/verify";

export async function GET(request) {
  const {id} = await request.json()  
  const {token} = await request.cookies.get('session').value;
  const user = await verify(token)
  if(!user) return NextResponse.json(
      { error: "Failed Authorize User" },
      { status: 500 }
    );
  try {
    const client = await clientPromise;
    const db = client.db("projectpulse");

    
    const project = await db
      .collection("projects")
      .findOne({_id : new ObjectId(id)})
      .toArray();

    return NextResponse.json(project);
  } catch (error) {
    console.error("Fetch Projects Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}