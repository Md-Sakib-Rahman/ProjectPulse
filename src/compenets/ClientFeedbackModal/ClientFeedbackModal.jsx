"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { saveFeedbackAction } from "@/app/actions/server/feedbackActions";
import Swal from "sweetalert2";

const ClientFeedbackModal = ({ checkInId, projectId }) => {
  const modalRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    
    const payload = {
      checkInId,
      projectId,
      satisfactionRating: Number(data.satisfactionRating),
      communicationRating: Number(data.communicationRating),
      comments: data.comments,
    };

    const result = await saveFeedbackAction(payload);
    
    setLoading(false);
    if (result.success) {
      Swal.fire("Feedback Submitted", "The project health has been updated.", "success");
      modalRef.current.close();
      reset();
    } else {
      Swal.fire("Error", result.error || "Failed to save feedback", "error");
    }
  };

  return (
    <>
      <button 
        className="btn btn-sm btn-primary" 
        onClick={() => modalRef.current.showModal()}
      >
        Give Feedback
      </button>

      <dialog ref={modalRef} className="modal">
        <div className="modal-box max-w-md">
          <h3 className="font-bold text-lg mb-4 text-slate-800">Submit Project Feedback</h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Project Satisfaction (1-5)</span>
              </label>
              <input 
                type="range" min="1" max="5" defaultValue="3" step="1" 
                className="range range-primary range-sm w-full" 
                {...register("satisfactionRating")} 
              />
              <div className="flex justify-between text-xs px-2 mt-1">
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Communication Quality (1-5)</span>
              </label>
              <input 
                type="range" min="1" max="5" defaultValue="3" step="1" 
                className="range range-secondary range-sm w-full" 
                {...register("communicationRating")} 
              />
              <div className="flex justify-between text-xs px-2 mt-1">
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Comments & Observations</span>
              </label>
              <textarea 
                className="textarea textarea-bordered h-24" 
                placeholder="Share your thoughts on the progress..."
                {...register("comments", { required: true })}
              ></textarea>
            </div>

            <div className="modal-action">
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={() => modalRef.current.close()}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
              >
                Submit Feedback
              </button>
            </div>
          </form>
        </div>
        
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default ClientFeedbackModal;