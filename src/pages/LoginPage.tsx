import React, { useState } from "react";
import { login } from "../useAuth";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "../utils/toastUtils";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  
  showToast.loading("Logging in...");
  
  try {
    const result = await login(username, password);
    
    showToast.close();
    
    if (result.success) {
      localStorage.setItem("user", JSON.stringify(result));
      showToast.success("Login Successful", `Welcome back, ${result.username}!`);
      if (result.role === "supervisor") navigate("/supervisor");
      else if (result.role === "operator") navigate("/operator");
      else navigate("/user");
    } else {
      setError(result.message || "Login failed.");
      showToast.error("Login Failed", result.message || "Please check your credentials and try again.");
    }
  } catch (error) {
    console.error("Login error:", error);
    showToast.close();
    setError("An error occurred during login. Please try again.");
    showToast.error("Login Error", "An unexpected error occurred. Please try again.");
  } finally {
    setLoading(false);
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
              className="w-full p-2 border rounded text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={loading}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={loading}
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#8a9b6e] hover:bg-[#7a8b5e] disabled:bg-gray-400 text-white p-2 rounded transition-all duration-200 text-sm sm:text-base shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? "Logging in..." : "Login"}
            </button>
            <p className="text-xs sm:text-sm text-center">
              No account? <Link to="/register" className="text-[#8a9b6e] underline hover:text-[#7a8b5e] transition-colors duration-200">Register here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
