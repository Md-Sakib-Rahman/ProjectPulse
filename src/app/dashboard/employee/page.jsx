"use client";
import ProjectCards from "@/compenets/projectCards/ProjectCards";
import React, { useEffect, useState } from "react";

const EmployeeDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [filter, setFilter] = useState("All"); 

  const fetchData = async () => {
    try {
      setLoading(true);
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      
      if (!userData.userId) throw new Error("Unauthorized");
      setCurrentUserId(userData.userId);

      const res = await fetch("/api/projects/allprojects");
      const allData = await res.json();
      
      const myProjects = allData.filter(p => p.employees.includes(userData.userId));
      setProjects(myProjects);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const applyFilter = (projectList) => {
    if (filter === "All") return projectList;
    return projectList.filter((p) => p.status === filter);
  };

  const allPending = projects.filter((p) => {
    if (p.status !== "Completed") {
      if (!p.lastCheckinDate) return true; 
      const diffDays = Math.ceil(Math.abs(new Date() - new Date(p.lastCheckinDate)) / (1000 * 60 * 60 * 24));
      return diffDays >= 7; 
    }
    return false;
  });

  const allActive = projects.filter((p) => 
    p.status !== "Completed" && !allPending.some(pp => pp._id === p._id)
  );

  const displayedPending = applyFilter(allPending);
  const displayedActive = applyFilter(allActive);

  const renderFilterButton = (status, colorClass) => (
    <button
      onClick={() => setFilter(status)}
      className={`btn btn-sm ${filter === status ? colorClass : "btn-outline"}`}
    >
      {status}
    </button>
  );

  if (loading) return <div className="p-10 text-center font-bold">Loading Workspace...</div>;

  return (
    <div className="w-11/12 mx-auto py-5">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        
        <div className="flex items-center gap-2 bg-base-200 p-2 rounded-lg">
          <span className="text-xs font-bold uppercase opacity-50 px-2">Filters:</span>
          {renderFilterButton("All", "btn-neutral")}
          {renderFilterButton("On Track", "bg-green-500 text-black border-none")}
          {renderFilterButton("At Risk", "bg-orange-500 text-black border-none")}
          {renderFilterButton("Critical", "bg-red-500 text-white border-none")}
        </div>
      </div>

      {displayedPending.length > 0 && (
        <div className="mb-10 p-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
          <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Pending Check-ins (Action Required)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedPending.map((p) => (
              <ProjectCards key={p._id} project={p} role="employee" />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-bold text-xl border-l-4 border-blue-500 pl-3">Your Ongoing Projects</h3>
        {displayedActive.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedActive.map((p) => (
              <ProjectCards key={p._id} project={p} role="employee" />
            ))}
          </div>
        ) : (
          <div className="p-10 text-center bg-base-200 rounded-xl italic opacity-50">
            No projects found matching the {filter} criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;

