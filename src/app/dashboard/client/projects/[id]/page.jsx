
import React from 'react';
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import ClientFeedbackModal from "@/compenets/ClientFeedbackModal/ClientFeedbackModal";
import { FaArrowLeft } from "react-icons/fa";
import BackButton from '@/compenets/BackButton/BackButton';

async function getClientProjectData(id) {
  try {
    const client = await clientPromise;
    const db = client.db("projectpulse");
    const pId = new ObjectId(id);

    const project = await db.collection("projects").findOne({ _id: pId });
    if (!project) return null;

    // 1. Fetch all check-ins for this specific project
    const allCheckIns = await db.collection("checkins")
      .find({ projectId: pId })
      .sort({ timestamp: -1 })
      .toArray();

    // 2. Extract feedback IDs and fetch the feedback documents
    const feedbackIds = allCheckIns
      .map(c => c.feedbackId)
      .filter(id => id instanceof ObjectId || (typeof id === 'string' && id.length > 0))
      .map(id => new ObjectId(id));

    const feedbacks = await db.collection("feedbacks")
      .find({ _id: { $in: feedbackIds } })
      .toArray();

    // 3. Map feedbacks back into the check-in objects
    const checkInsWithDetails = allCheckIns.map(c => ({
      ...c,
      feedback: feedbacks.find(f => f._id.toString() === c.feedbackId?.toString()) || null
    }));

    // 4. Fetch Employee Details
    const employeeDetails = await db.collection("users").find(
      { _id: { $in: project.employees.map(empId => new ObjectId(empId)) } },
      { projection: { name: 1, designation: 1, email: 1 } }
    ).toArray();

    // 5. Categorize: Pending (isClientFeedback is false/missing) vs Completed
    return { 
      ...project, 
      employeeDetails, 
      // Reverse pending to show oldest first so they are addressed in order
      pendingCheckIns: checkInsWithDetails.filter(c => !c.isClientFeedback).reverse(), 
      completedCheckIns: checkInsWithDetails.filter(c => c.isClientFeedback),
      latestCheckIn: allCheckIns[0] || null 
    };
  } catch (e) {
    console.error("Database fetch error:", e);
    return null;
  }
}

