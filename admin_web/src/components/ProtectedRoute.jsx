// components/ProtectedRoute.jsx
// Redirects to / if no token found
import { Navigate, Outlet } from 'react-router-dom';
import { isLoggedIn } from '../api/api';

export default function ProtectedRoute() {
  return isLoggedIn() ? <Outlet /> : <Navigate to="/" replace />;
}