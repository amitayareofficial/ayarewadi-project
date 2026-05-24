import { useState, useRef } from "react";
import { memberApi } from "@/services/memberApi";

const STRENGTH_LEVELS = [
  { label: "Very Weak", color: "#e53935" },
  { label: "Weak",      color: "#fb8c00" },
  { label: "Fair",      color: "#fdd835" },
  { label: "Good",      color: "#43a047" },
  { label: "Strong",    color: "#1b5e20" },
];

function passwordStrength(pw) {
  let s = 0;
  if (pw.length >= 8)           s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length >= 12)         s++;
  return Math.min(s, 4);
}

export default function Register({ onGoLogin }) {
  const [form, setForm]     = useState({ full_name:"", dob:"", mobile:"", email:"", address:"", password:"", confirm:"" });
  const [photo, setPhoto]   = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [done, setDone]     = useState(false);
  const fileRef             = useRef();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const strength = passwordStrength(form.password);

  const handlePhoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!form.full_name.trim())             return "Full name is required";
    if (!form.dob)                          return "Date of birth is required";
    if (!/^[6-9]\d{9}$/.test(form.mobile)) return "Enter a valid 10-digit Indian mobile number";
    if (!photo)                             return "Profile photo is required";
    if (form.password.length < 6)           return "Password must be at least 6 characters";
    if (form.password !== form.confirm)     return "Passwords do not match";
    return null;
  };

  const submit = async e => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true); setError("");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (k !== "confirm") fd.append(k, v); });
    fd.append("photo", photo);

    try {
      await memberApi.register(fd);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.successBox}>
          <div style={s.successIcon}>✅</div>
          <h2 style={s.successTitle}>Registration Submitted!</h2>
          <p style={s.successText}>
            Your account has been created and is<br />
            <strong style={{ color:"#e65100" }}>pending admin approval.</strong>
          </p>
          <div style={s.stepsList}>
            <div style={s.stepItem}>
              <span style={{ ...s.stepBadge, background:"#4caf50" }}>✓</span>
              <span>Account created successfully</span>
            </div>
            <div style={s.stepItem}>
              <span style={{ ...s.stepBadge, background:"#ff9800" }}>2</span>
              <span>Admin will review your request</span>
            </div>
            <div style={s.stepItem}>
              <span style={{ ...s.stepBadge, background:"#9e9e9e" }}>3</span>
              <span>Login with mobile + password once approved</span>
            </div>
          </div>
          <button style={s.btn} onClick={onGoLogin}>Go to Login</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerEmoji}>👤</div>
          <h2 style={s.title}>Member Registration</h2>
          <p style={s.subtitle}>सभासद नोंदणी · Ayarewadi Village Portal</p>
        </div>

        {/* Photo upload */}
        <div style={s.photoArea}>
          <div
            style={{ ...s.photoCircle, borderColor: preview ? "#4caf50" : photo ? "#4caf50" : "#ccc" }}
            onClick={() => fileRef.current.click()}
          >
            {preview
              ? <img src={preview} alt="preview" style={s.photoImg} />
              : <div style={s.photoPlaceholder}>
                  <span style={{ fontSize:"2rem" }}>📷</span>
                  <span style={{ fontSize:"0.75rem", marginTop:4, color:"#888" }}>Upload Photo *</span>
                </div>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handlePhoto} />
          <button type="button" style={s.photoBtn} onClick={() => fileRef.current.click()}>
            {preview ? "Change Photo" : "Choose Photo *"}
          </button>
          {!photo && <span style={s.required}>Required</span>}
        </div>

        {/* Form */}
        <form onSubmit={submit} style={s.form}>
          <div style={s.row}>
            <Field label="Full Name *" placeholder="e.g. Amit Ayare" value={form.full_name} onChange={set("full_name")} />
            <Field label="Date of Birth *" type="date" value={form.dob} onChange={set("dob")} />
          </div>

          <div style={s.row}>
            <Field label="Mobile Number *" placeholder="10-digit mobile" value={form.mobile}
              onChange={set("mobile")} maxLength={10} inputMode="numeric" />
            <Field label="Email (optional)" placeholder="email@example.com" type="email"
              value={form.email} onChange={set("email")} />
          </div>

          <Field label="Address (optional)" placeholder="Village / Town, District"
            value={form.address} onChange={set("address")} />

          <div style={s.row}>
            <div style={{ flex:1 }}>
              <Field label="Password *" type="password" placeholder="Minimum 6 characters"
                value={form.password} onChange={set("password")} />
              {form.password && (
                <div style={s.strengthRow}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{ ...s.strengthBar, background: i <= strength ? STRENGTH_LEVELS[strength].color : "#e8e8e8" }} />
                  ))}
                  <span style={{ fontSize:"0.68rem", color: STRENGTH_LEVELS[strength].color, fontWeight:700, marginLeft:6, whiteSpace:"nowrap" }}>
                    {STRENGTH_LEVELS[strength].label}
                  </span>
                </div>
              )}
            </div>
            <Field label="Confirm Password *" type="password" placeholder="Repeat password"
              value={form.confirm} onChange={set("confirm")} />
          </div>

          {error && (
            <div style={s.errBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Creating account..." : "Create Account · नोंदणी करा"}
          </button>

          <p style={s.loginPrompt}>
            Already have an account?{" "}
            <button type="button" style={s.linkBtn} onClick={onGoLogin}>Login here</button>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div style={{ flex:1, minWidth:0 }}>
      <label style={s.label}>{label}</label>
      <input style={s.input} {...props} />
    </div>
  );
}

const s = {
  wrap:          { display:"flex", justifyContent:"center", padding:"1.5rem 1rem 3rem" },
  card:          { background:"#fff", borderRadius:20, boxShadow:"0 2px 20px rgba(0,0,0,0.08)", padding:"2rem", width:"100%", maxWidth:680 },
  header:        { textAlign:"center", marginBottom:"1.5rem" },
  headerEmoji:   { fontSize:"2.5rem", marginBottom:8 },
  title:         { fontSize:"1.5rem", fontWeight:800, color:"#1b5e20", margin:"0 0 4px" },
  subtitle:      { fontSize:"0.82rem", color:"#888", margin:0 },
  photoArea:     { display:"flex", flexDirection:"column", alignItems:"center", gap:6, marginBottom:"1.5rem" },
  photoCircle:   { width:96, height:96, borderRadius:"50%", border:"2.5px dashed #ccc", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden", background:"#fafafa", transition:"border-color 0.2s" },
  photoImg:      { width:"100%", height:"100%", objectFit:"cover" },
  photoPlaceholder: { display:"flex", flexDirection:"column", alignItems:"center" },
  photoBtn:      { background:"none", border:"1.5px solid #4caf50", color:"#2e7d32", padding:"5px 16px", borderRadius:20, cursor:"pointer", fontSize:"0.78rem", fontWeight:700 },
  required:      { fontSize:"0.7rem", color:"#e53935", fontWeight:600 },
  form:          { display:"flex", flexDirection:"column", gap:"1rem" },
  row:           { display:"flex", gap:"1rem", flexWrap:"wrap" },
  label:         { display:"block", fontSize:"0.72rem", fontWeight:700, color:"#555", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" },
  input:         { width:"100%", padding:"11px 13px", border:"1.5px solid #e8e8e8", borderRadius:10, fontSize:"0.92rem", outline:"none", boxSizing:"border-box", fontFamily:"inherit", transition:"border-color 0.2s", background:"#fafafa" },
  strengthRow:   { display:"flex", alignItems:"center", gap:3, marginTop:5 },
  strengthBar:   { flex:1, height:3, borderRadius:2, transition:"background 0.3s" },
  errBox:        { display:"flex", alignItems:"center", gap:8, background:"#fff3f3", color:"#c62828", border:"1px solid #ffcdd2", borderRadius:10, padding:"10px 14px", fontSize:"0.85rem", fontWeight:500 },
  btn:           { background:"linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)", color:"#fff", border:"none", padding:"13px", borderRadius:12, fontSize:"1rem", fontWeight:700, cursor:"pointer", transition:"opacity 0.2s" },
  loginPrompt:   { textAlign:"center", fontSize:"0.83rem", color:"#888", margin:0 },
  linkBtn:       { background:"none", border:"none", color:"#2e7d32", fontWeight:700, cursor:"pointer", textDecoration:"underline", fontSize:"inherit" },
  successBox:    { textAlign:"center", padding:"1rem 0" },
  successIcon:   { fontSize:"3.5rem", marginBottom:"1rem" },
  successTitle:  { fontSize:"1.5rem", fontWeight:800, color:"#1b5e20", margin:"0 0 8px" },
  successText:   { color:"#555", lineHeight:1.8, marginBottom:"1.5rem" },
  stepsList:     { background:"#f9f9f9", borderRadius:12, padding:"1rem 1.25rem", margin:"0 0 1.5rem", display:"flex", flexDirection:"column", gap:12, textAlign:"left" },
  stepItem:      { display:"flex", alignItems:"center", gap:12, fontSize:"0.88rem", color:"#444" },
  stepBadge:     { color:"#fff", borderRadius:"50%", width:24, height:24, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.75rem", fontWeight:800, flexShrink:0 },
};
