import axios from "axios";
import { API_BASE_URL } from "./config/api";

const LOGIN_API_URL = `${API_BASE_URL}/login.php`;
const REGISTER_API_URL = `${API_BASE_URL}/register.php`;

export const login = async (username: string, password: string) => {
  console.log("Payload being sent:", { username, password }); // Debug log
  try {
    const res = await axios.post(LOGIN_API_URL, { username, password }, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true
    });
    console.log("Response received:", res.data); // Debug log
    return res.data;
  } catch (err) {
    console.error("Axios error:", err); // Debug log
    return { success: false, message: "Network error" };
  }
};

export const register = async (formData: {
  username: string;
  email: string;
  password: string;
  contact: string;
  subdivision: string;
}) => {
  console.log("Registration payload being sent:", formData); // Debug log
  try {
    const res = await axios.post(REGISTER_API_URL, formData, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true
    });
    console.log("Registration response received:", res.data); // Debug log
    return res.data;
  } catch (err) {
    console.error("Registration axios error:", err); // Debug log
    return { success: false, message: "Network error" };
  }
};