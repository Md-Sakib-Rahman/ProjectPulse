"use server"
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { updateProjectHealth } from "./updateProjectHealth";
export async function saveFeedbackAction(payload) {
  try {
    const { checkInId, projectId, satisfactionRating, communicationRating, comments } = payload;
    
    const client = await clientPromise;
    const db = client.db("projectpulse");

    const feedbackResponse = await db.collection("feedbacks").insertOne({
      checkInId: new ObjectId(checkInId),
      projectId: new ObjectId(projectId),
      satisfactionRating: Number(satisfactionRating),
      communicationRating: Number(communicationRating),
      comments,
      timestamp: new Date()
    });

    await db.collection("checkins").updateOne(
      { _id: new ObjectId(checkInId) },
      { 
        $set: { 
          isClientFeedback: true,
          feedbackId: feedbackResponse.insertedId 
        } 
      }
    );

 
    await updateProjectHealth(db, projectId);

    revalidatePath(`/dashboard/client/projects/${projectId}`);
    return { success: true };

  } catch (error) {
    return { success: false, error: "Failed to process feedback and update health score." };
  }
}
