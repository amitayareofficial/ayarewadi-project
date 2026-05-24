import { useState } from "react";
import { Eye, EyeOff, Phone } from "lucide-react";
import { memberApi } from "@/services/memberApi";
import { useAuth } from "@/context/AuthContext";
import {
  Input, BoxReveal, Ripple, VillageOrbitDisplay, BottomGradient, Label,
} from "@/components/ui/animated-auth";

import kaju      from "@/assets/images/fruits/kaju.png";
import karvand   from "@/assets/images/fruits/karvand.png";
import jackfruit from "@/assets/images/fruits/jackfruit.png";
import jambul    from "@/assets/images/fruits/jambul.png";
import kokam     from "@/assets/images/fruits/kokam.png";
import mango     from "@/assets/images/fruits/mango.png";

// ── Translations ──────────────────────────────────────────
const T = {
  en: {
    welcomeTo:   "Welcome to",
    portalName:  "Village Portal",
    loginSub:    "Login to access your member account",
    tagline:     "Mangavli · Vaibhavwadi · Sindhudurg",
    greeting:    "Welcome 👋",
    subtitle:    "Sign in to the Ayarewadi Member Portal",
    mobileLabel: "Mobile Number",
    passLabel:   "Password",
    forgotPass:  "Forgot password?",
    loginBtn:    "Login →",
    newMember:   "New member?",
    registerBtn: "Register Now",
    note:        "Only approved members can login.",
    noteAdmin:   "Registration requires admin approval.",
    loading:     "Signing in...",
  },
  mr: {
    welcomeTo:   "आपले स्वागत आहे",
    portalName:  "ग्राम पोर्टल",
    loginSub:    "सदस्य खात्यात प्रवेश करण्यासाठी लॉगिन करा",
    tagline:     "मांगवली · वैभववाडी · सिंधुदुर्ग",
    greeting:    "स्वागत आहे 👋",
    subtitle:    "आयरेवाडी सदस्य पोर्टलमध्ये प्रवेश करा",
    mobileLabel: "मोबाईल नंबर",
    passLabel:   "पासवर्ड",
    forgotPass:  "पासवर्ड विसरलात?",
    loginBtn:    "प्रवेश करा →",
    newMember:   "नवीन सभासद?",
    registerBtn: "नोंदणी करा",
    note:        "फक्त मंजूर सभासद लॉगिन करू शकतात.",
    noteAdmin:   "नोंदणीसाठी प्रशासक मंजुरी आवश्यक आहे.",
    loading:     "लॉगिन होत आहे...",
  },
};

// ── Fruit orbiting icons ──────────────────────────────────
const FruitIcon = ({ src, alt, size = 48 }) => (
  <div className="rounded-full bg-white shadow-lg overflow-hidden flex items-center justify-center"
    style={{ width: size, height: size }}>
    <img src={src} alt={alt} style={{ width: size, height: size, objectFit: "cover" }} />
  </div>
);

const orbitIcons = [
  { component: () => <FruitIcon src={kaju}      alt="Kaju"      size={42} />, className:"border-none bg-transparent", duration:12, delay:0, radius:60,  path:true,  reverse:false },
  { component: () => <FruitIcon src={karvand}   alt="Karvand"   size={44} />, className:"border-none bg-transparent", duration:17, delay:0, radius:95,  path:true,  reverse:true  },
  { component: () => <FruitIcon src={jambul}    alt="Jambul"    size={46} />, className:"border-none bg-transparent", duration:22, delay:0, radius:130, path:true,  reverse:false },
  { component: () => <FruitIcon src={kokam}     alt="Kokam"     size={48} />, className:"border-none bg-transparent", duration:27, delay:0, radius:162, path:true,  reverse:true  },
  { component: () => <FruitIcon src={mango}     alt="Mango"     size={52} />, className:"border-none bg-transparent", duration:32, delay:0, radius:192, path:true,  reverse:false },
  { component: () => <FruitIcon src={jackfruit} alt="Jackfruit" size={55} />, className:"border-none bg-transparent", duration:38, delay:0, radius:218, path:true,  reverse:true  },
];

// ── Mobile number prefix input ────────────────────────────
function MobileInput({ value, onChange }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-green-400 transition-all duration-300">
      <div className="flex items-center px-3 bg-green-50 border-r border-gray-200 text-green-800 font-bold text-sm whitespace-nowrap gap-1">
        <Phone size={13} /> +91
      </div>
      <input
        className="flex-1 h-11 px-3 text-sm bg-transparent outline-none text-black placeholder:text-neutral-400"
        value={value}
        onChange={e => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder="10-digit mobile number"
        maxLength={10}
        inputMode="numeric"
      />
    </div>
  );
}

