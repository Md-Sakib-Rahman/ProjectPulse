const { default: clientPromise } = require("@/lib/mongodb");
const { ObjectId } = require("mongodb");

export async function getClientProjectData(id) {
  try {
    const client = await clientPromise;
    const db = client.db("projectpulse");
    const pId = new ObjectId(id);

    const project = await db.collection("projects").findOne({ _id: pId });
    if (!project) return null;

     
    const allCheckIns = await db.collection("checkins")
      .find({ projectId: pId })
      .sort({ timestamp: -1 })
      .toArray();

   
    const feedbackIds = allCheckIns.map(c => c.feedbackId).filter(Boolean);
    const feedbacks = await db.collection("feedbacks")
      .find({ _id: { $in: feedbackIds } })
      .toArray();

     
    const checkInsWithFeedback = allCheckIns.map(c => ({
      ...c,
      feedback: feedbacks.find(f => f._id.toString() === c.feedbackId?.toString())
    }));

    return {
      ...project,
      pendingCheckIns: checkInsWithFeedback.filter(c => !c.isClientFeedback).reverse(),  
      completedCheckIns: checkInsWithFeedback.filter(c => c.isClientFeedback)  
    };
  } catch (e) {
    return null;
  }
}