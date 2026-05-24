import { useState, useRef, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/firebase";
import { memberApi } from "@/services/memberApi";
import { useAuth } from "@/context/AuthContext";

export default function MemberLogin({ onGoRegister, onGoForgot, onLoginSuccess }) {
  const { login } = useAuth();

  // Login form
  const [mobile,   setMobile]   = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // OTP phase
  const [otpPhase,       setOtpPhase]       = useState(false);
  const [otp,            setOtp]            = useState("");
  const [otpLoading,     setOtpLoading]     = useState(false);
  const [otpError,       setOtpError]       = useState("");
  const [confirmResult,  setConfirmResult]  = useState(null);
  const [otpMobile,      setOtpMobile]      = useState("");

  const recaptchaRef = useRef(null);
  const recaptchaVerifier = useRef(null);

  useEffect(() => {
    return () => {
      if (recaptchaVerifier.current) {
        try { recaptchaVerifier.current.clear(); } catch {}
      }
    };
  }, []);

  const initRecaptcha = () => {
    if (!recaptchaVerifier.current && recaptchaRef.current) {
      recaptchaVerifier.current = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: "invisible",
        callback: () => {},
      });
    }
    return recaptchaVerifier.current;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!mobile || !password) { setError("Please enter mobile and password"); return; }
    if (!/^[6-9]\d{9}$/.test(mobile)) { setError("Enter valid 10-digit mobile number"); return; }

    setLoading(true); setError("");
    try {
      const res = await memberApi.login(mobile, password);
      const data = res.data;

      if (data.needsOtp) {
        // First login — trigger OTP
        setOtpMobile(data.mobile);
        const verifier = initRecaptcha();
        const confirmation = await signInWithPhoneNumber(auth, "+91" + data.mobile, verifier);
        setConfirmResult(confirmation);
        setOtpPhase(true);
      } else {
        login(data.token, data.member);
        onLoginSuccess();
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed. Please try again.";
      setError(msg);
      if (recaptchaVerifier.current) {
        try { recaptchaVerifier.current.clear(); } catch {}
        recaptchaVerifier.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) { setOtpError("Enter the 6-digit OTP"); return; }

    setOtpLoading(true); setOtpError("");
    try {
      const result = await confirmResult.confirm(otp);
      const uid    = result.user.uid;
      const res    = await memberApi.verifyOtp(otpMobile, uid);
      login(res.data.token, res.data.member);
      onLoginSuccess();
    } catch (err) {
      if (err.code === "auth/invalid-verification-code") {
        setOtpError("Wrong OTP. Please check and try again.");
      } else {
        setOtpError(err.response?.data?.error || "OTP verification failed.");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  if (otpPhase) return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ fontSize: "2.5rem" }}>📱</div>
          <h2 style={styles.title}>Verify Mobile</h2>
          <p style={styles.subtitle}>OTP sent to +91 {otpMobile}</p>
        </div>

        <div style={styles.otpInfo}>
          This is a <strong>one-time verification</strong>. Future logins will use only your mobile + password.
        </div>

        <form onSubmit={handleVerifyOtp} style={styles.form}>
          <div>
            <label style={styles.label}>Enter 6-digit OTP</label>
            <input
              style={{ ...styles.input, textAlign: "center", letterSpacing: "0.5em", fontSize: "1.4rem" }}
              value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
              maxLength={6} placeholder="••••••" inputMode="numeric"
            />
          </div>

          {otpError && <div style={styles.errBox}>{otpError}</div>}

          <button type="submit" disabled={otpLoading} style={{ ...styles.submitBtn, opacity: otpLoading ? 0.7 : 1 }}>
            {otpLoading ? "Verifying..." : "Verify OTP · पडताळणी करा"}
          </button>

          <button type="button" style={styles.backBtn} onClick={() => { setOtpPhase(false); setOtp(""); setOtpError(""); }}>
            ← Back to Login
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ fontSize: "2.5rem" }}>🏠</div>
          <h2 style={styles.title}>Member Login</h2>
          <p style={styles.subtitle}>सभासद लॉगिन · Ayarewadi Village Portal</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div>
            <label style={styles.label}>Mobile Number</label>
            <input
              style={styles.input}
              value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ""))}
              placeholder="10-digit mobile number" maxLength={10} inputMode="numeric"
            />
          </div>

          <div>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              onKeyDown={e => e.key === "Enter" && handleLogin(e)}
            />
          </div>

          {error && <div style={styles.errBox}>{error}</div>}

          <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Signing in..." : "Login · प्रवेश करा"}
          </button>

          <button type="button" style={styles.forgotBtn} onClick={onGoForgot}>
            Forgot Password?
          </button>
        </form>

        <div style={styles.divider}><span>or</span></div>

        <div style={styles.registerPrompt}>
          <p style={{ margin: 0, color: "#666", fontSize: "0.85rem" }}>New member? Register to join the portal.</p>
          <button style={styles.registerBtn} onClick={onGoRegister}>
            Register Now · नोंदणी करा
          </button>
        </div>
      </div>

      {/* Invisible reCAPTCHA container */}
      <div ref={recaptchaRef} />
    </div>
  );
}

const styles = {
  wrap: { display: "flex", justifyContent: "center", padding: "2rem 1rem 3rem" },
  card: { background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.1)", padding: "2rem", width: "100%", maxWidth: 420 },
  header: { textAlign: "center", marginBottom: "1.5rem" },
  title: { fontSize: "1.5rem", fontWeight: 800, color: "#1b5e20", margin: "8px 0 4px" },
  subtitle: { fontSize: "0.85rem", color: "#666", margin: 0 },
  otpInfo: { background: "#f1f8e9", border: "1px solid #c8e6c9", borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem", color: "#2e7d32", marginBottom: "1rem", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  label: { display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#444", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" },
  input: { width: "100%", padding: "12px 14px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: "1rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  errBox: { background: "#ffebee", color: "#b71c1c", border: "1px solid #ef9a9a", borderRadius: 8, padding: "10px 14px", fontSize: "0.85rem", fontWeight: 500 },
  submitBtn: { background: "linear-gradient(135deg, #2e7d32, #4caf50)", color: "#fff", border: "none", padding: "13px", borderRadius: 10, fontSize: "1rem", fontWeight: 700, cursor: "pointer" },
  forgotBtn: { background: "none", border: "none", color: "#1976d2", fontSize: "0.85rem", cursor: "pointer", textAlign: "center", textDecoration: "underline" },
  divider: { textAlign: "center", margin: "1rem 0", color: "#ccc", fontSize: "0.8rem", borderTop: "1px solid #eee", paddingTop: "1rem" },
  registerPrompt: { textAlign: "center", display: "flex", flexDirection: "column", gap: 8, alignItems: "center" },
  registerBtn: { background: "#fff", border: "2px solid #2e7d32", color: "#2e7d32", padding: "10px 24px", borderRadius: 10, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" },
  backBtn: { background: "none", border: "none", color: "#666", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline", textAlign: "center" },
};
