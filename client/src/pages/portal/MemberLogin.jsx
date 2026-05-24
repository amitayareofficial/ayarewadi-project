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
    if (!mobile || !password) { setError("Please enter mobile number and password"); return; }
    if (!/^[6-9]\d{9}$/.test(mobile)) { setError("Enter a valid 10-digit mobile number"); return; }

    setLoading(true); setError("");
    try {
      const res  = await memberApi.login(mobile, password);
      login(res.data.token, res.data.member);
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
        {/* Header */}
        <div style={s.header}>
          <div style={s.logo}>🏠</div>
          <h2 style={s.title}>Member Login</h2>
          <p style={s.subtitle}>सभासद लॉगिन · Ayarewadi Village Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={s.form}>
          <div>
            <label style={s.label}>Mobile Number</label>
            <div style={s.inputWrap}>
              <span style={s.prefix}>+91</span>
              <input
                style={s.inputWithPrefix}
                value={mobile}
                onChange={e => setMobile(e.target.value.replace(/\D/g, ""))}
                placeholder="10-digit mobile"
                maxLength={10}
                inputMode="numeric"
              />
            </div>
          </div>

          <div>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
            />
          </div>

          {error && (
            <div style={s.errBox}>⚠️ {error}</div>
          )}

          <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Signing in..." : "Login · प्रवेश करा"}
          </button>

          <button type="button" style={s.forgotBtn} onClick={onGoForgot}>
            Forgot Password?
          </button>
        </form>

        <div style={s.divider}><span style={s.dividerText}>New member?</span></div>

        <button style={s.registerBtn} onClick={onGoRegister}>
          Register Now · नोंदणी करा
        </button>

        <p style={s.note}>
          Only approved members can login. Registration requires admin approval.
        </p>
      </div>
    </div>
  );
}

const s = {
  wrap:            { display:"flex", justifyContent:"center", padding:"2rem 1rem 3rem" },
  card:            { background:"#fff", borderRadius:20, boxShadow:"0 2px 20px rgba(0,0,0,0.08)", padding:"2rem", width:"100%", maxWidth:420 },
  header:          { textAlign:"center", marginBottom:"1.75rem" },
  logo:            { fontSize:"2.5rem", marginBottom:8 },
  title:           { fontSize:"1.5rem", fontWeight:800, color:"#1b5e20", margin:"0 0 4px" },
  subtitle:        { fontSize:"0.82rem", color:"#888", margin:0 },
  form:            { display:"flex", flexDirection:"column", gap:"1.1rem" },
  label:           { display:"block", fontSize:"0.72rem", fontWeight:700, color:"#555", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" },
  inputWrap:       { display:"flex", border:"1.5px solid #e8e8e8", borderRadius:10, overflow:"hidden", background:"#fafafa" },
  prefix:          { padding:"11px 12px", background:"#f0f0f0", color:"#555", fontWeight:700, fontSize:"0.92rem", borderRight:"1.5px solid #e8e8e8", whiteSpace:"nowrap" },
  inputWithPrefix: { flex:1, padding:"11px 12px", border:"none", outline:"none", fontSize:"0.92rem", fontFamily:"inherit", background:"transparent" },
  input:           { width:"100%", padding:"11px 13px", border:"1.5px solid #e8e8e8", borderRadius:10, fontSize:"0.92rem", outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:"#fafafa" },
  errBox:          { background:"#fff3f3", color:"#c62828", border:"1px solid #ffcdd2", borderRadius:10, padding:"10px 14px", fontSize:"0.85rem", fontWeight:500 },
  btn:             { background:"linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)", color:"#fff", border:"none", padding:"13px", borderRadius:12, fontSize:"1rem", fontWeight:700, cursor:"pointer" },
  forgotBtn:       { background:"none", border:"none", color:"#1976d2", fontSize:"0.83rem", cursor:"pointer", textAlign:"center", textDecoration:"underline", padding:0 },
  divider:         { textAlign:"center", margin:"1.25rem 0", position:"relative", borderTop:"1px solid #eee" },
  dividerText:     { background:"#fff", position:"relative", top:-10, padding:"0 10px", color:"#aaa", fontSize:"0.78rem" },
  registerBtn:     { width:"100%", background:"#fff", border:"2px solid #2e7d32", color:"#2e7d32", padding:"11px", borderRadius:12, fontWeight:700, fontSize:"0.95rem", cursor:"pointer" },
  note:            { textAlign:"center", fontSize:"0.75rem", color:"#aaa", margin:"12px 0 0", lineHeight:1.5 },
};
