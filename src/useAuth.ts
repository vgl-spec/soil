import axios from "axios";

const API_URL = "http://localhost:8012/Test/API/login.php";

export const login = async (username: string, password: string) => {
  console.log("Payload being sent:", { username, password }); // Debug log
  try {
    const res = await axios.post(API_URL, { username, password }, {
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