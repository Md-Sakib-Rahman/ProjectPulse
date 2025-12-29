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

    // Update Client: Add project to array
    await db.collection("users").updateOne(
      { _id: new ObjectId(payload.client) },
      { $addToSet: { assignedProjects: projectId } }
    );

    // Update Employees: Add project to array for all assigned members
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
// import clientPromise from "@/lib/mongodb";
// import { verify } from "../../auth/verify";
// import { NextResponse } from "next/server";
// import { ObjectId } from "mongodb";

// export async function POST(request) {
//   const { payload } = await request.json();
//   const token = request.cookies.get("session")?.value;
//   if (!token) {
//     return NextResponse.json(
//       { success: false, message: "No session found" },
//       { status: 401 }
//     );
//   }
//   const userRole = await verify(token);
//   if (!userRole || userRole !== "admin") {
//     return NextResponse.json({
//       success: false,
//       message: "Unauthorized: Admin access required",
//     });
//   }
//   try {
//     const client = await clientPromise;
//     const db = client.db("projectpulse");
//     const dbResponse = await db.collection("projects").insertOne({
//       ...payload,
//       startDate: new Date(payload.startDate),
//       endDate: new Date(payload.endDate),
//       healthScore: 100,
//       status: "On Track",
//     });
//     const clientId = payload.client;

//     const updateClient = await db.collection("users").updateOne(
//       { _id: new ObjectId(clientId) },
//       {
//         $set: { status: "assigned" },
//         $push: { assignedProjects: dbResponse.insertedId },  
//       }
//     );
//     const employeeIds = payload.employees.map((id) => new ObjectId(id));

//     const updateEmployees = await db.collection("users").updateMany(
//       { _id: { $in: employeeIds } },
//       {
//         $set: { status: "assigned" },
//         $push: { assignedProjects: dbResponse.insertedId },
//       }
//     );
//     return NextResponse.json({
//       success: true,
//       id: dbResponse.insertedId,
//     });
//   } catch (error) {
//     console.error("Project Registration Error:", error);
//     return NextResponse.json(
//       { success: false, error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
