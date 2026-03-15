import StatCard from "../components/StatCard";
import BarChartComponent from "../components/BarChart";

export default function Dashboard(){

  return(

    <div>

      <h1 className="text-2xl font-bold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6 mb-6">

        <StatCard title="Total Users" value="1200"/>
        <StatCard title="Donations" value="430"/>
        <StatCard title="Delivered" value="380"/>

      </div>

      <BarChartComponent/>

    </div>

  )

}