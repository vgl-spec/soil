import axios from "axios";

const API_URL = "https://soil-3tik.onrender.com/API/login.php";

export const login = async (username: string, password: string) => {
  console.log("Payload:", { username, password });
  try {
    const res = await axios.post(API_URL, { username, password }, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true
    });
    return res.data;
  } catch (err) {
    console.error(err);
    return { success: false, message: "Network error" };
  }
};
