"use client";
import CreateProjectModal from "@/compenets/CreateProjectModal/CreateProjectModal";
import ProjectCards from "@/compenets/projectCards/ProjectCards";
import React, { useEffect, useState } from "react";

const Admin = () => {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState("All");

  const refreshData = async () => {
    const res = await fetch("/api/projects/allprojects");
    const data = await res.json();
    setProjects(data);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/userlist");
      const data = await res.json();
      if (data.result === "success") {
        setEmployees(data.data.filter((u) => u.role === "employee"));
        setClients(data.data.filter((u) => u.role === "client"));
      }
    };
    fetchUsers();
    refreshData();
  }, []);

  const filteredProjects = projects.filter((p) => {
    if (filter === "All") return p.status !==  "Completed";
    return p.status === filter ;
  });
  const completedProjects = projects.filter((p) => {
     
    return p.status === "Completed";
  });
  const renderFilterButton = (status, colorClass) => (
    <button
      onClick={() => setFilter(status)}
      className={`btn btn-sm ${filter === status ? colorClass : "btn-outline"}`}
    >
      {status}
    </button>
  );
  return (
    <div>
      <div className="flex justify-between items-center my-5 w-11/12 mx-auto">
        <h2 className="text-center my-10 text-3xl max-sm:text-xl font-bold">
          On-going projects
        </h2>

        <CreateProjectModal
          employeesList={employees}
          clientsList={clients}
          onProjectCreated={refreshData}
        />
      </div>

      <div className="max-w-11/12 mx-auto ">
        <div className="my-2">
          <h2 className="font-bold ">Active Projects</h2>

          <div className="flex justify-end gap-2 my-4">
            <h2>Filters:</h2>
            {renderFilterButton("All", "btn-neutral")}
            {renderFilterButton("On Track", "bg-green-500 text-black")}
            {renderFilterButton("At Risk", "bg-orange-500 text-black")}
            {renderFilterButton("Critical", "bg-red-500 text-black")}
          </div>
          <div className="grid grid-cols-3 gap-2 max-sm:grid-cols-1 max-md:grid-cols-2 ">
            {
          
              filteredProjects.map((project)=>   <ProjectCards key={project._id} project={project} role="admin" /> )
            }
          </div>
        </div>
        <hr />
        <div className="my-5">
          <h2 className="font-bold mb-10">Completed</h2>
          <div className="grid grid-cols-3 gap-2 max-sm:grid-cols-1 max-md:grid-cols-2 ">
            {
              completedProjects.map((project)=>   <ProjectCards key={project._id} project={project} role="admin" /> )
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

