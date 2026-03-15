import { useState } from "react"

export default function UsersTable(){

  const [users,setUsers]=useState([
    {id:1,name:"Ahmed",role:"Donor"},
    {id:2,name:"Sara",role:"Beneficiary"},
    {id:3,name:"Ali",role:"Donor"},
  ])

  const deleteUser=(id)=>{
    setUsers(users.filter(user=>user.id!==id))
  }

  return(

    <div className="bg-white rounded shadow p-4">

      <table className="w-full">

        <thead>

          <tr className="text-left border-b">

            <th>Name</th>
            <th>Role</th>
            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {users.map(user=>(
            <tr key={user.id} className="border-b">

              <td>{user.name}</td>

              <td>{user.role}</td>

              <td>

                <button
                  onClick={()=>deleteUser(user.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>

              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>

  )

}