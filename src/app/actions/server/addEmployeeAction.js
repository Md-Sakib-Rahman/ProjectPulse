"use server"
import { verify } from "@/app/api/auth/verify";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
export async function addEmployeeToProject(projectId, employeeId) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const role = await verify(token);

    if (role !== "admin") return { success: false, error: "Not Authorized" };

    const client = await clientPromise;
    const db = client.db("projectpulse");

    await db.collection("projects").updateOne(
      { _id: new ObjectId(projectId) },
      { $addToSet: { employees: employeeId } }
    );

    await db.collection("users").updateOne(
      { _id: new ObjectId(employeeId) },
      { $addToSet: { assignedProjects: new ObjectId(projectId) } }
    );

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Internal Server Error" };
  }
}
  