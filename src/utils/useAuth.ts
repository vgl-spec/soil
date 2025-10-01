import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/login.php`;

export const login = async (username: string, password: string) => {
  try {
    const res = await axios.post(API_URL, { username, password }, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true
    });
    return res.data;
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, message: "Network error" };
  }
};
