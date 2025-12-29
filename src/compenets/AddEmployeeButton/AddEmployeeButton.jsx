"use client"
import { useState, useRef, useEffect } from "react";
import { addEmployeeToProject } from "@/app/actions/server/addEmployeeAction.js";
import Swal from "sweetalert2";

export default function AddEmployeeButton({ projectId, currentEmployees }) {
  const modalRef = useRef(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/userlist");
      const data = await res.json();
      if (data.result === "success") {
        const available = data.data.filter(
          u => u.role === "employee" && !currentEmployees.includes(u._id)
        );
        setAllEmployees(available);
      }
    };
    fetchUsers();
  }, [currentEmployees]);

  const handleAdd = async (empId) => {
    setLoading(true);
    const res = await addEmployeeToProject(projectId, empId);
    setLoading(false);
    if (res.success) {
      modalRef.current.close();
      Swal.fire("Success", "Employee added to project", "success");
    }
  };

  return (
    <>
      <button 
        className="btn btn-sm btn-outline btn-primary"
        onClick={() => modalRef.current.showModal()}
      >
        + Add Employee
      </button>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Assign New Employee</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {allEmployees.length > 0 ? (
              allEmployees.map((emp) => (
                <div key={emp._id} className="flex justify-between items-center p-2 border rounded hover:bg-base-200">
                  <div>
                    <p className="font-bold">{emp.name}</p>
                    <p className="text-xs">{emp.designation}</p>
                  </div>
                  <button 
                    disabled={loading}
                    className="btn btn-xs btn-primary"
                    onClick={() => handleAdd(emp._id)}
                  >
                    Add
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center py-4">No available employees found</p>
            )}
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}