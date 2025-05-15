import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import RegisterPage from "./pages/RegisterPage"; 
import AppOperator from "./AppOperator"; // existing full inventory view
import UserView from "./pages/UserView";

const ProtectedRoute = ({ children, role }: { children: JSX.Element; role: string }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user || user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage />} /> {/* Ensure this route is added */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/operator" element={
          <ProtectedRoute role="operator">
            <AppOperator />
          </ProtectedRoute>
        } />
        <Route path="/supervisor" element={
          <ProtectedRoute role="supervisor">
            <SupervisorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/user" element={
          <ProtectedRoute role="user">
            <UserView />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;