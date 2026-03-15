import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaUser,
  FaMapMarkedAlt,
  FaCogs,
  FaSignOutAlt,
  FaDonate
} from "react-icons/fa";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
    { name: "Users", icon: <FaUsers />, path: "/users" },
    { name: "Donors", icon: <FaUsers />, path: "/donors" },
    { name: "Beneficiaries", icon: <FaUsers />, path: "/beneficiaries" },
    { name: "Donations", icon: <FaDonate />, path: "/donations" },
    { name: "Map", icon: <FaMapMarkedAlt />, path: "/map" },
    { name: "Profile", icon: <FaUser />, path: "/profile" },
    { name: "Settings", icon: <FaCogs />, path: "/settings" },
    { name: "Log out", icon: <FaSignOutAlt />, path: "/logout" },
  ];

  return (
    <div
      className={`bg-white h-screen shadow p-3 flex flex-col ${
        open ? "w-64" : "w-20"
      } transition-width duration-300`}
    >
      <div
        className="flex justify-end mb-6 cursor-pointer text-gray-500"
        onClick={() => setOpen(!open)}
      >
        {open ? "<" : ">"}
      </div>

      {menuItems.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={`flex items-center gap-3 p-3 rounded mb-2 hover:bg-gray-100 ${
            location.pathname === item.path ? "bg-gray-200 font-semibold" : ""
          }`}
        >
          <span className="text-lg">{item.icon}</span>
          {open && <span>{item.name}</span>}
        </Link>
      ))}
    </div>
  );
}