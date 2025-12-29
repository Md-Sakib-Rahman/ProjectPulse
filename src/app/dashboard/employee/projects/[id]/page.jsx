import React from 'react';
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import BackButton from '@/compenets/BackButton/BackButton';
import RiskItemModal from '@/compenets/RiskItemModal/RiskItemModal';
import EmployeeCheckInModal from '@/compenets/EmployeeCheckInModal/EmployeeCheckInModal';
import ResolveRiskButton from '@/compenets/ResolveRiskButton/ResolveRiskButton';

async function getEmployeeProjectData(id) {
  try {
    const client = await clientPromise;
    const db = client.db("projectpulse");
    const pId = new ObjectId(id);

    const project = await db.collection("projects").findOne({ _id: pId });
    if (!project) return null;

    // Fetch Team for display
    const team = await db.collection("users").find(
      { _id: { $in: project.employees.map(empId => new ObjectId(empId)) } }
    ).toArray();
    const activeRisks = await db.collection("risks").find({
      projectId: pId,
      status: "Open"
    }).toArray();
    // Fetch History: Check-ins merged with Feedbacks
    const history = await db.collection("checkins")
      .aggregate([
        { $match: { projectId: pId } },
        { $sort: { timestamp: -1 } },
        {
          $lookup: {
            from: "feedbacks",
            localField: "feedbackId",
            foreignField: "_id",
            as: "clientResponse"
          }
        },
        { $unwind: { path: "$clientResponse", preserveNullAndEmptyArrays: true } }
      ]).toArray();

    return { ...project, team, history, activeRisks };
  } catch (e) {
    return null;
  }
}

const EmployeeProjectDetails = async ({ params }) => {
  const { id } = await params;
  const project = await getEmployeeProjectData(id);

  if (!project) return <div className="p-10 text-center">Project not found.</div>;
  const getSeverityColor = (severity) => {
    if (severity === "High") return "text-red-600 font-bold";
    if (severity === "Medium") return "text-orange-500 font-bold";
    return "text-blue-500 font-bold";
  };  
  const healthColor = project.healthScore >= 80 ? "text-green-500" : 
                      project.healthScore >= 60 ? "text-orange-500" : "text-red-500";

  return (
    <div className="w-11/12 mx-auto py-10 space-y-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start border-b pb-6 gap-4">
        <div>
          <BackButton />
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">{project.description}</p>
        </div>
        <div className="flex gap-3">
          <RiskItemModal projectId={id} />
          <EmployeeCheckInModal projectId={id} />
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 border rounded-xl shadow-sm">
          <div className="stat-title text-xs uppercase font-bold">Health Score</div>
          <div className={`stat-value ${healthColor}`}>{project.healthScore}%</div>
          <div className="stat-desc font-medium uppercase">{project.status}</div>
        </div>
        <div className="stat bg-base-100 border rounded-xl shadow-sm">
          <div className="stat-title text-xs uppercase font-bold">Total Check-ins</div>
          <div className="stat-value text-primary">{project.history?.length || 0}</div>
        </div>
        <div className="stat bg-base-100 border rounded-xl shadow-sm">
          <div className="stat-title text-xs uppercase font-bold">Active Risks</div>
          <div className="stat-value text-error">{project.riskCount || 0}</div>
        </div>
        <div className="stat bg-base-100 border rounded-xl shadow-sm">
          <div className="stat-title text-xs uppercase font-bold">Deadline</div>
          <div className="stat-value text-sm mt-2">{new Date(project.endDate).toLocaleDateString()}</div>
        </div>
      </div>

      {/* ACTIVITY & FEEDBACK HISTORY TABLE */}
      <section>
        <h3 className="text-xl font-bold mb-6">Activity Log & Client Feedback</h3>
        <div className="overflow-x-auto border rounded-xl">
          <table className="table w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Date</th>
                <th>Your Summary</th>
                <th>Confidence</th>
                <th>Client Feedback</th>
              </tr>
            </thead>
            <tbody>
              {project.history?.map((entry) => (
                <tr key={entry._id} className="hover">
                  <td className="whitespace-nowrap font-medium">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </td>
                  <td className="max-w-xs">
                    <p className="font-bold text-xs uppercase text-slate-400">Progress:</p>
                    <p className="text-sm line-clamp-2">{entry.progressSummary}</p>
                  </td>
                  <td>
                    <div className="badge badge-outline">{entry.confidenceLevel}/5</div>
                  </td>
                  <td>
                    {entry.clientResponse ? (
                      <div className="text-xs">
                        <p className="text-green-600 font-bold italic">"{entry.clientResponse.comments}"</p>
                        <p className="mt-1 opacity-50">Rating: {entry.clientResponse.satisfactionRating}/5</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Awaiting client response...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="bg-red-50 p-6 rounded-2xl border border-red-200 shadow-sm">
        <h3 className="text-xl font-bold text-red-800 mb-6 flex items-center gap-2">
          🚩 Active Risks (Action Required)
        </h3>
        {project.activeRisks?.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-xl border border-red-100">
            <table className="table w-full">
              <thead>
                <tr className="bg-red-100/50 text-red-900">
                  <th>Title</th>
                  <th>Severity</th>
                  <th>Mitigation Plan</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {project.activeRisks.map((risk) => (
                  <tr key={risk._id.toString()}>
                    <td className="font-semibold">{risk.title}</td>
                    <td>
                      <span className={getSeverityColor(risk.severity)}>
                        {risk.severity}
                      </span>
                    </td>
                    <td className="text-xs max-w-xs italic">{risk.mitigationPlan}</td>
                    <td className="text-right">
                      <ResolveRiskButton 
                        riskId={risk._id.toString()} 
                        projectId={id}
                        riskTitle={risk.title}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-green-700 font-medium">
            ✅ No active risks found for this project.
          </div>
        )}
      </section>
    </div>
  );
};

export default EmployeeProjectDetails;