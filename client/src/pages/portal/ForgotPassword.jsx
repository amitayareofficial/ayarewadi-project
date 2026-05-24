import { useState } from "react";
import { memberApi } from "@/services/memberApi";

export default function ForgotPassword({ onGoBack }) {
  const [mobile,  setMobile]  = useState("");
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setMsg({ type: "error", text: "Enter a valid 10-digit mobile number" });
      return;
    }
    setLoading(true); setMsg(null);
    try {
      await memberApi.forgotPassword(mobile, email);
      setMsg({ type: "success", text: "Request submitted! Admin will contact you to reset your password." });
      setMobile(""); setEmail("");
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || "Request failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ fontSize: "2.5rem" }}>🔑</div>
          <h2 style={styles.title}>Forgot Password</h2>
          <p style={styles.subtitle}>Admin will reset your password manually</p>
        </div>

        <div style={styles.infoBox}>
          <strong>How it works:</strong> Enter your registered mobile number. The admin will contact you to verify your identity and reset your password. We do <strong>not</strong> use paid OTP systems for this.
        </div>

        <form onSubmit={submit} style={styles.form}>
          <div>
            <label style={styles.label}>Registered Mobile Number *</label>
            <input
              style={styles.input}
              value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ""))}
              placeholder="10-digit mobile number" maxLength={10} inputMode="numeric"
            />
          </div>

          <div>
            <label style={styles.label}>Email (optional — helps admin verify you)</label>
            <input
              style={styles.input} type="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          {msg && (
            <div style={{
              ...styles.msgBox,
              background: msg.type === "success" ? "#e8f5e9" : "#ffebee",
              color:      msg.type === "success" ? "#1b5e20" : "#b71c1c",
              borderColor: msg.type === "success" ? "#a5d6a7" : "#ef9a9a",
            }}>
              {msg.type === "success" ? "✅ " : "❌ "}{msg.text}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Submitting..." : "Submit Request"}
          </button>

          <button type="button" style={styles.backBtn} onClick={onGoBack}>
            ← Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", justifyContent: "center", padding: "2rem 1rem 3rem" },
  card: { background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.1)", padding: "2rem", width: "100%", maxWidth: 420 },
  header: { textAlign: "center", marginBottom: "1.5rem" },
  title: { fontSize: "1.5rem", fontWeight: 800, color: "#1b5e20", margin: "8px 0 4px" },
  subtitle: { fontSize: "0.85rem", color: "#666", margin: 0 },
  infoBox: { background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 8, padding: "12px 14px", fontSize: "0.82rem", color: "#5d4037", lineHeight: 1.6, marginBottom: "1.25rem" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  label: { display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#444", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" },
  input: { width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: "1rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  msgBox: { padding: "10px 14px", borderRadius: 8, border: "1px solid", fontSize: "0.85rem", fontWeight: 500 },
  submitBtn: { background: "linear-gradient(135deg, #2e7d32, #4caf50)", color: "#fff", border: "none", padding: "13px", borderRadius: 10, fontSize: "1rem", fontWeight: 700, cursor: "pointer" },
  backBtn: { background: "none", border: "none", color: "#666", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline", textAlign: "center" },
};
