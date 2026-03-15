import { FaComments } from "react-icons/fa";
import Avatar from "./Avatar";

export default function Navbar() {

  return (

    <div className="bg-white shadow h-16 flex items-center justify-between px-6">

      <h2 className="text-xl font-semibold text-primary">
        Admin Dashboard
      </h2>

      <div className="flex items-center gap-6">

        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded">

          <FaComments/>

          Chat

        </button>

        <Avatar/>

      </div>

    </div>

  );

}