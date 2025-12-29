"use client";
import { login } from "@/app/actions/server/auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { HiMail, HiLockClosed } from "react-icons/hi"; // Professional icons

const LoginForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false); // Track loading state
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await login(data);
    
    if (!result) {
      setIsSubmitting(false);
      Swal.fire({
        icon: "error",
        title: "Login Failed!",
        text: "Invalid email or password. Please try again.",
        confirmButtonColor: "#3b82f6", // Matching primary blue
      });
    } else {
      Swal.fire({
        icon: "success",
        title: "Welcome Back!",
        text: "Redirecting to your dashboard...",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        router.push(`/dashboard/${result.role}`); // Dynamic routing
      });
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col w-full max-w-md">
        {/* Brand/Logo Section */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-black text-base-content uppercase tracking-tighter">
            Project<span className="text-blue-500">Pulse</span>
          </h1>
          <p className="py-2 text-base-content font-medium">Manage your workflow efficiently.</p>
        </div>

        <div className="card bg-base-100 w-full shadow-2xl border border-slate-200">
          <div className="card-body p-8">
            <h2 className="card-title text-2xl text-base-content font-bold mb-4">Login</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-base-content">Email Address</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content">
                    <HiMail size={20} />
                  </div>
                  <input
                    type="email"
                    className={`input input-bordered w-full pl-10 text-base-content ${errors.email ? "input-error border-2" : "focus:border-blue-500"}`}
                    placeholder="name@company.com"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
                    })}
                  />
                </div>
                {errors.email && (
                  <label className="label p-1">
                    <span className="label-text-alt text-error font-semibold">{errors.email.message}</span>
                  </label>
                )}
              </div>

              {/* Password Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-base-content">Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content">
                    <HiLockClosed size={20} />
                  </div>
                  <input
                    type="password"
                    className={`input input-bordered w-full pl-10 text-base-content ${errors.password ? "input-error border-2" : "focus:border-blue-500"}`}
                    placeholder="••••••••"
                    {...register("password", { required: "Password is required" })}
                  />
                </div>
                {errors.password && (
                  <label className="label p-1">
                    <span className="label-text-alt text-error font-semibold">{errors.password.message}</span>
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <div className="form-control mt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`btn btn-primary w-full text-base-content font-bold text-lg  `}
                >
                  
                  {isSubmitting ? <div className="loading "> </div> : "Login"}
                </button>
              </div>
            </form>

            <div className="divider text-xs ttext-base-content uppercase font-bold mt-8">Secure Access</div>
            <p className="text-center text-xs text-base-content">
              Only authorized users can access the ProjectPulse system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

// "use client";
// import { login } from "@/app/actions/server/auth";
// import { useRouter } from "next/navigation";
// import React from "react";
// import { useForm } from "react-hook-form";
// import Swal from "sweetalert2";

// const LoginForm = () => {
//     const router = useRouter()
//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors },
//   } = useForm();
//   const onSubmit = async (data) => {
//     console.log(data);
//     const result = await login(data);
//     if (!result) {
//       Swal.fire({
//         icon: "error",
//         title: "Login Failed !",
//         text: "Something went wrong!",
//       });
//     }else{
//         Swal.fire({
//         icon: "success",
//         title: "Login success !",
//         text: "successfully Logged in !",
//       }).then(()=>{
//     //   console.log(result.role)  
//       router.push(`/dashboard/${result.role}`)

//       })
//     }
//   };
//   return (
//     <div className="hero bg-base-200 min-h-screen">
//       <div className="card bg-base-100 w-full  max-w-sm shrink-0 shadow-2xl">
//         <div className="card-body">
//           <form onSubmit={handleSubmit(onSubmit)} className="fieldset">
//             <label className="label text-base-content font-bold">Email</label>
//             <input
//               type="email"
//               className={`input ${errors.email ? "input-error" : ""}`}
//               placeholder="Email"
//               {...register("email", { required: "Email Address is required" })}
//             />
//             {errors.email ? (
//               <p className="text-red-500">{errors.email.message}</p>
//             ) : (
//               ""
//             )}
//             <label className="label text-base-content font-bold">
//               Password
//             </label>
//             <input
//               type="password"
//               className={`input ${errors.password ? "input-error" : ""}`}
//               placeholder="Password"
//               {...register("password", { required: "password is required" })}
//             />
//             {errors.password ? (
//               <p className="text-red-500">{errors.password.message}</p>
//             ) : (
//               ""
//             )}
//             <button className="btn btn-base mt-4 text-base-content  ">
//               Login
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginForm;
