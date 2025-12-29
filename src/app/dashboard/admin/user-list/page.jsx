"use client";
import { Register } from "@/app/actions/server/auth";
import ClientList from "@/compenets/adminDashboardComponents/ClientList";
import EmployeeList from "@/compenets/adminDashboardComponents/EmployeeList";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
const UserList = () => {
  const [clientUser, setClientUser] = useState([]);
  const [employeeUser, setemployeeUser] = useState([]);
  
  const getUserData = async () => {
      const result = await fetch("/api/userlist");
      
      const data = await result.json();
      if (data.result === "success") {
        
        setClientUser(data.data.filter((user=> user.role === "client")))
        setemployeeUser(data.data.filter((user=> user.role === "employee")))
      } else {
        console.error(data.message);
      }
    };
  useEffect(() => {
    getUserData();
  }, []);
  const modalRef = useRef(null);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();
  const selectedRole = watch("role");
  const handleCreateUser = async (data) => {
    // console.log(data);
    const {name, email, password, role, designation, company } = data
    const newUser = {
      name,
      email,
      password,
      role,
      ...(role === 'client' ? { company } : { designation })
    }
    console.log(newUser);
    const result = await Register(newUser);
    console.log(result);
    if (result.success) {
      if (modalRef.current) {
        modalRef.current.close();
        reset();
         
      }
      await getUserData() 
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "User Created successfully",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Erorr",
        text: "Failed Creating User",
      });
    }
  };
  const [filter, setFilter] = useState({
    client: true,
    employee: false,
  });
  const onTouch = (role) => {
    if (role == "client") setFilter({ client: true, employee: false });
    if (role == "employee") setFilter({ client: false, employee: true });
  };

  return (
    <div>
      <div className="flex justify-between w-11/12 mx-auto items-center my-5">
        <h2 className="text-2xl font-bold">User-List</h2>
        {/* <button className="btn btn-primary btn-outline"></button> */}
        <button
          className="btn"
          onClick={() => document.getElementById("my_modal_5").showModal()}
        >
          Create User
        </button>
        {/* <dialog
          ref={modalRef}
          id="my_modal_5"
          className="modal modal-bottom sm:modal-middle"
        >
          <div className="modal-box">
            <h3 className="font-bold text-lg">Create User:</h3>
            <form
              onSubmit={handleSubmit(handleCreateUser)}
              className="flex flex-col gap-2 w-full px-2"
            >
              <label htmlFor="">Name:</label>
              <input
                className="input w-full"
                type="text"
                placeholder="Enter User Name"
                {...register("name")}
              />
              <label htmlFor="">Email:</label>
              <input
                className="input w-full"
                type="email"
                placeholder="Enter User Email"
                {...register("email")}
              />
              <label htmlFor="">Password:</label>
              <input
                className="input w-full"
                type="text"
                placeholder="Enter User Password"
                {...register("password")}
              />
              <select
                defaultValue="Pick a Role"
                className="select appearance-none w-full"
                {...register("role")}
              >
                <option disabled={true}>Pick a Role</option>
                <option>client</option>
                <option>employee</option>
              </select>
              <button type="submit" className="btn-primary btn btn-outline">
                Create
              </button>
            </form>
            <div className="modal-action">
              <form method="dialog">
                <button onClick={() => modalRef.current?.showModal()} className="btn">Close</button>
              </form>
            </div>
          </div>
        </dialog> */}
        <dialog
          ref={modalRef}
          id="my_modal_5"
          className="modal modal-bottom sm:modal-middle"
        >
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create User:</h3>
            <form
              onSubmit={handleSubmit(handleCreateUser)}
              className="flex flex-col gap-4 w-full px-2"
            >
              <div>
                <label className="label text-sm font-semibold">Name:</label>
                <input
                  className="input input-bordered w-full"
                  type="text"
                  placeholder="Enter User Name"
                  {...register("name", { required: true })}
                />
              </div>

              <div>
                <label className="label text-sm font-semibold">Email:</label>
                <input
                  className="input input-bordered w-full"
                  type="email"
                  placeholder="Enter User Email"
                  {...register("email", { required: true })}
                />
              </div>

              <div>
                <label className="label text-sm font-semibold">Password:</label>
                <input
                  className="input input-bordered w-full"
                  type="password"
                  placeholder="Enter User Password"
                  {...register("password", { required: true })}
                />
              </div>

              <div>
                <label className="label text-sm font-semibold">Role:</label>
                <select
                  defaultValue=""
                  className="select select-bordered w-full"
                  {...register("role", { required: true })}
                >
                  <option value="" disabled>Pick a Role</option>
                  <option value="client">Client</option>
                  <option value="employee">Employee</option>
                </select>
              </div>

              {/* 3. DYNAMIC FIELDS SECTION */}
              {selectedRole === "client" && (
                <div className="form-control animate-fade-in">
                  <label className="label text-sm font-semibold">Company Name:</label>
                  <input
                    type="text"
                    placeholder="Enter Company Name"
                    className="input input-bordered w-full"
                    {...register("company", { required: true })}
                  />
                </div>
              )}

              {selectedRole === "employee" && (
                <div className="form-control animate-fade-in">
                  <label className="label text-sm font-semibold">Designation:</label>
                  <input
                    type="text"
                    placeholder="Enter Designation"
                    className="input input-bordered w-full"
                    {...register("designation", { required: true })}
                  />
                </div>
              )}

              <div className="mt-4">
                <button type="submit" className="btn btn-primary w-full">
                  Create User
                </button>
              </div>
            </form>

            <div className="modal-action">
              <form method="dialog">
                {/* Fixed the close button logic */}
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
        </dialog>
      </div>
      <div className="w-11/12 mx-auto">
        <div className="w-full flex justify-center">
          <div role="tablist" className="tabs tabs-lift  ">
            <a
              role="tab"
              className={`tab ${filter.client ? "tab-active" : ""}`}
              onClick={() => onTouch("client")}
            >
              Client
            </a>
            <a
              role="tab"
              className={`tab ${filter.employee ? "tab-active" : ""}`}
              onClick={() => onTouch("employee")}
            >
              Emoployee
            </a>
          </div>
        </div>
        <div>
          {/* conditional rendering ! */}

          {filter.client ? <ClientList data={clientUser} /> : <EmployeeList data={employeeUser} />}
        </div>
      </div>
    </div>
  );
};

export default UserList;
