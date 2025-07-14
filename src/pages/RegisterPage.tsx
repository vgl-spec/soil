import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../useAuth";
import { showToast } from "../utils/toastUtils";

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    username: "", email: "", password: "", contact: "", subdivision: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!form.username || !form.email || !form.password || !form.contact || !form.subdivision) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    // Password validation
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const response = await register(form);

      if (response.success) {
        showToast.success("Registration Successful!", `Welcome ${form.username}! You can now log in.`);
        // Clear form
        setForm({
          username: "", email: "", password: "", contact: "", subdivision: ""
        });
        // Navigate to login after a short delay
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setError(response.message || "Registration failed.");
        showToast.error("Registration Failed", response.message || "Please try again.");
      }
    } catch (error) {
      setError("Registration failed. Please try again.");
      showToast.error("Network Error", "Unable to connect to server. Please check your connection.");
      console.error("Error during registration:", error);
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
          <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded shadow-md w-full max-w-sm space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-center">Register</h2>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <input 
              type="text" 
              placeholder="Username" 
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full p-2 border rounded text-sm sm:text-base"
              disabled={loading}
            />
            <input 
              type="email" 
              placeholder="Email" 
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-2 border rounded text-sm sm:text-base"
              disabled={loading}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full p-2 border rounded text-sm sm:text-base"
              disabled={loading}
            />
            <input 
              type="text" 
              placeholder="Contact Number" 
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="w-full p-2 border rounded text-sm sm:text-base"
              disabled={loading}
            />
            <input 
              type="text" 
              placeholder="Subdivision/Address" 
              value={form.subdivision}
              onChange={(e) => setForm({ ...form, subdivision: e.target.value })}
              className="w-full p-2 border rounded text-sm sm:text-base"
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#8a9b6e] hover:bg-[#7a8b5e] disabled:bg-gray-400 text-white p-2 rounded transition-all duration-200 text-sm sm:text-base disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-none"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
            <p className="text-xs sm:text-sm text-center">
              Already have an account? <Link to="/" className="text-[#8a9b6e] underline hover:text-[#7a8b5e] transition-colors duration-200">Login here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
