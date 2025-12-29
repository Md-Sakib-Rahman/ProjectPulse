import React from 'react'

const EmployeeRow = ({user, count}) => {
  return (
    <tr>
      <th>{count+1}</th>
      <td>{user.name}</td>
      <td>{user.designation}</td>
      <td className="flex justify-start py-5" > <span className={`badge ${user.assignedProjects?.length > 0 ? "badge-error" : "badge-success"}`}>
  {user.assignedProjects?.length > 0 ? "Assigned" : "Available"}
</span></td>
      <td><button className="btn">Delete</button></td>
    </tr>
  )
}

export default EmployeeRow
