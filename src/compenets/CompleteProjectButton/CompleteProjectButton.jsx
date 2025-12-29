"use client";
import Swal from "sweetalert2";
import { completeProjectAction } from "@/app/actions/server/projectActions";

const CompleteProjectButton = ({ projectId, projectName }) => {
  const handleComplete = async () => {
    const result = await Swal.fire({
      title: "Complete Project?",
      text: `Are you sure you want to mark "${projectName}" as completed?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      confirmButtonText: "Yes, Mark as Complete",
    });

    if (result.isConfirmed) {
      const response = await completeProjectAction(projectId);
      if (response.success) {
        Swal.fire("Completed!", "Project status has been updated.", "success");
      } else {
        Swal.fire("Error", "Failed to update project status.", "error");
      }
    }
  };

  return (
    <button onClick={handleComplete} className="btn btn-success btn-sm text-white">
      Mark as Completed
    </button>
  );
};

export default CompleteProjectButton;