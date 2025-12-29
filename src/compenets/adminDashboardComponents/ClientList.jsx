import React from "react";
import ClientRow from "./ClientRow";

const ClientList = ({data}) => {
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            <th>Client Name</th>
            <th>Company</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {
            data.map((user, index)=>(<ClientRow key={index} count={index} user={user}/>))
          }
          
        </tbody>
      </table>
    </div>
  );
};

export default ClientList;
