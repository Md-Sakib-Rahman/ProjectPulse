"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { submitCheckInAction } from "@/app/actions/server/projectActions";
import Swal from "sweetalert2";

const EmployeeCheckInModal = ({ projectId }) => {
  const modalRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await submitCheckInAction({ ...data, projectId });
    setLoading(false);

    if (result.success) {
      Swal.fire("Success", "Weekly check-in submitted!", "success");
      modalRef.current.close();
      reset();
    } else {
      Swal.fire("Error", "Failed to submit check-in", "error");
    }
  };

  return (
    <>
      <button className="btn btn-primary" onClick={() => modalRef.current.showModal()}>
        Submit Check-in
      </button>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box w-11/12 max-w-lg">
          <h3 className="font-bold text-lg mb-4">Weekly Progress Update</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="form-control">
              <label className="label text-xs font-bold uppercase">Progress Summary</label>
              <textarea 
                className="textarea textarea-bordered h-24 w-full" 
                placeholder="What did you achieve this week?"
                {...register("progressSummary", { required: true })}
              />
            </div>

            <div className="form-control">
              <label className="label text-xs font-bold uppercase">Blockers or Challenges</label>
              <textarea 
                className="textarea textarea-bordered w-full" 
                placeholder="Any hurdles?"
                {...register("blockers")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label text-xs font-bold uppercase">Confidence (1-5)</label>
                <select className="select select-bordered" {...register("confidenceLevel")}>
                  <option value="5">5 - Very High</option>
                  <option value="4">4 - High</option>
                  <option value="3">3 - Moderate</option>
                  <option value="2">2 - Low</option>
                  <option value="1">1 - Critical</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label text-xs font-bold uppercase">Completion %</label>
                <input 
                  type="number" 
                  className="input input-bordered" 
                  placeholder="e.g. 45"
                  {...register("completionPercentage")}
                />
              </div>
            </div>

            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => modalRef.current.close()}>Cancel</button>
              <button type="submit" disabled={loading} className="btn btn-primary">Submit Update</button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default EmployeeCheckInModal;