const ClientProjectDetails = async ({ params }) => {
  const { id } = await params;
  const project = await getClientProjectData(id);

  if (!project) return <div className="p-10 text-center">Project not found or access denied.</div>;

  return (
    <div className="w-11/12 mx-auto py-10 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start border-b pb-6 gap-4">
        <div>
          <BackButton />
          <h1 className="text-3xl font-bold text-base-content">{project.name}</h1>
          <p className="text-slate-500 mt-2">{project.description}</p>
        </div>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 border border-slate-200 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-sm uppercase text-base-content">Timeline & Health</h2>
            <div className="flex justify-between mt-4">
              <span>Health Score:</span>
              <span className="font-bold text-base-content">{project.healthScore}%</span>
            </div>
            <div className="flex justify-between">
              <span>Deadline:</span>
              <span className="font-bold">{new Date(project.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100 border border-slate-200 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-sm uppercase text-base-content">Latest Pulse</h2>
            {project.latestCheckIn ? (
              <div className="mt-2">
                <p className="font-medium text-base-content">"{project.latestCheckIn.progressSummary}"</p>
                <p className="text-xs text-base-content mt-2">
                  Submitted: {new Date(project.latestCheckIn.timestamp).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-base-content italic mt-2">No check-ins submitted yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* ASSIGNED TEAM */}
      <section>
        <h3 className="text-xl font-bold mb-4">Assigned Team</h3>
        <div className="overflow-x-auto border rounded-xl">
          <table className="table table-zebra w-full">
            <thead className="bg-base-100">
              <tr>
                <th>Name</th>
                <th>Designation</th>
              </tr>
            </thead>
            <tbody>
              {project.employeeDetails.map((emp) => (
                <tr key={emp._id.toString()}>
                  <td className="font-bold">{emp.name}</td>
                  <td>{emp.designation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* RECENT ACTIVITY ACCORDION */}
      <section>
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {project.latestCheckIn ? (
            <div className="collapse collapse-arrow bg-base-200 border border-slate-200">
              <input type="radio" name="activity-accordion" defaultChecked /> 
              <div className="collapse-title font-medium">
                Employee Check-in: {new Date(project.latestCheckIn.timestamp).toLocaleDateString()}
              </div>
              <div className="collapse-content text-sm space-y-2">
                <p><strong>Progress:</strong> {project.latestCheckIn.progressSummary}</p>
                <p><strong>Blockers:</strong> {project.latestCheckIn.blockers || "None"}</p>
                <div className="divider">Client Response</div>
                {project.latestCheckIn.isClientFeedback ? (
                   <p className="text-green-600 font-medium italic">Feedback has been submitted.</p>
                ) : (
                   <p className="text-orange-500 italic">Pending your feedback</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">Activity logs will appear here once the team starts working.</div>
          )}
        </div>
      </section>

      {/* PENDING FEEDBACK SECTION */}
      <section className="bg-orange-50 p-6 rounded-2xl border border-orange-200">
        <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
          ⚠️ Pending Feedback
        </h3>
        {project.pendingCheckIns?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table bg-white">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Progress Summary</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {project.pendingCheckIns.map((check) => (
                  <tr key={check._id.toString()}>
                    <td className="whitespace-nowrap">{new Date(check.timestamp).toLocaleDateString()}</td>
                    <td className="max-w-xs truncate">{check.progressSummary}</td>
                    <td>
                      <ClientFeedbackModal checkInId={check._id.toString()} projectId={id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-orange-600 italic">Everything is up to date! No pending feedback.</p>
        )}
      </section>

      {/* COMPLETED FEEDBACK HISTORY */}
      <section>
        <h3 className="text-xl font-bold mb-6">Completed Updates & Feedback</h3>
        <div className="space-y-4">
          {project.completedCheckIns?.length > 0 ? (
            project.completedCheckIns.map((check) => (
              <div key={check._id.toString()} className="collapse collapse-arrow bg-base-100 border border-slate-200 shadow-sm">
                <input type="checkbox" /> 
                <div className="collapse-title flex justify-between items-center pr-10">
                  <span className="font-bold">{new Date(check.timestamp).toLocaleDateString()} Update</span>
                  <span className="badge badge-success text-white">Feedback Given</span>
                </div>
                <div className="collapse-content space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-bold text-base-content text-xs uppercase mb-2">Employee Report</h4>
                      <p><strong>Progress:</strong> {check.progressSummary}</p>
                      <p><strong>Confidence:</strong> {check.confidenceLevel}/5</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h4 className="font-bold text-blue-500 text-xs uppercase mb-2">Your Feedback</h4>
                      <p><strong>Rating:</strong> {check.feedback?.satisfactionRating}/5</p>
                      <p><strong>Comments:</strong> {check.feedback?.comments || "No comments shared."}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 italic">No feedback history yet.</p>
          )}
        </div>  
      </section>
    </div>
  );
};

export default ClientProjectDetails;
// import React from 'react';
// import clientPromise from "@/lib/mongodb";
// import { ObjectId } from "mongodb";
// import ClientFeedbackModal from "@/compenets/ClientFeedbackModal/ClientFeedbackModal"; // We'll create this
// import { FaArrowLeft } from "react-icons/fa";
// import BackButton from '@/compenets/BackButton/BackButton';
// async function getClientProjectData(id) {
//   try {
//     const client = await clientPromise;
//     const db = client.db("projectpulse");
     
//     const project = await db.collection("projects").findOne({ _id: new ObjectId(id) });
//     if (!project) return null;
 
//     const employeeDetails = await db.collection("users").find(
//       { _id: { $in: project.employees.map(empId => new ObjectId(empId)) } },
//       { projection: { name: 1, designation: 1, email: 1 } }
//     ).toArray();
 
//     const latestCheckIn = await db.collection("checkins")
//       .find({ projectId: new ObjectId(id) })
//       .sort({ timestamp: -1 })
//       .limit(1)
//       .toArray();

//     return { 
//       ...project, 
//       employeeDetails, 
//       latestCheckIn: latestCheckIn[0] || null 
//     };
//   } catch (e) {
//     return null;
//   }
// }

// const ClientProjectDetails = async ({ params }) => {
//   const { id } = await params;
//   const project = await getClientProjectData(id);

//   if (!project) return <div className="p-10 text-center">Project not found or access denied.</div>;
 
   

//   return (
//     <div className="w-11/12 mx-auto py-10 space-y-8">
       
//       <div className="flex flex-col md:flex-row justify-between items-start border-b pb-6 gap-4">
//         <div>
//           <div >
//             <BackButton/>
//           </div>
//           <h1 className="text-3xl font-bold text-base-content">{project.name}</h1>
//           <p className="text-slate-500 mt-2">{project.description}</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="card bg-base-100 border border-slate-200 shadow-sm">
//           <div className="card-body">
//             <h2 className="card-title text-sm uppercase text-base-content">Timeline & Health</h2>
//             <div className="flex justify-between mt-4">
//               <span>Health Score:</span>
//               <span className="font-bold text-base-content">{project.healthScore}%</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Deadline:</span>
//               <span className="font-bold">{new Date(project.endDate).toLocaleDateString()}</span>
//             </div>
//           </div>
//         </div>
        
//         <div className="card bg-base-100 border border-slate-200 shadow-sm">
//           <div className="card-body">
//             <h2 className="card-title text-sm uppercase text-base-content">Latest Pulse</h2>
//             {project.latestCheckIn ? (
//               <div className="mt-2">
//                 <p className="font-medium text-base-content">"{project.latestCheckIn.progressSummary}"</p>
//                 <p className="text-xs text-base-content mt-2">
//                   Submitted: {new Date(project.latestCheckIn.timestamp).toLocaleString()}
//                 </p>
//               </div>
//             ) : (
//               <p className="text-base-content italic mt-2">No check-ins submitted yet.</p>
//             )}
//           </div>
//         </div>
//       </div>

//       <section>
//         <h3 className="text-xl font-bold mb-4">Assigned Team</h3>
//         <div className="overflow-x-auto border rounded-xl">
//           <table className="table table-zebra w-full">
//             <thead className="bg-base-100">
//               <tr>
//                 <th>Name</th>
//                 <th>Designation</th>
//               </tr>
//             </thead>
//             <tbody>
//               {project.employeeDetails.map((emp) => (
//                 <tr key={emp._id}>
//                   <td className="font-bold">{emp.name}</td>
//                   <td>{emp.designation}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </section>

//       <section>
//         <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
//         <div className="space-y-4">
//           {project.latestCheckIn ? (
//             <div className="collapse collapse-arrow bg-base-200 border border-slate-200">
//               <input type="radio" name="activity-accordion" defaultChecked /> 
//               <div className="collapse-title font-medium">
//                 Employee Check-in: {new Date(project.latestCheckIn.timestamp).toLocaleDateString()}
//               </div>
//               <div className="collapse-content text-sm space-y-2">
//                 <p><strong>Progress:</strong> {project.latestCheckIn.progressSummary}</p>
//                 <p><strong>Blockers:</strong> {project.latestCheckIn.blockers || "None"}</p>
//                 <div className="divider">Client Response</div>
//                 {project.latestCheckIn.clientFeedback ? (
//                    <p className="text-green-600 font-medium">Feedback: {project.latestCheckIn.clientFeedback.comments}</p>
//                 ) : (
//                    <p className="text-orange-500 italic">Pending your feedback</p>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className="text-center py-10 text-slate-400">Activity logs will appear here once the team starts working.</div>
//           )}
//         </div>
//       </section>
//       <section className="bg-orange-50 p-6 rounded-2xl border border-orange-200">
//         <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
//           ⚠️Pending Feedback
//         </h3>
//         {project.pendingCheckIns?.length > 0 ? (
//           <div className="overflow-x-auto">
//             <table className="table bg-white">
//               <thead>
//                 <tr>
//                   <th>Date</th>
//                   <th>Progress Summary</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {project.pendingCheckIns.map((check) => (
//                   <tr key={check._id}>
//                     <td className="whitespace-nowrap">{new Date(check.timestamp).toLocaleDateString()}</td>
//                     <td className="max-w-xs truncate">{check.progressSummary}</td>
//                     <td>
//                       <ClientFeedbackModal checkInId={check._id.toString()} projectId={id} />
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="text-orange-600 italic">Everything is up to date! No pending feedback.</p>
//         )}
//       </section>
//       <section>
//         <h3 className="text-xl font-bold mb-6">Completed Updates & Feedback</h3>
//         <div className="space-y-4">
//           {project.completedCheckIns?.length > 0 ? (
//             project.completedCheckIns.map((check) => (
//               <div key={check._id} className="collapse collapse-arrow bg-base-100 border border-slate-200 shadow-sm">
//                 <input type="checkbox" /> 
//                 <div className="collapse-title flex justify-between items-center pr-10">
//                   <span className="font-bold">{new Date(check.timestamp).toLocaleDateString()} Update</span>
//                   <span className="badge badge-success text-white">Feedback Given</span>
//                 </div>
//                 <div className="collapse-content space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="p-4 bg-slate-50 rounded-lg">
//                       <h4 className="font-bold text-base-content text-xs uppercase mb-2">Employee Report</h4>
//                       <p><strong>Progress:</strong> {check.progressSummary}</p>
//                       <p><strong>Confidence:</strong> {check.confidenceLevel}/5</p>
//                     </div>
//                     <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
//                       <h4 className="font-bold text-blue-500 text-xs uppercase mb-2">Your Feedback</h4>
//                       <p><strong>Rating:</strong> {check.feedback?.satisfactionRating}/5</p>
//                       <p><strong>Comments:</strong> {check.feedback?.comments}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="text-slate-400 italic">No feedback history yet.</p>
//           )}
//         </div>  
//       </section>
//     </div>
//   );
// };

// export default ClientProjectDetails;