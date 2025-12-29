import React from "react";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import AddEmployeeButton from "@/compenets/AddEmployeeButton/AddEmployeeButton";
import RemoveEmployeeButton from "@/compenets/RemoveEmployeeButton/RemoveEmployeeButton";
import ResolveRiskButton from "@/compenets/ResolveRiskButton/ResolveRiskButton";
import CompleteProjectButton from "@/compenets/CompleteProjectButton/CompleteProjectButton";

async function getProjectData(id) {
  try {
    const client = await clientPromise;
    const db = client.db("projectpulse");
    const pId = new ObjectId(id);

    const project = await db.collection("projects").findOne({ _id: pId });
    if (!project) return null;

    const clientData = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(project.client) },
        { projection: { name: 1, company: 1, email: 1 } }
      );

    const employeeData = await db
      .collection("users")
      .find(
        { _id: { $in: project.employees.map((empId) => new ObjectId(empId)) } },
        { projection: { name: 1, designation: 1, email: 1 } }
      )
      .toArray();

    const activeRisks = await db
      .collection("risks")
      .find({ projectId: pId, status: "Open" })
      .toArray();

    const activityHistory = await db
      .collection("checkins")
      .aggregate([
        { $match: { projectId: pId } },
        { $sort: { timestamp: -1 } },
        {
          $lookup: {
            from: "feedbacks",
            localField: "feedbackId",
            foreignField: "_id",
            as: "feedback",
          },
        },
        { $unwind: { path: "$feedback", preserveNullAndEmptyArrays: true } },
      ])
      .toArray();

    return {
      ...project,
      clientDetails: clientData,
      employeeDetails: employeeData,
      activeRisks,
      activityHistory,
    };
  } catch (e) {
    return null;
  }
}

const ProjectDetails = async ({ params }) => {
  const { id } = await params;
  const project = await getProjectData(id);

  if (!project)
    return (
      <div className="p-10 text-center text-red-500">Project Not Found</div>
    );

  const getHealthStatus = (score) => {
    if (score >= 80)
      return {
        label: "On Track",
        color: "bg-green-500",
        text: "text-green-700",
      };
    if (score >= 60)
      return {
        label: "At Risk",
        color: "bg-orange-500",
        text: "text-orange-700",
      };
    return { label: "Critical", color: "bg-red-500", text: "text-red-700" };
  };

  const health = getHealthStatus(project.healthScore || 100);

  return (
    <div className="w-11/12 mx-auto py-10 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b pb-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold">{project.name}</h1>
          <p className="mt-3 text-lg leading-relaxed">{project.description}</p>
        </div>
        <div
          className={`flex flex-col items-center px-8 py-4 rounded-2xl shadow-sm border ${health.color} bg-opacity-10 ${health.text}`}
        >
          <span className="text-sm font-bold uppercase tracking-wider">
            Health Score
          </span>
          <span className="text-3xl font-black">
            {project.healthScore || 100}%
          </span>
          <span className="text-sm font-medium">{health.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card bg-base-100 shadow-sm border border-slate-200">
          <div className="card-body">
            <h3 className="card-title text-sm uppercase">Timeline</h3>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between">
                <span>Start:</span>
                <span className="font-semibold">
                  {new Date(project.startDate).toLocaleDateString("en-GB")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>End:</span>
                <span className="font-semibold">
                  {new Date(project.endDate).toLocaleDateString("en-GB")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-slate-200">
          <div className="card-body">
            <h3 className="card-title text-sm uppercase">Assigned Client</h3>
            <div className="mt-2">
              <p className="text-xl font-bold">
                {project.clientDetails?.name || "N/A"}
              </p>
              <p className="text-primary font-medium">
                {project.clientDetails?.company || "Independent Client"}
              </p>
              <p className="text-xs mt-1">{project.clientDetails?.email}</p>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-slate-200">
          <div className="card-body">
            <h3 className="card-title text-sm uppercase">Project Status</h3>
            <div className="mt-2">
              <span
                className={`badge badge-lg p-4 font-bold ${health.color} text-white border-none`}
              >
                {project.status || "On Track"}
              </span>
            </div>
            {project.status !== "Completed" && (
              <CompleteProjectButton
                projectId={id}
                projectName={project.name}
              />
            )}
            
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Assigned Team Members</h3>

          <AddEmployeeButton
            projectId={id}
            currentEmployees={project.employees}
          />
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Employee Name</th>
                <th>Designation</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {project.employeeDetails?.map((emp) => (
                <tr key={emp._id}>
                  <td className="font-bold">{emp.name}</td>
                  <td>
                    <span className="badge badge-outline">
                      {emp.designation}
                    </span>
                  </td>
                  <td>{emp.email}</td>
                  <td>
                    <RemoveEmployeeButton
                      projectId={id}
                      employeeId={emp._id.toString()}
                      employeeName={emp.name}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-6">Activity Timeline</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Date</th>
                <th>Employee Update</th>
                <th>Confidence</th>
                <th>Client Feedback</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{new Date(project.startDate).toLocaleDateString()}</td>
                <td>
                  <span className="badge badge-success badge-sm">
                    Initialization
                  </span>{" "}
                  Project Created
                </td>
                <td>-</td>
                <td>-</td>
              </tr>
              {project.activityHistory?.map((log) => (
                <tr key={log._id.toString()}>
                  <td className="whitespace-nowrap font-medium">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </td>
                  <td className="max-w-xs">
                    <p className="font-bold text-xs uppercase opacity-50 mb-1">
                      Progress:
                    </p>
                    <p className="text-sm">{log.progressSummary}</p>
                  </td>
                  <td>
                    <div className="badge badge-outline">
                      {log.confidenceLevel}/5
                    </div>
                  </td>
                  <td className="max-w-xs">
                    {log.feedback ? (
                      <div>
                        <p className="text-green-600 font-medium italic text-xs">
                          "{log.feedback.comments}"
                        </p>
                        <p className="text-[10px] opacity-50 mt-1">
                          Rating: {log.feedback.satisfactionRating}/5
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs">
                        Awaiting Feedback
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-6 text-error">
          🚩 Active Risk Items
        </h3>
        <div className="overflow-x-auto rounded-xl border border-red-200 bg-red-50/30">
          <table className="table w-full">
            <thead className="bg-red-100/50 text-red-900">
              <tr>
                <th>Severity</th>
                <th>Title</th>
                <th>Mitigation Plan</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {project.activeRisks?.length > 0 ? (
                project.activeRisks.map((risk) => (
                  <tr key={risk._id.toString()}>
                    <td>
                      <span
                        className={`font-bold ${
                          risk.severity === "High"
                            ? "text-red-600"
                            : "text-orange-500"
                        }`}
                      >
                        {risk.severity}
                      </span>
                    </td>
                    <td className="font-semibold">{risk.title}</td>
                    <td className="text-xs italic max-w-xs">
                      {risk.mitigationPlan}
                    </td>
                    <td className="text-right">
                      <ResolveRiskButton
                        riskId={risk._id.toString()}
                        projectId={id}
                        riskTitle={risk.title}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-green-700">
                    No active risks identified.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
