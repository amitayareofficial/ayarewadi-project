import { useState, useRef, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/firebase";
import { memberApi } from "@/services/memberApi";
import { useAuth } from "@/context/AuthContext";

const STRENGTH = [
  { label: "Very Weak", color: "#e53935" },
  { label: "Weak",      color: "#fb8c00" },
  { label: "Fair",      color: "#fdd835" },
  { label: "Good",      color: "#43a047" },
  { label: "Strong",    color: "#1b5e20" },
];

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12)         score++;
  return Math.min(score, 4);
}

// ── PHASE 1: Registration form ────────────────────────────
function RegistrationForm({ onSubmitOk, onGoLogin }) {
  const [form, setForm]   = useState({ full_name:"", dob:"", mobile:"", email:"", address:"", password:"", confirm:"" });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const fileRef = useRef();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const strength = getStrength(form.password);

  const handlePhoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!form.full_name.trim())              return "Full name required";
    if (!form.dob)                           return "Date of birth required";
    if (!/^[6-9]\d{9}$/.test(form.mobile))  return "Enter valid 10-digit mobile number";
    if (form.password.length < 6)            return "Password must be at least 6 characters";
    if (form.password !== form.confirm)      return "Passwords do not match";
    return null;
  };

  const submit = async e => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true); setError("");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (k !== "confirm") fd.append(k, v); });
    if (photo) fd.append("photo", photo);

    try {
      await memberApi.register(fd);
      onSubmitOk(form.mobile); // proceed to OTP phase
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.headerIcon}>👤</div>
          <h2 style={s.title}>Member Registration</h2>
          <p style={s.subtitle}>सभासद नोंदणी · Ayarewadi Village Portal</p>
        </div>

        {/* Photo */}
        <div style={s.photoSection}>
          <div style={s.photoCircle} onClick={() => fileRef.current.click()}>
            {preview
              ? <img src={preview} alt="Preview" style={s.photoImg} />
              : <span style={s.photoPlaceholder}>📷<br /><small>Upload Photo</small></span>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handlePhoto} />
          <button type="button" style={s.photoBtn} onClick={() => fileRef.current.click()}>
            {preview ? "Change Photo" : "Choose Photo"}
          </button>
        </div>

        <form onSubmit={submit} style={s.form}>
          <div style={s.row}>
            <Field label="Full Name *" placeholder="e.g. Amit Ayare" value={form.full_name} onChange={set("full_name")} />
            <Field label="Date of Birth *" type="date" value={form.dob} onChange={set("dob")} />
          </div>
          <div style={s.row}>
            <Field label="Mobile Number *" placeholder="10-digit mobile" value={form.mobile} onChange={set("mobile")} maxLength={10} />
            <Field label="Email (optional)" placeholder="email@example.com" type="email" value={form.email} onChange={set("email")} />
          </div>
          <Field label="Address (optional)" placeholder="Village / Town, District" value={form.address} onChange={set("address")} />
          <div style={s.row}>
            <div style={{ flex:1 }}>
              <Field label="Password *" type="password" placeholder="Min 6 characters" value={form.password} onChange={set("password")} />
              {form.password && (
                <div style={s.strengthBar}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{ ...s.strengthSeg, background: i <= strength ? STRENGTH[strength].color : "#e0e0e0" }} />
                  ))}
                  <span style={{ fontSize:"0.7rem", color:STRENGTH[strength].color, marginLeft:6 }}>{STRENGTH[strength].label}</span>
                </div>
              )}
            </div>
            <Field label="Confirm Password *" type="password" placeholder="Repeat password" value={form.confirm} onChange={set("confirm")} />
          </div>

          {error && <div style={s.errBox}>❌ {error}</div>}

          <button type="submit" disabled={loading} style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Creating account..." : "Create Account · नोंदणी करा"}
          </button>

          <p style={s.loginLink}>
            Already registered?{" "}
            <button type="button" style={s.link} onClick={onGoLogin}>Login here</button>
          </p>
        </form>
      </div>
    </div>
  );
}

