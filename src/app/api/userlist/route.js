import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const users = await client
      .db("projectpulse")
      .collection("users")
      .find({})
      .toArray();
       
    return NextResponse.json({ result: "success", data: users });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ result: "failed", message: "failed to load data" }, { status: 500 });
  }
}
