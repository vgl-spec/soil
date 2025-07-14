import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./utils/hotToast";
import LoginPage from "./pages/LoginPage";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import RegisterPage from "./pages/RegisterPage"; 
import AppOperator from "./AppOperator"; // existing full inventory view
import UserView from "./pages/UserView";

const ProtectedRoute = ({ children, role }: { children: JSX.Element; role: string }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  console.log("ProtectedRoute - Current user:", user);
  console.log("ProtectedRoute - Required role:", role);
  
  if (!user || user.role !== role) {
    console.log("ProtectedRoute - Redirecting to login");
    return <Navigate to="/" />;
  }
  
  console.log("ProtectedRoute - Access granted");
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
      
      {/* React Hot Toast container - mobile optimized */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
          top: '1rem',
          left: '1rem',
          right: '1rem',
        }}
        toastOptions={{
          className: '',
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            maxWidth: '90vw',
            padding: '12px 16px',
            wordBreak: 'break-word',
            lineHeight: '1.4',
          },
        }}
      />
    </Router>
  );
}

export default App;