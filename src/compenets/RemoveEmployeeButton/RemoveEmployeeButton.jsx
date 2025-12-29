"use client"
import Swal from "sweetalert2";
import { removeEmployeeFromProject } from "@/app/actions/server/removeEmployeeAction.js";

export default function RemoveEmployeeButton({ projectId, employeeId, employeeName }) {
  const handleRemove = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Remove ${employeeName} from this project?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, remove them!",
    });

    if (result.isConfirmed) {
      const response = await removeEmployeeFromProject(projectId, employeeId);
      
      if (response.success) {
        Swal.fire("Removed!", "User has been removed from the project.", "success");
      } else {
        Swal.fire("Error", response.error, "error");
      }
    }
  };

  return (
    <button 
      onClick={handleRemove}
      className='btn hover:bg-red-500 btn-outline btn-sm'
    >
      Remove
    </button>
  );
}