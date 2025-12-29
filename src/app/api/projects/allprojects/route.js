import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("projectpulse");

    
    const projects = await db
      .collection("projects")
      .find({})
      .sort({ startDate: -1 })  
      .toArray();

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Fetch Projects Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}