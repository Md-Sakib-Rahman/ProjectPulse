
import {ObjectId} from "mongodb";
export async function updateProjectHealth(db, projectId) {
  const pId = new ObjectId(projectId);

  // 1. Fetch recent check-ins & feedbacks
  const recentCheckIns = await db.collection("checkins")
    .find({ projectId: pId })
    .sort({ timestamp: -1 })
    .limit(3)
    .toArray();

  const feedbackIds = recentCheckIns.map(c => c.feedbackId).filter(Boolean);
  const recentFeedbacks = await db.collection("feedbacks")
    .find({ _id: { $in: feedbackIds } })
    .toArray();

  // 2. Calculate Base Activity Score (Scale 0-100)
  const avgEmployeeScore = recentCheckIns.length > 0 
    ? recentCheckIns.reduce((acc, c) => acc + c.confidenceLevel, 0) / recentCheckIns.length 
    : 5; // Default to mid-high if no data

  let avgClientScore = avgEmployeeScore; 
  if (recentFeedbacks.length > 0) {
    avgClientScore = recentFeedbacks.reduce((acc, f) => 
      acc + ((f.satisfactionRating + f.communicationRating) / 2), 0) / recentFeedbacks.length;
  }

  let activityScore = ((avgClientScore + avgEmployeeScore) / 10) * 100;

  // 3. Calculate Risk Penalty (Only for "Open" risks)
  const openRisks = await db.collection("risks")
    .find({ projectId: pId, status: "Open" })
    .toArray();

  const penalty = openRisks.reduce((acc, risk) => {
    if (risk.severity === "High") return acc + 15; // -15 points
    if (risk.severity === "Medium") return acc + 8; // -8 points
    return acc + 3; // -3 points for Low
  }, 0);

  // 4. Final Calculation (Clamp between 0 and 100)
  const finalScore = Math.max(0, Math.min(100, Math.round(activityScore - penalty)));

  // 5. Determine Status
  let status = "On Track";
  if (finalScore < 60) status = "Critical";
  else if (finalScore < 80) status = "At Risk";

  // 6. Update Project Document
  await db.collection("projects").updateOne(
    { _id: pId },
    { $set: { healthScore: finalScore, status: status } }
  );
}