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

    // 🔥 RECALCULATE HEALTH USING THE UNIFIED LOGIC
    // This now correctly factors in: (Confidence + Satisfaction) - Risk Penalties
    await updateProjectHealth(db, projectId);

    revalidatePath(`/dashboard/client/projects/${projectId}`);
    return { success: true };

  } catch (error) {
    return { success: false, error: "Failed to process feedback and update health score." };
  }
}
// export async function saveFeedbackAction(payload) {
//   try {
//     const { checkInId, projectId, satisfactionRating, communicationRating, comments } = payload;
    
//     const client = await clientPromise;
//     const db = client.db("projectpulse");

//     const feedbackResponse = await db.collection("feedbacks").insertOne({
//       checkInId: new ObjectId(checkInId),
//       projectId: new ObjectId(projectId),
//       satisfactionRating,
//       communicationRating,
//       comments,
//       timestamp: new Date()
//     });

//     const feedbackId = feedbackResponse.insertedId;

//     await db.collection("checkins").updateOne(
//       { _id: new ObjectId(checkInId) },
//       { 
//         $set: { 
//           isClientFeedback: true,
//           feedbackId: feedbackId 
//         } 
//       }
//     );

    
//     const recentCheckIns = await db.collection("checkins")
//       .find({ projectId: new ObjectId(projectId), isClientFeedback: true })
//       .sort({ timestamp: -1 })
//       .limit(3)
//       .toArray();

//     const recentFeedbacks = await db.collection("feedbacks")
//       .find({ checkInId: { $in: recentCheckIns.map(c => c._id) } })
//       .toArray();

    
    
//     const avgClientScore = recentFeedbacks.reduce((acc, f) => 
//       acc + ((f.satisfactionRating + f.communicationRating) / 2), 0) / recentFeedbacks.length;
    
//     const avgEmployeeScore = recentCheckIns.reduce((acc, c) => 
//       acc + c.confidenceLevel, 0) / recentCheckIns.length;

//     const finalScore = Math.round(((avgClientScore * 10) + (avgEmployeeScore * 10)) / 2 * 10);
    
//     let status = "On Track";
//     if (finalScore < 60) status = "Critical";
//     else if (finalScore < 80) status = "At Risk";

//     await db.collection("projects").updateOne(
//       { _id: new ObjectId(projectId) },
//       { 
//         $set: { 
//           healthScore: finalScore,
//           status: status
//         } 
//       }
//     );

//     revalidatePath(`/dashboard/client/projects/${projectId}`);
//     return { success: true };

//   } catch (error) {
//     console.error("Feedback Error:", error);
//     return { success: false, error: "Failed to process feedback and update health score." };
//   }
// }