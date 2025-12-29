"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form"; 
import Swal from "sweetalert2";
const CreateProjectModal = ({ employeesList, clientsList, onProjectCreated }) => {
  const modalRef = useRef(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  
  // Manage assigned users in state for UI feedback
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  const onSubmit = async (data) => {
     
    const payload = {
      name: data.name,
      description: data.description,
      startDate: data.startDate, 
      endDate: data.endDate,      
      client: selectedClient?._id,        
      employees: selectedEmployees.map(e => e._id),   
    };

   try {
      const response = await fetch("/api/projects/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });

      const result = await response.json(); 

      if (result.success) {
        Swal.fire("Success", "Project registered successfully!", "success");
        onProjectCreated(); // Re-fetches the list in the parent
        modalRef.current.close();
        reset();
        setSelectedEmployees([]);
      } else {
        Swal.fire("Error", result.message || "Registration failed", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Could not connect to the server", "error");
    }
  };

  return (
    <>
      <button className="btn" onClick={() => modalRef.current.showModal()}>
        + Create Projects
      </button>
      
      <dialog ref={modalRef} className="modal">
        <div className="modal-box w-11/12 max-w-2xl">
          <h3 className="font-bold text-lg">New Project Details</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 mt-4">
            <input className="input input-bordered w-full" placeholder="Project Name" {...register("name", { required: true })} />  
            <textarea className="textarea textarea-bordered w-full" placeholder="Description" {...register("description")} />  
            
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="label">Start Date</label>  
                <input type="date" className="input input-bordered w-full" {...register("startDate")} />
              </div>
              <div className="flex-1">
                <label className="label">End Date</label>  
                <input type="date" className="input input-bordered w-full" {...register("endDate")} />
              </div>
            </div>

            {/* Assignment Section */}
            <div className="form-control">
              <label className="label">Assign Client (One)</label> 
              <select className="select select-bordered w-full" onChange={(e) => setSelectedClient(clientsList.find(c => c._id === e.target.value))}>
                <option disabled selected>Select a client</option>
                {clientsList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-control">
              <label className="label">Assign Employees (Multiple)</label> 
              <select className="select select-bordered w-full" onChange={(e) => {
                const emp = employeesList.find(emp => emp._id === e.target.value);
                if (emp && !selectedEmployees.some(se => se._id === emp._id)) {
                  setSelectedEmployees([...selectedEmployees, emp]);
                }
              }}>
                <option disabled selected>Add employee</option>
                {employeesList.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
              </select>
              <div className="flex gap-1 mt-2 flex-wrap">
                {selectedEmployees.map(emp => (
                  <span key={emp._id} className="badge badge-primary gap-2 p-3">
                    {emp.name} 
                    <button type="button" onClick={() => setSelectedEmployees(selectedEmployees.filter(e => e._id !== emp._id))}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary">Save Project</button>
          </form>
          <div className="modal-action">
            <form method="dialog"><button className="btn">Close</button></form>
          </div>
        </div>
      </dialog>
    </>
  );
};
export default CreateProjectModal