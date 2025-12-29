import React, { useEffect, useState } from "react";

const ClientRow = ({ user, count }) => {
  return (
    <tr>
      <th>{count + 1}</th>
      <td>{user.name}</td>
      <td>{user.company}</td>
      <td className="flex justify-start py-5">
        {" "}
        <span
          className={`badge ${
            user.assignedProjects?.length > 0 ? "badge-error" : "badge-success"
          }`}
        >
          {user.assignedProjects?.length > 0 ? "Assigned" : "Available"}
        </span>
      </td>
      <td>
        <button className="btn">Delete</button>
      </td>
    </tr>
  );
};

export default ClientRow;
