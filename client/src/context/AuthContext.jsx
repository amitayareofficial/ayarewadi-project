import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API = "https://ayarewadi-project.onrender.com";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("member_token");
    if (!token) { setLoading(false); return; }
    axios
      .get(`${API}/api/members/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setMember(r.data))
      .catch(() => localStorage.removeItem("member_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = (token, memberData) => {
    localStorage.setItem("member_token", token);
    setMember(memberData);
  };

  const logout = () => {
    localStorage.removeItem("member_token");
    setMember(null);
  };

  const getToken = () => localStorage.getItem("member_token");

  return (
    <AuthContext.Provider value={{ member, loading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
