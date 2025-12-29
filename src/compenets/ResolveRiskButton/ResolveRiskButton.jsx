"use client";
import Swal from "sweetalert2";
import { resolveRiskAction } from "@/app/actions/server/projectActions";

const ResolveRiskButton = ({ riskId, projectId, riskTitle }) => {
  const handleResolve = async () => {
    const result = await Swal.fire({
      title: "Resolve Risk?",
      text: `Are you sure "${riskTitle}" has been fully mitigated?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      confirmButtonText: "Yes, Resolve it!",
    });

    if (result.isConfirmed) {
      const response = await resolveRiskAction(riskId, projectId);
      if (response.success) {
        Swal.fire("Resolved", "The risk has been marked as resolved.", "success");
      } else {
        Swal.fire("Error", "Failed to update risk status.", "error");
      }
    }
  };

  return (
    <button onClick={handleResolve} className="btn btn-xs btn-success text-white">
      Resolve
    </button>
  );
};

export default ResolveRiskButton;