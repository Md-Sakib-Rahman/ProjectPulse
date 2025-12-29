"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { logRiskAction } from "@/app/actions/server/projectActions";
import Swal from "sweetalert2";

const RiskItemModal = ({ projectId, employeeId }) => {
  const modalRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await logRiskAction({ ...data, projectId, employeeId });
    setLoading(false);

    if (result.success) {
      Swal.fire("Risk Logged", "The risk has been recorded and the team notified.", "warning");
      modalRef.current.close();
      reset();
    } else {
      Swal.fire("Error", "Could not log risk.", "error");
    }
  };

  return (
    <>
      <button className="btn btn-outline btn-error" onClick={() => modalRef.current.showModal()}>
        ⚠️ Report Risk
      </button>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box max-w-lg">
          <h3 className="font-bold text-lg mb-4 text-error">New Risk Identification</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="form-control">
              <label className="label text-xs font-bold uppercase">Risk Title</label>
              <input 
                type="text" 
                className="input input-bordered w-full" 
                placeholder="e.g., Delayed API response from vendor"
                {...register("title", { required: true })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label text-xs font-bold uppercase">Severity</label>
                <select className="select select-bordered " {...register("severity")}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold uppercase">Description</label>
              <textarea 
                className="textarea textarea-bordered h-20 w-full" 
                {...register("description", { required: true })}
              />
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold uppercase">Mitigation Plan</label>
              <textarea 
                className="textarea textarea-bordered h-20 w-full" 
                placeholder="How will we minimize this risk?"
                {...register("mitigationPlan", { required: true })}
              />
            </div>

            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => modalRef.current.close()}>Cancel</button>
              <button type="submit" disabled={loading} className="btn btn-error text-white">Log Risk</button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default RiskItemModal;