// ── PHASE 2: OTP Verification ─────────────────────────────
function OtpVerification({ mobile, onVerified, onGoLogin }) {
  const { login } = useAuth();
  const [otp,        setOtp]        = useState("");
  const [loading,    setLoading]    = useState(false);
  const [sending,    setSending]    = useState(false);
  const [error,      setError]      = useState("");
  const [sentOk,     setSentOk]     = useState(false);
  const [confirmed,  setConfirmed]  = useState(false);
  const [confirmRes, setConfirmRes] = useState(null);

  const recaptchaRef      = useRef(null);
  const recaptchaVerifier = useRef(null);

  useEffect(() => {
    sendOtp();
    return () => {
      if (recaptchaVerifier.current) { try { recaptchaVerifier.current.clear(); } catch {} }
    };
  }, []);

  const sendOtp = async () => {
    setSending(true); setError("");
    try {
      if (!recaptchaVerifier.current && recaptchaRef.current) {
        recaptchaVerifier.current = new RecaptchaVerifier(auth, recaptchaRef.current, { size: "invisible", callback: () => {} });
      }
      const confirmation = await signInWithPhoneNumber(auth, "+91" + mobile, recaptchaVerifier.current);
      setConfirmRes(confirmation);
      setSentOk(true);
    } catch (err) {
      setError("Failed to send OTP. Check mobile number or try again. " + (err.message || ""));
      if (recaptchaVerifier.current) { try { recaptchaVerifier.current.clear(); } catch {} recaptchaVerifier.current = null; }
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async e => {
    e.preventDefault();
    if (!otp || otp.length < 6) { setError("Enter the 6-digit OTP"); return; }
    setLoading(true); setError("");
    try {
      const result  = await confirmRes.confirm(otp);
      const uid     = result.user.uid;
      const res     = await memberApi.verifyOtp(mobile, uid);
      const data    = res.data;

      if (data.loggedIn && data.token) {
        login(data.token, data.member);
      }
      setConfirmed(true);
      onVerified(data.pendingApproval);
    } catch (err) {
      if (err.code === "auth/invalid-verification-code") {
        setError("Wrong OTP. Please check and try again.");
      } else {
        setError(err.response?.data?.error || "OTP verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) return null;

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.headerIcon}>📱</div>
          <h2 style={s.title}>Verify Mobile Number</h2>
          <p style={s.subtitle}>मोबाइल पडताळणी · +91 {mobile}</p>
        </div>

        {sending && (
          <div style={s.infoBox}>Sending OTP to +91 {mobile}...</div>
        )}
        {sentOk && !sending && (
          <div style={{ ...s.infoBox, background:"#e8f5e9", borderColor:"#c8e6c9", color:"#1b5e20" }}>
            ✅ OTP sent to +91 {mobile}. Check your messages.
          </div>
        )}

        <form onSubmit={verifyOtp} style={s.form}>
          <div>
            <label style={s.label}>6-Digit OTP</label>
            <input
              style={{ ...s.input, textAlign:"center", letterSpacing:"0.5em", fontSize:"1.5rem" }}
              value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,""))}
              maxLength={6} placeholder="——————" inputMode="numeric"
            />
          </div>

          {error && <div style={s.errBox}>❌ {error}</div>}

          <button type="submit" disabled={loading || sending} style={{ ...s.submitBtn, opacity:(loading||sending)?0.7:1 }}>
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>

          <button type="button" style={s.secondaryBtn} onClick={sendOtp} disabled={sending}>
            {sending ? "Resending..." : "Resend OTP"}
          </button>
        </form>

        <div ref={recaptchaRef} />
      </div>
    </div>
  );
}

// ── PHASE 3: Success screen ───────────────────────────────
function RegistrationSuccess({ onGoLogin }) {
  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={{ textAlign:"center", padding:"2rem 0" }}>
          <div style={{ fontSize:"4rem", marginBottom:"1rem" }}>✅</div>
          <h2 style={{ ...s.title, marginBottom:8 }}>Registration Complete!</h2>
          <p style={{ color:"#555", lineHeight:1.7, marginBottom:"1.5rem" }}>
            Your mobile is verified. Your account is now<br />
            <strong style={{ color:"#e65100" }}>pending admin approval.</strong><br /><br />
            Once admin approves, you can login with your<br />
            <strong>Mobile Number + Password</strong>.
          </p>

          <div style={s.stepsBox}>
            <div style={s.step}><span style={s.stepDone}>✓</span> Mobile number verified</div>
            <div style={s.step}><span style={s.stepPending}>⏳</span> Admin approval pending</div>
            <div style={s.step}><span style={s.stepLocked}>🔐</span> Login with mobile + password</div>
          </div>

          <button style={s.submitBtn} onClick={onGoLogin}>Go to Login</button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────
export default function Register({ onGoLogin }) {
  const [phase, setPhase] = useState("form"); // form | otp | success
  const [mobile, setMobile] = useState("");

  if (phase === "form")    return <RegistrationForm onSubmitOk={m => { setMobile(m); setPhase("otp"); }} onGoLogin={onGoLogin} />;
  if (phase === "otp")     return <OtpVerification  mobile={mobile} onVerified={() => setPhase("success")} onGoLogin={onGoLogin} />;
  if (phase === "success") return <RegistrationSuccess onGoLogin={onGoLogin} />;
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
  wrap:        { display:"flex", justifyContent:"center", padding:"2rem 1rem 3rem" },
  card:        { background:"#fff", borderRadius:16, boxShadow:"0 4px 24px rgba(0,0,0,0.1)", padding:"2rem", width:"100%", maxWidth:680 },
  header:      { textAlign:"center", marginBottom:"1.5rem" },
  headerIcon:  { fontSize:"2.5rem", marginBottom:8 },
  title:       { fontSize:"1.5rem", fontWeight:800, color:"#1b5e20", margin:0 },
  subtitle:    { fontSize:"0.85rem", color:"#666", margin:"4px 0 0" },
  photoSection:{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:"1.5rem", gap:8 },
  photoCircle: { width:100, height:100, borderRadius:"50%", border:"3px dashed #4caf50", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden", background:"#f1f8e9" },
  photoImg:    { width:"100%", height:"100%", objectFit:"cover" },
  photoPlaceholder: { textAlign:"center", color:"#4caf50", fontSize:"1.4rem", lineHeight:1.4 },
  photoBtn:    { background:"none", border:"1px solid #4caf50", color:"#2e7d32", padding:"4px 14px", borderRadius:20, cursor:"pointer", fontSize:"0.8rem", fontWeight:600 },
  form:        { display:"flex", flexDirection:"column", gap:"1rem" },
  row:         { display:"flex", gap:"1rem", flexWrap:"wrap" },
  label:       { display:"block", fontSize:"0.78rem", fontWeight:700, color:"#444", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.05em" },
  input:       { width:"100%", padding:"10px 12px", border:"1.5px solid #e0e0e0", borderRadius:8, fontSize:"0.9rem", outline:"none", boxSizing:"border-box", fontFamily:"inherit" },
  strengthBar: { display:"flex", alignItems:"center", gap:3, marginTop:6 },
  strengthSeg: { flex:1, height:4, borderRadius:2, transition:"background 0.3s" },
  errBox:      { background:"#ffebee", color:"#b71c1c", border:"1px solid #ef9a9a", borderRadius:8, padding:"10px 14px", fontSize:"0.85rem", fontWeight:500 },
  infoBox:     { background:"#fff8e1", border:"1px solid #ffe082", borderRadius:8, padding:"10px 14px", fontSize:"0.85rem", color:"#5d4037", marginBottom:"1rem" },
  submitBtn:   { background:"linear-gradient(135deg, #2e7d32, #4caf50)", color:"#fff", border:"none", padding:"13px", borderRadius:10, fontSize:"1rem", fontWeight:700, cursor:"pointer", width:"100%" },
  secondaryBtn:{ background:"none", border:"1.5px solid #bbb", color:"#555", padding:"10px", borderRadius:10, fontSize:"0.9rem", cursor:"pointer", width:"100%" },
  loginLink:   { textAlign:"center", fontSize:"0.85rem", color:"#666", margin:0 },
  link:        { background:"none", border:"none", color:"#2e7d32", fontWeight:700, cursor:"pointer", textDecoration:"underline" },
  stepsBox:    { background:"#f9f9f9", borderRadius:10, padding:"1rem", margin:"1rem 0 1.5rem", display:"flex", flexDirection:"column", gap:10, textAlign:"left" },
  step:        { display:"flex", alignItems:"center", gap:10, fontSize:"0.9rem" },
  stepDone:    { background:"#4caf50", color:"#fff", borderRadius:"50%", width:24, height:24, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.8rem", flexShrink:0 },
  stepPending: { fontSize:"1.2rem", width:24, textAlign:"center", flexShrink:0 },
  stepLocked:  { fontSize:"1.2rem", width:24, textAlign:"center", flexShrink:0 },
};
