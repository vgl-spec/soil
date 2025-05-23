import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    username: "", email: "", password: "", contact: "", subdivision: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password || !form.contact || !form.subdivision) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await axios.post("https://soil-3tik.onrender.com/API/register.php", form, {
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
      <div className="w-full max-w-xs sm:max-w-sm rounded-lg shadow-lg relative">
        <div
          className="absolute inset-0 rounded-lg"
          style={{ background: "rgba(255, 255, 255, 0.9)", zIndex: 0, backdropFilter: "blur(8px)" }}
          aria-hidden="true"
        />
        <div className="relative z-10 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded shadow-md w-full max-w-sm space-y-3 sm:space-y-4 text-sm sm:text-base">
            <h2 className="text-lg sm:text-xl font-semibold text-center">Register</h2>
            {error && <p className="text-red-600 text-xs sm:text-sm">{error}</p>}
            {["username", "email", "password", "contact", "subdivision"].map((key) => (
              <input
                key={key}
                type={key === "password" ? "password" : "text"}
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full p-2 border rounded text-xs sm:text-sm"
              />
            ))}
            <button type="submit" className="w-full bg-green-700 text-white p-2 rounded text-xs sm:text-sm">
              Register
            </button>
            <p className="text-xs sm:text-sm text-center">
              Already have an account? <Link to="/" className="text-green-700 underline">Login here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
