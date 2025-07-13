import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    username: "", email: "", password: "", contact: "", subdivision: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.username || !form.email || !form.password || !form.contact || !form.subdivision) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/register.php`, form, {
        headers: { "Content-Type": "application/json" }
      });

      if (response.data.success) {
        navigate("/");
      } else {
        setError(response.data.message || "Registration failed.");
      }
    } catch (error) {
      setError("Registration failed. Please try again.");
      console.error("Error during registration:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-2 sm:p-4">
      <div className="w-full max-w-md rounded-lg shadow-lg relative max-h-[95vh] overflow-y-auto">
        {/* Translucent background layer */}
        <div
          className="absolute inset-0 rounded-lg"
          style={{ background: "rgba(255, 255, 255, 0.45)", zIndex: 0, backdropFilter: "blur(8px)" }}
          aria-hidden="true"
        />
        {/* Content layer */}
        <div className="relative z-10 p-3 sm:p-6">
          <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded shadow-md w-full max-w-md space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-center">Register</h2>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {["username", "email", "password", "contact", "subdivision"].map((key) => (
              <input
                key={key}
                type={key === "password" ? "password" : key === "email" ? "email" : "text"}
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full p-2 border rounded text-sm sm:text-base"
              />
            ))}
            <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white p-2 rounded transition-colors text-sm sm:text-base">
              Register
            </button>
            <p className="text-xs sm:text-sm text-center">
              Already have an account? <Link to="/" className="text-green-700 underline hover:text-green-800">Login here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
