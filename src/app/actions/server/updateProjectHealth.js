
import {ObjectId} from "mongodb";
export async function updateProjectHealth(db, projectId) {
  const pId = new ObjectId(projectId);

  const recentCheckIns = await db.collection("checkins")
    .find({ projectId: pId })
    .sort({ timestamp: -1 })
    .limit(3)
    .toArray();

  const feedbackIds = recentCheckIns.map(c => c.feedbackId).filter(Boolean);
  const recentFeedbacks = await db.collection("feedbacks")
    .find({ _id: { $in: feedbackIds } })
    .toArray();

  const avgEmployeeScore = recentCheckIns.length > 0 
    ? recentCheckIns.reduce((acc, c) => acc + c.confidenceLevel, 0) / recentCheckIns.length 
    : 5;

  let avgClientScore = avgEmployeeScore; 
  if (recentFeedbacks.length > 0) {
    avgClientScore = recentFeedbacks.reduce((acc, f) => 
      acc + ((f.satisfactionRating + f.communicationRating) / 2), 0) / recentFeedbacks.length;
  }

  let activityScore = ((avgClientScore + avgEmployeeScore) / 10) * 100;

  const openRisks = await db.collection("risks")
    .find({ projectId: pId, status: "Open" })
    .toArray();

  const penalty = openRisks.reduce((acc, risk) => {
    if (risk.severity === "High") return acc + 15;
    if (risk.severity === "Medium") return acc + 8; 
    return acc + 3;
  }, 0);

  const finalScore = Math.max(0, Math.min(100, Math.round(activityScore - penalty)));

  let status = "On Track";
  if (finalScore < 60) status = "Critical";
  else if (finalScore < 80) status = "At Risk";

  await db.collection("projects").updateOne(
    { _id: pId },
    { $set: { healthScore: finalScore, status: status } }
  );
}