// ── Main Login Component ──────────────────────────────────
export default function MemberLogin({ onGoRegister, onGoForgot, onLoginSuccess, lang = "mr" }) {
  const { login } = useAuth();
  const t = T[lang] ?? T.mr;
  const [mobile,   setMobile]   = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = async e => {
    e.preventDefault();
    if (!mobile || !password) { setError(lang === "mr" ? "मोबाईल नंबर आणि पासवर्ड टाका" : "Please enter mobile number and password"); return; }
    if (!/^[6-9]\d{9}$/.test(mobile)) { setError(lang === "mr" ? "१०-अंकी वैध मोबाईल नंबर टाका" : "Enter a valid 10-digit mobile number"); return; }

    setLoading(true); setError("");
    try {
      const res = await memberApi.login(mobile, password);
      login(res.data.token, res.data.member);
      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen w-full">

      {/* ── Left panel — hidden on mobile ─────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-700">

        {/* Ripple rings */}
        <div className="absolute inset-0">
          <Ripple mainCircleSize={160} numCircles={7} />
        </div>

        {/* Top text */}
        <div className="absolute top-28 left-0 right-0 z-10 text-center px-8">
          <p className="text-white/60 text-sm font-semibold tracking-[0.3em] uppercase mb-3">{t.welcomeTo}</p>
          <h1 className="font-black text-5xl leading-tight drop-shadow-lg">
            <span className="text-green-300">{t.portalName}</span>
          </h1>
          <p className="text-white/70 text-base mt-3 font-medium">{t.loginSub}</p>
        </div>

        {/* Orbiting fruits */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <VillageOrbitDisplay iconsArray={orbitIcons} centerText="आयरेवाडी" />
        </div>

        {/* Bottom tagline */}
        <div className="absolute bottom-8 left-0 right-0 text-center z-10">
          <p className="text-white/70 text-xs font-medium tracking-widest uppercase">{t.tagline}</p>
        </div>
      </div>

      {/* ── Right panel — login form ───────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 py-12 bg-white min-h-screen">
        <div className="w-full max-w-md">

          {/* Village logo/icon */}
          <BoxReveal boxColor="var(--skeleton)" duration={0.3} className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-400 flex items-center justify-center text-white text-xl shadow-md">
                🏠
              </div>
              <span className="font-black text-green-800 text-lg tracking-tight">{lang === "mr" ? "आयरेवाडी पोर्टल" : "Ayarewadi Portal"}</span>
            </div>
          </BoxReveal>

          {/* Header */}
          <BoxReveal boxColor="var(--skeleton)" duration={0.3} className="mb-1">
            <h2 className="font-black text-3xl text-neutral-800">
              {t.greeting}
            </h2>
          </BoxReveal>

          <BoxReveal boxColor="var(--skeleton)" duration={0.3} className="mb-8">
            <p className="text-neutral-500 text-sm">
              {t.subtitle}
            </p>
          </BoxReveal>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">

            {/* Mobile */}
            <div className="flex flex-col gap-2">
              <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
                <Label htmlFor="mobile">
                  {t.mobileLabel} <span className="text-red-500">*</span>
                </Label>
              </BoxReveal>
              <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3}>
                <MobileInput value={mobile} onChange={setMobile} />
              </BoxReveal>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
                <Label htmlFor="password">
                  {t.passLabel} <span className="text-red-500">*</span>
                </Label>
              </BoxReveal>
              <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3}>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder={lang === "mr" ? "तुमचा पासवर्ड" : "Your password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600 z-10"
                  >
                    {showPass ? <Eye size={17} /> : <EyeOff size={17} />}
                  </button>
                </div>
              </BoxReveal>
            </div>

            {/* Error */}
            {error && (
              <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.2}>
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm font-medium">
                  ⚠️ {error}
                </div>
              </BoxReveal>
            )}

            {/* Forgot password */}
            <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
              <button
                type="button"
                onClick={onGoForgot}
                className="text-sm text-green-600 hover:text-green-800 hover:underline outline-none text-left"
              >
                {t.forgotPass}
              </button>
            </BoxReveal>

            {/* Submit */}
            <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3} overflow="visible">
              <button
                type="submit"
                disabled={loading}
                className="relative group/btn w-full h-11 rounded-md font-bold text-white text-sm outline-none hover:cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #1b5e20 0%, #4caf50 100%)" }}
              >
                {loading ? t.loading : t.loginBtn}
                <BottomGradient />
              </button>
            </BoxReveal>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <hr className="flex-1 border-dashed border-neutral-200" />
            <span className="text-neutral-400 text-xs">{t.newMember}</span>
            <hr className="flex-1 border-dashed border-neutral-200" />
          </div>

          {/* Register button */}
          <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3} overflow="visible">
            <button
              onClick={onGoRegister}
              className="relative group/btn w-full h-11 rounded-md border-2 border-green-600 font-bold text-green-700 text-sm bg-white hover:bg-green-50 outline-none hover:cursor-pointer transition-colors duration-200"
            >
              {t.registerBtn}
              <BottomGradient />
            </button>
          </BoxReveal>

          <BoxReveal boxColor="var(--skeleton)" duration={0.3} className="mt-5">
            <p className="text-center text-xs text-neutral-400 leading-relaxed">
              {t.note}<br />{t.noteAdmin}
            </p>
          </BoxReveal>
        </div>
      </div>
    </section>
  );
}
