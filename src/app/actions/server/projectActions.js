"use server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { updateProjectHealth } from "./updateProjectHealth";

 export async function completeProjectAction(projectId) {
  try {
    const client = await clientPromise;
    const db = client.db("projectpulse");

    await db.collection("projects").updateOne(
      { _id: new ObjectId(projectId) },
      { $set: { status: "Completed" } }
    );

    revalidatePath(`/dashboard/admin/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
export async function submitCheckInAction(payload) {
  try {
    const client = await clientPromise;
    const db = client.db("projectpulse");

    const checkInData = {
      projectId: new ObjectId(payload.projectId),
      employeeId: payload.employeeId,
      progressSummary: payload.progressSummary,
      blockers: payload.blockers,
      confidenceLevel: Number(payload.confidenceLevel),
      completionPercentage: Number(payload.completionPercentage),
      isClientFeedback: false,
      timestamp: new Date(),
    };

    await db.collection("checkins").insertOne(checkInData);

    // Update Project meta data
    await db.collection("projects").updateOne(
      { _id: new ObjectId(payload.projectId) },
      { $set: { lastCheckinDate: new Date() } }
    );

    // 🔥 RECALCULATE HEALTH IMMEDIATELY
    await updateProjectHealth(db, payload.projectId);

    revalidatePath(`/dashboard/employee/projects/${payload.projectId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
export async function logRiskAction(payload) {
  try {
    const client = await clientPromise;
    const db = client.db("projectpulse");

    // 1. Create the detailed Risk document
    const riskData = {
      projectId: new ObjectId(payload.projectId),
      employeeId: payload.employeeId,
      title: payload.title,
      description: payload.description,
      severity: payload.severity, // Low, Medium, High
      mitigationPlan: payload.mitigationPlan,
      status: "Open",
      createdAt: new Date(),
      resolvedAt: null,
    };

    const result = await db.collection("risks").insertOne(riskData);

    // 2. Increment the aggregate riskCount in the Project document
    await db
      .collection("projects")
      .updateOne(
        { _id: new ObjectId(payload.projectId) },
        { $inc: { riskCount: 1 } }
      );
    // ... after inserting risk and incrementing riskCount
    await updateProjectHealth(db, payload.projectId);
    revalidatePath(`/dashboard/employee/projects/${payload.projectId}`);
    revalidatePath(`/dashboard/employee/projects/${payload.projectId}`);
    return { success: true, id: result.insertedId.toString() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function resolveRiskAction(riskId, projectId) {
  try {
    const client = await clientPromise;
    const db = client.db("projectpulse");

    await db
      .collection("risks")
      .updateOne(
        { _id: new ObjectId(riskId) },
        { $set: { status: "Resolved", resolvedAt: new Date() } }
      );

    // Decrement the active risk count on the project
    await db
      .collection("projects")
      .updateOne({ _id: new ObjectId(projectId) }, { $inc: { riskCount: -1 } });
    // ... after marking risk as Resolved and decrementing riskCount
    await updateProjectHealth(db, projectId);
    revalidatePath(`/dashboard/employee/projects/${projectId}`);
    revalidatePath(`/dashboard/employee/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
