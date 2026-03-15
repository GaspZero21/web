import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data=[
  {month:"Jan",donations:30},
  {month:"Feb",donations:45},
  {month:"Mar",donations:60},
  {month:"Apr",donations:20},
]

export default function BarChartComponent(){

  return(

    <div className="bg-white p-6 rounded shadow">

      <h3 className="font-semibold mb-4">
        Donations Statistics
      </h3>

      <ResponsiveContainer width="100%" height={300}>

        <BarChart data={data}>

          <XAxis dataKey="month"/>

          <YAxis/>

          <Tooltip/>

          <Bar
            dataKey="donations"
            fill="#0F5C5C"
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

  )

}