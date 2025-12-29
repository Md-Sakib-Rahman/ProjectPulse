import Link from "next/link";
import React from "react";

const ProjectCards = ({ project,role }) => {
  const healthColor = project.healthScore >= 80 ? "bg-green-500" : project.healthScore >= 60 ? "bg-orange-500" : "bg-red-500";  

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <h2 className="card-title">{project.name}</h2>  
        <div className={`${project.status==="Completed" ? "bg-gray-600" : healthColor} px-3 py-1 text-xs text-white rounded-full w-fit`}>
          {project.status} {project.status==="Completed" ? " " : project.healthScore+"%"}  
        </div>
        <p className="text-sm line-clamp-2">{project.description}</p>  
        <div className="card-actions justify-end">
          {
            role==="client" & project.status==="Completed" ? (<button className="btn btn-primary btn-sm">Completed</button>) : (<Link href={`/dashboard/${role}/projects/${project._id.toString()}`} className="btn btn-primary btn-sm">View Details</Link>  )
          }
          
        </div>
      </div>
    </div>
  );
};

export default ProjectCards;
