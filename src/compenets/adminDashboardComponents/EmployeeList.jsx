import React from 'react'
import EmployeeRow from './EmployeeRow'

const EmployeeList = ({data}) => {

  return (
     <div className="overflow-x-auto">
      <table className="table table-zebra">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            <th>Employee Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {
            data.map((user, index)=>(<EmployeeRow key={index} count={index} user={user} />))
          }
           
        </tbody>
      </table>
    </div>
  )
}

export default EmployeeList
