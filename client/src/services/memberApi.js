import axios from "axios";

const API = "https://ayarewadi-project.onrender.com/api/members";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("member_token")}`,
});

export const memberApi = {
  register: (formData) =>
    axios.post(`${API}/register`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  login: (mobile, password) =>
    axios.post(`${API}/login`, { mobile, password }),

  verifyOtp: (mobile, firebase_uid) =>
    axios.post(`${API}/verify-otp`, { mobile, firebase_uid }),

  getMe: () =>
    axios.get(`${API}/me`, { headers: authHeader() }),

  forgotPassword: (mobile, email) =>
    axios.post(`${API}/forgot-password`, { mobile, email }),
};
