import { useState } from "react";
import Avatar from "../components/Avatar";

export default function Profile() {

  // Example form state
  const [name, setName] = useState("Admin");
  const [email, setEmail] = useState("admin@email.com");
  const [password, setPassword] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    // Here you can add API call to save profile
    alert("Profile updated!");
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="bg-white shadow rounded-lg p-6 max-w-xl">

        {/* Avatar */}
        <div className="flex items-center gap-6 mb-6">
          <Avatar />
          <button className="bg-primary text-white px-4 py-2 rounded">
            Change Picture
          </button>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSave}>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Name</label>
            <input
              type="text"
              className="border p-3 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Email</label>
            <input
              type="email"
              className="border p-3 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Password</label>
            <input
              type="password"
              className="border p-3 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          <button
            type="submit"
            className="bg-primary text-white p-3 rounded mt-2"
          >
            Save Changes
          </button>

        </form>

      </div>
    </div>
  );
}