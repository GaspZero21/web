import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login          from "./pages/Login";
import ResetPassword  from "./pages/ResetPassword";
import AdminLayout    from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard      from "./pages/Dashboard";
import Users          from "./pages/Users";
import Donors         from "./pages/Donors";
import Beneficiaries  from "./pages/Beneficiaries";
import Associations   from "./pages/Associations";
import Donations      from "./pages/Donations";
import Map            from "./pages/Map";
import Profile        from "./pages/Profile";
import Settings       from "./pages/Settings";
import Chat           from "./pages/Chat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"               element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected — requires token */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="/users"         element={<Users />} />
            <Route path="/donors"        element={<Donors />} />
            <Route path="/beneficiaries" element={<Beneficiaries />} />
            <Route path="/associations"  element={<Associations />} />
            <Route path="/donations"     element={<Donations />} />
            <Route path="/map"           element={<Map />} />
            <Route path="/profile"       element={<Profile />} />
            <Route path="/settings"      element={<Settings />} />
            <Route path="/chat"          element={<Chat />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;