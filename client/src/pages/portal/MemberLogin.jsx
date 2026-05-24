import { useState } from "react";
import { memberApi } from "@/services/memberApi";
import { useAuth } from "@/context/AuthContext";

export default function MemberLogin({ onGoRegister, onGoForgot, onLoginSuccess }) {
  const { login } = useAuth();
  const [mobile,   setMobile]   = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = async e => {
    e.preventDefault();
    if (!mobile || !password) { setError("Please enter mobile and password"); return; }
    if (!/^[6-9]\d{9}$/.test(mobile)) { setError("Enter valid 10-digit mobile number"); return; }

    setLoading(true); setError("");
    try {
      const res  = await memberApi.login(mobile, password);
      const data = res.data;
      login(data.token, data.member);
      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={{ fontSize:"2.5rem" }}>🏠</div>
          <h2 style={s.title}>Member Login</h2>
          <p style={s.subtitle}>सभासद लॉगिन · Ayarewadi Village Portal</p>
        </div>

        <form onSubmit={handleLogin} style={s.form}>
          <div>
            <label style={s.label}>Mobile Number</label>
            <input
              style={s.input}
              value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g,""))}
              placeholder="10-digit mobile number" maxLength={10} inputMode="numeric"
            />
          </div>

          <div>
            <label style={s.label}>Password</label>
            <input
              style={s.input} type="password"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
            />
          </div>

          {error && <div style={s.errBox}>{error}</div>}

          <button type="submit" disabled={loading} style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Signing in..." : "Login · प्रवेश करा"}
          </button>

          <button type="button" style={s.forgotBtn} onClick={onGoForgot}>
            Forgot Password?
          </button>
        </form>

        <div style={s.divider} />

        <div style={s.registerPrompt}>
          <p style={{ margin:0, color:"#666", fontSize:"0.85rem" }}>
            New member? Register and verify your mobile to join.
          </p>
          <button style={s.registerBtn} onClick={onGoRegister}>
            Register Now · नोंदणी करा
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  wrap:           { display:"flex", justifyContent:"center", padding:"2rem 1rem 3rem" },
  card:           { background:"#fff", borderRadius:16, boxShadow:"0 4px 24px rgba(0,0,0,0.1)", padding:"2rem", width:"100%", maxWidth:420 },
  header:         { textAlign:"center", marginBottom:"1.5rem" },
  title:          { fontSize:"1.5rem", fontWeight:800, color:"#1b5e20", margin:"8px 0 4px" },
  subtitle:       { fontSize:"0.85rem", color:"#666", margin:0 },
  form:           { display:"flex", flexDirection:"column", gap:"1rem" },
  label:          { display:"block", fontSize:"0.78rem", fontWeight:700, color:"#444", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.05em" },
  input:          { width:"100%", padding:"12px 14px", border:"1.5px solid #e0e0e0", borderRadius:8, fontSize:"1rem", outline:"none", boxSizing:"border-box", fontFamily:"inherit" },
  errBox:         { background:"#ffebee", color:"#b71c1c", border:"1px solid #ef9a9a", borderRadius:8, padding:"10px 14px", fontSize:"0.85rem", fontWeight:500 },
  submitBtn:      { background:"linear-gradient(135deg, #2e7d32, #4caf50)", color:"#fff", border:"none", padding:"13px", borderRadius:10, fontSize:"1rem", fontWeight:700, cursor:"pointer" },
  forgotBtn:      { background:"none", border:"none", color:"#1976d2", fontSize:"0.85rem", cursor:"pointer", textAlign:"center", textDecoration:"underline" },
  divider:        { borderTop:"1px solid #eee", margin:"1.25rem 0" },
  registerPrompt: { textAlign:"center", display:"flex", flexDirection:"column", gap:8, alignItems:"center" },
  registerBtn:    { background:"#fff", border:"2px solid #2e7d32", color:"#2e7d32", padding:"10px 24px", borderRadius:10, fontWeight:700, fontSize:"0.9rem", cursor:"pointer" },
};
