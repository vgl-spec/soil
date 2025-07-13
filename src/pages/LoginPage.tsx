import React, { useState } from "react";
import { login } from "../useAuth";
import { useNavigate, Link } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log("Attempting login with:", { username, password }); // Debug log
  const result = await login(username, password);
  console.log("Login result:", result); // Debug log
  if (result.success) {
    localStorage.setItem("user", JSON.stringify(result));
    if (result.role === "supervisor") navigate("/supervisor");
    else if (result.role === "operator") navigate("/operator");
    else navigate("/user");
  } else {
    console.error("Login failed:", result.message); // Debug log
    setError(result.message || "Login failed.");
  }
};  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-2 sm:p-4">
      <div className="w-full max-w-sm rounded-lg shadow-lg relative">
        {/* Translucent background layer */}
        <div
          className="absolute inset-0 rounded-lg"
          style={{ background: "rgba(255, 255, 255, 0.45)", zIndex: 0, backdropFilter: "blur(8px)" }}
          aria-hidden="true"
        />
        {/* Content layer */}
        <div className="relative z-10 p-3 sm:p-6">
          <form onSubmit={handleLogin} className="bg-white p-4 sm:p-6 rounded shadow-md w-full max-w-sm space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-center">Login</h2>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded text-sm sm:text-base"
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded text-sm sm:text-base"
            />
            <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white p-2 rounded transition-colors text-sm sm:text-base">
              Login
            </button>
            <p className="text-xs sm:text-sm text-center">
              No account? <Link to="/register" className="text-green-700 underline hover:text-green-800">Register here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
