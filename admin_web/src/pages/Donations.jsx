export default function Donations(){

  const donations=[
    {id:1,food:"Bread",status:"Delivered"},
    {id:2,food:"Rice",status:"Pending"},
  ]

  return(

    <div>

      <h1 className="text-2xl font-bold mb-6">
        Donations
      </h1>

      <table className="bg-white w-full shadow rounded">

        <thead>

          <tr className="border-b">

            <th className="p-3">Food</th>
            <th>Status</th>

          </tr>

        </thead>

        <tbody>

          {donations.map(d=>(
            <tr key={d.id} className="border-b">

              <td className="p-3">{d.food}</td>

              <td>

                <span className={
                  d.status==="Delivered"
                  ?"text-green-600"
                  :"text-orange-500"
                }>
                  {d.status}
                </span>

              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>

  )

}