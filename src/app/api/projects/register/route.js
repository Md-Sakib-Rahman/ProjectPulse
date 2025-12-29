import clientPromise from "@/lib/mongodb";
import { verify } from "../../auth/verify";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const { payload } = await request.json();
    const token = request.cookies.get("session")?.value;
    
    if (!token) return NextResponse.json({ success: false, message: "No session found" }, { status: 401 });

    const userRole = await verify(token);
    if (!userRole || userRole !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("projectpulse");

    const dbResponse = await db.collection("projects").insertOne({
      ...payload,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
      healthScore: 100,
      status: "On Track",
    });

    const projectId = dbResponse.insertedId;

    await db.collection("users").updateOne(
      { _id: new ObjectId(payload.client) },
      { $addToSet: { assignedProjects: projectId } }
    );

    const employeeIds = payload.employees.map((id) => new ObjectId(id));
    await db.collection("users").updateMany(
      { _id: { $in: employeeIds } },
      { $addToSet: { assignedProjects: projectId } }
    );

    return NextResponse.json({ success: true, id: projectId });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

