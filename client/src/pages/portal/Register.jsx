import { useState, useRef } from "react";
import { memberApi } from "@/services/memberApi";

const STRENGTH = [
  { label: "Very Weak", color: "#e53935" },
  { label: "Weak",      color: "#fb8c00" },
  { label: "Fair",      color: "#fdd835" },
  { label: "Good",      color: "#43a047" },
  { label: "Strong",    color: "#1b5e20" },
];

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8)                    score++;
  if (/[A-Z]/.test(pw))                  score++;
  if (/[0-9]/.test(pw))                  score++;
  if (/[^A-Za-z0-9]/.test(pw))          score++;
  if (pw.length >= 12)                   score++;
  return Math.min(score, 4);
}

export default function Register({ onGoLogin }) {
  const [form, setForm]       = useState({
    full_name: "", dob: "", mobile: "", email: "",
    address: "", password: "", confirm: "",
  });
  const [photo, setPhoto]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState(null); // { type: 'success'|'error', text }
  const fileRef               = useRef();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const strength = getStrength(form.password);

  const validate = () => {
    if (!form.full_name.trim())           return "Full name required";
    if (!form.dob)                        return "Date of birth required";
    if (!/^[6-9]\d{9}$/.test(form.mobile)) return "Enter valid 10-digit mobile number";
    if (form.password.length < 6)         return "Password must be at least 6 characters";
    if (form.password !== form.confirm)   return "Passwords do not match";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setMsg({ type: "error", text: err }); return; }

    setLoading(true);
    setMsg(null);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (k !== "confirm") fd.append(k, v); });
    if (photo) fd.append("photo", photo);

    try {
      await memberApi.register(fd);
      setMsg({ type: "success", text: "Registration submitted! Admin will review and approve your account." });
      setForm({ full_name: "", dob: "", mobile: "", email: "", address: "", password: "", confirm: "" });
      setPhoto(null); setPreview(null);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>👤</div>
          <h2 style={styles.title}>Member Registration</h2>
          <p style={styles.subtitle}>सभासद नोंदणी · Ayarewadi Village Portal</p>
        </div>

        {/* Photo upload */}
        <div style={styles.photoSection}>
          <div style={styles.photoCircle} onClick={() => fileRef.current.click()}>
            {preview
              ? <img src={preview} alt="Preview" style={styles.photoImg} />
              : <span style={styles.photoPlaceholder}>📷<br /><small>Upload Photo</small></span>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
          <button type="button" style={styles.photoBtn} onClick={() => fileRef.current.click()}>
            {preview ? "Change Photo" : "Choose Photo"}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={styles.form}>
          <div style={styles.row}>
            <Field label="Full Name *" placeholder="e.g. Amit Ayare"
              value={form.full_name} onChange={set("full_name")} />
            <Field label="Date of Birth *" type="date"
              value={form.dob} onChange={set("dob")} />
          </div>

          <div style={styles.row}>
            <Field label="Mobile Number *" placeholder="10-digit mobile"
              value={form.mobile} onChange={set("mobile")} maxLength={10} />
            <Field label="Email (optional)" placeholder="email@example.com" type="email"
              value={form.email} onChange={set("email")} />
          </div>

          <Field label="Address (optional)" placeholder="Village / Town, District"
            value={form.address} onChange={set("address")} />

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <Field label="Password *" type="password" placeholder="Min 6 characters"
                value={form.password} onChange={set("password")} />
              {form.password && (
                <div style={styles.strengthBar}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{
                      ...styles.strengthSegment,
                      background: i <= strength ? STRENGTH[strength].color : "#e0e0e0",
                    }} />
                  ))}
                  <span style={{ fontSize: "0.7rem", color: STRENGTH[strength].color, marginLeft: 6 }}>
                    {STRENGTH[strength].label}
                  </span>
                </div>
              )}
            </div>
            <Field label="Confirm Password *" type="password" placeholder="Repeat password"
              value={form.confirm} onChange={set("confirm")} />
          </div>

          {msg && (
            <div style={{ ...styles.msg, background: msg.type === "success" ? "#e8f5e9" : "#ffebee",
              color: msg.type === "success" ? "#1b5e20" : "#b71c1c",
              borderColor: msg.type === "success" ? "#a5d6a7" : "#ef9a9a" }}>
              {msg.type === "success" ? "✅ " : "❌ "}{msg.text}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Submitting..." : "Submit Registration · नोंदणी करा"}
          </button>

          <p style={styles.loginLink}>
            Already registered?{" "}
            <button type="button" style={styles.link} onClick={onGoLogin}>Login here</button>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label style={styles.label}>{label}</label>
      <input style={styles.input} {...props} />
    </div>
  );
}

const styles = {
  wrap: { display: "flex", justifyContent: "center", padding: "2rem 1rem 3rem" },
  card: { background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.1)", padding: "2rem", width: "100%", maxWidth: 680 },
  header: { textAlign: "center", marginBottom: "1.5rem" },
  headerIcon: { fontSize: "2.5rem", marginBottom: 8 },
  title: { fontSize: "1.5rem", fontWeight: 800, color: "#1b5e20", margin: 0 },
  subtitle: { fontSize: "0.85rem", color: "#666", margin: "4px 0 0" },
  photoSection: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem", gap: 8 },
  photoCircle: { width: 100, height: 100, borderRadius: "50%", border: "3px dashed #4caf50", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", background: "#f1f8e9" },
  photoImg: { width: "100%", height: "100%", objectFit: "cover" },
  photoPlaceholder: { textAlign: "center", color: "#4caf50", fontSize: "1.4rem", lineHeight: 1.4 },
  photoBtn: { background: "none", border: "1px solid #4caf50", color: "#2e7d32", padding: "4px 14px", borderRadius: 20, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  row: { display: "flex", gap: "1rem", flexWrap: "wrap" },
  label: { display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#444", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" },
  input: { width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: "0.9rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", fontFamily: "inherit" },
  strengthBar: { display: "flex", alignItems: "center", gap: 3, marginTop: 6 },
  strengthSegment: { flex: 1, height: 4, borderRadius: 2, transition: "background 0.3s" },
  msg: { padding: "10px 14px", borderRadius: 8, border: "1px solid", fontSize: "0.85rem", fontWeight: 500 },
  submitBtn: { background: "linear-gradient(135deg, #2e7d32, #4caf50)", color: "#fff", border: "none", padding: "13px", borderRadius: 10, fontSize: "1rem", fontWeight: 700, cursor: "pointer", marginTop: 4 },
  loginLink: { textAlign: "center", fontSize: "0.85rem", color: "#666", margin: 0 },
  link: { background: "none", border: "none", color: "#2e7d32", fontWeight: 700, cursor: "pointer", textDecoration: "underline" },
};
