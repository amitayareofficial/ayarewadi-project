import { useState, useRef } from "react";
import { Eye, EyeOff, Phone, Camera } from "lucide-react";
import { memberApi } from "@/services/memberApi";
import {
  Input, BoxReveal, Ripple, BottomGradient, Label,
} from "@/components/ui/animated-auth";

const T = {
  en: {
    leftWelcome: "Join Us",
    leftTitle:   "Create Your Account",
    leftSub:     "Register for the village member portal",
    tagline:     "Mangavli · Vaibhavwadi · Sindhudurg",
    heading:     "Member Registration",
    sub:         "नोंदणी करा · Ayarewadi Village Portal",
    photoLabel:  "Profile Photo",
    photoHint:   "Upload Photo (Required)",
    changePhoto: "Change Photo",
    firstName:   "First Name",   middleName:  "Middle Name",
    lastName:    "Last Name",    nickname:    "Nickname (Optional)",
    dob:         "Date of Birth", mobile:     "Mobile Number",
    email:       "Email (Optional)", address: "Address (Optional)",
    password:    "Password",     confirm:     "Confirm Password",
    submitBtn:   "Create Account →",
    submitting:  "Creating account...",
    haveAccount: "Already have an account?",
    loginLink:   "Login here",
    successTitle: "Registration Submitted!",
    successSub:   "Your account is pending admin approval.",
    step1: "Account created successfully",
    step2: "Admin will review your request",
    step3: "Login with mobile + password once approved",
    goLogin: "Go to Login →",
  },
  mr: {
    leftWelcome: "आमच्यात सामील व्हा",
    leftTitle:   "खाते तयार करा",
    leftSub:     "ग्राम सभासद पोर्टलसाठी नोंदणी करा",
    tagline:     "मांगवली · वैभववाडी · सिंधुदुर्ग",
    heading:     "सभासद नोंदणी",
    sub:         "Member Registration · Ayarewadi Village Portal",
    photoLabel:  "प्रोफाइल फोटो",
    photoHint:   "फोटो अपलोड करा (आवश्यक)",
    changePhoto: "फोटो बदला",
    firstName:   "पहिले नाव",    middleName:  "वडिलांचे / मधले नाव",
    lastName:    "आडनाव",        nickname:    "टोपणनाव (पर्यायी)",
    dob:         "जन्मतारीख",    mobile:      "मोबाईल नंबर",
    email:       "ईमेल (पर्यायी)", address:  "पत्ता (पर्यायी)",
    password:    "पासवर्ड",       confirm:    "पासवर्ड पुन्हा टाका",
    submitBtn:   "नोंदणी करा →",
    submitting:  "खाते तयार होत आहे...",
    haveAccount: "आधीच खाते आहे?",
    loginLink:   "इथे लॉगिन करा",
    successTitle: "नोंदणी सादर केली!",
    successSub:   "तुमचे खाते प्रशासक मंजुरीसाठी प्रलंबित आहे.",
    step1: "खाते यशस्वीरित्या तयार झाले",
    step2: "प्रशासक तुमची विनंती तपासेल",
    step3: "मंजुरीनंतर मोबाईल + पासवर्डने लॉगिन करा",
    goLogin: "लॉगिन पृष्ठावर जा →",
  },
};

const STRENGTH = [
  { label: "Very Weak", mr: "अतिशय कमकुवत", color: "#ef4444" },
  { label: "Weak",      mr: "कमकुवत",        color: "#f97316" },
  { label: "Fair",      mr: "ठीक",           color: "#eab308" },
  { label: "Good",      mr: "चांगला",         color: "#22c55e" },
  { label: "Strong",    mr: "मजबूत",          color: "#15803d" },
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

function MobileInput({ value, onChange, placeholder }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-green-400 transition-all duration-300">
      <div className="flex items-center px-3 bg-green-50 border-r border-gray-200 text-green-800 font-bold text-sm whitespace-nowrap gap-1">
        <Phone size={13} /> +91
      </div>
      <input
        className="flex-1 h-11 px-3 text-sm bg-transparent outline-none text-black placeholder:text-neutral-400"
        value={value}
        onChange={e => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder}
        maxLength={10}
        inputMode="numeric"
      />
    </div>
  );
}

function SuccessScreen({ t, onGoLogin }) {
  const steps = [
    { badge: "✓", bg: "bg-green-500",   label: t.step1 },
    { badge: "2", bg: "bg-orange-400",  label: t.step2 },
    { badge: "3", bg: "bg-neutral-300", label: t.step3 },
  ];
  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-white px-5 py-12">
      <div className="w-full max-w-md text-center">
        <div className="text-6xl mb-6">✅</div>
        <h2 className="font-black text-2xl text-green-900 mb-2">{t.successTitle}</h2>
        <p className="text-neutral-500 text-sm mb-8">{t.successSub}</p>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-8 text-left flex flex-col gap-4">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-neutral-700">
              <span className={`${s.bg} text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black flex-shrink-0`}>
                {s.badge}
              </span>
              {s.label}
            </div>
          ))}
        </div>
        <button
          onClick={onGoLogin}
          className="relative group/btn w-full h-11 rounded-md font-bold text-white text-sm outline-none hover:cursor-pointer"
          style={{ background: "linear-gradient(135deg, #1b5e20 0%, #4caf50 100%)" }}
        >
          {t.goLogin}
          <BottomGradient />
        </button>
      </div>
    </section>
  );
}

export default function Register({ onGoLogin, lang = "mr" }) {
  const t = T[lang] ?? T.mr;
  const [form, setForm] = useState({
    first_name: "", middle_name: "", last_name: "", nickname: "",
    dob: "", mobile: "", email: "", address: "", password: "", confirm: "",
  });
  const [photo, setPhoto]             = useState(null);
  const [preview, setPreview]         = useState(null);
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [done, setDone]               = useState(false);
  const fileRef = useRef();

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
    const mr = lang === "mr";
    if (!form.first_name.trim())             return mr ? "पहिले नाव आवश्यक आहे"            : "First name is required";
    if (!form.middle_name.trim())            return mr ? "मधले नाव आवश्यक आहे"             : "Middle name is required";
    if (!form.last_name.trim())              return mr ? "आडनाव आवश्यक आहे"                : "Last name is required";
    if (!form.dob)                           return mr ? "जन्मतारीख आवश्यक आहे"            : "Date of birth is required";
    if (!/^[6-9]\d{9}$/.test(form.mobile))  return mr ? "वैध १०-अंकी मोबाईल नंबर टाका"   : "Enter a valid 10-digit mobile number";
    if (!photo)                              return mr ? "प्रोफाइल फोटो आवश्यक आहे"        : "Profile photo is required";
    if (form.password.length < 6)           return mr ? "पासवर्ड किमान ६ अक्षरांचा असावा" : "Password must be at least 6 characters";
    if (form.password !== form.confirm)     return mr ? "पासवर्ड जुळत नाही"               : "Passwords do not match";
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
      setError(err.response?.data?.error || (lang === "mr" ? "नोंदणी अयशस्वी. पुन्हा प्रयत्न करा." : "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  if (done) return <SuccessScreen t={t} onGoLogin={onGoLogin} />;

  return (
    <section className="portal-page flex min-h-screen w-full">

      {/* Left panel — desktop only */}
      <div className="hidden lg:flex lg:w-2/5 relative items-center justify-center overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 flex-shrink-0">
        <div className="absolute inset-0">
          <Ripple mainCircleSize={140} numCircles={6} />
        </div>
        <div className="relative z-10 text-center px-10">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl">
            📋
          </div>
          <p className="text-white/60 text-xs font-semibold tracking-[0.3em] uppercase mb-3">{t.leftWelcome}</p>
          <h1 className="text-white font-black text-4xl leading-tight drop-shadow-lg mb-2">
            {lang === "mr" ? "आयरेवाडी" : "Ayarewadi"}
          </h1>
          <p className="text-green-300 font-bold text-xl mb-4">{t.leftTitle}</p>
          <p className="text-white/60 text-sm font-medium">{t.leftSub}</p>
        </div>
        <div className="absolute bottom-8 left-0 right-0 text-center z-10">
          <p className="text-white/50 text-xs font-medium tracking-widest uppercase">{t.tagline}</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-3/5 flex flex-col bg-white flex-1">

        <div className="lg:hidden bg-gradient-to-r from-green-900 to-emerald-700 px-5 pt-4 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg flex-shrink-0">🏠</div>
            <span className="font-black text-white text-lg leading-tight">
              {lang === "mr" ? "आयरेवाडी पोर्टल" : "Ayarewadi Portal"}
            </span>
          </div>
          <p className="text-green-200 text-xs tracking-widest uppercase font-medium mt-2">{t.tagline}</p>
        </div>

        <div className="portal-form-area flex-1 flex flex-col lg:justify-center items-center px-4 sm:px-8 lg:px-12 py-6 lg:py-10">
          <div className="w-full max-w-xl">

            <div className="hidden lg:flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-400 flex items-center justify-center text-white text-xl shadow-md">
                🏠
              </div>
              <span className="font-black text-green-800 text-lg tracking-tight">
                {lang === "mr" ? "आयरेवाडी पोर्टल" : "Ayarewadi Portal"}
              </span>
            </div>

            <BoxReveal boxColor="var(--skeleton)" duration={0.3} className="mb-1">
              <h2 className="font-black text-2xl sm:text-3xl text-neutral-800">{t.heading}</h2>
            </BoxReveal>
            <BoxReveal boxColor="var(--skeleton)" duration={0.3} className="mb-6">
              <p className="text-neutral-500 text-sm">{t.sub}</p>
            </BoxReveal>

            {/* Photo upload */}
            <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3} className="mb-6">
              <div className="flex flex-row items-center gap-4 p-3 sm:p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50">
                <div
                  onClick={() => fileRef.current.click()}
                  className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed flex-shrink-0 transition-all duration-200 ${
                    preview ? "border-green-500" : "border-gray-300 bg-white hover:border-green-400"
                  }`}
                >
                  {preview
                    ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    : <Camera size={22} className="text-gray-400" />
                  }
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>{t.photoLabel} <span className="text-red-500">*</span></Label>
                  <button
                    type="button"
                    onClick={() => fileRef.current.click()}
                    className="text-xs sm:text-sm text-green-700 border border-green-500 rounded-full px-3 py-1 font-semibold hover:bg-green-50 transition-colors duration-200 w-fit"
                  >
                    {preview ? t.changePhoto : t.photoHint}
                  </button>
                  {!photo && <span className="text-xs text-red-500 font-medium">{lang === "mr" ? "आवश्यक" : "Required"}</span>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </div>
            </BoxReveal>

            <form onSubmit={submit} className="flex flex-col gap-4">

              {/* First / Middle / Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: "first_name",  label: t.firstName,  req: true,  ph: lang==="mr"?"अमित":"Amit" },
                  { key: "middle_name", label: t.middleName, req: true,  ph: lang==="mr"?"बाळू":"Balu" },
                  { key: "last_name",   label: t.lastName,   req: true,  ph: lang==="mr"?"आयरे":"Ayare" },
                ].map(({ key, label, req, ph }) => (
                  <div key={key} className="flex flex-col gap-2">
                    <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
                      <Label>{label} {req && <span className="text-red-500">*</span>}</Label>
                    </BoxReveal>
                    <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3}>
                      <Input type="text" placeholder={ph} value={form[key]} onChange={set(key)} />
                    </BoxReveal>
                  </div>
                ))}
              </div>

              {/* Nickname */}
              <div className="flex flex-col gap-2">
                <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
                  <Label>{t.nickname}</Label>
                </BoxReveal>
                <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3}>
                  <Input
                    type="text"
                    placeholder={lang === "mr" ? "उदा. अमित्या, बाळ्या..." : "e.g. Amitya, Balya..."}
                    value={form.nickname}
                    onChange={set("nickname")}
                  />
                </BoxReveal>
              </div>

              {/* DOB + Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
                    <Label>{t.dob} <span className="text-red-500">*</span></Label>
                  </BoxReveal>
                  <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3}>
                    <Input type="date" value={form.dob} onChange={set("dob")} />
                  </BoxReveal>
                </div>
                <div className="flex flex-col gap-2">
                  <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
                    <Label>{t.mobile} <span className="text-red-500">*</span></Label>
                  </BoxReveal>
                  <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3}>
                    <MobileInput
                      value={form.mobile}
                      onChange={v => setForm(f => ({ ...f, mobile: v }))}
                      placeholder={lang === "mr" ? "१०-अंकी नंबर" : "10-digit number"}
                    />
                  </BoxReveal>
                </div>
              </div>

              {/* Email + Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
                    <Label>{t.email}</Label>
                  </BoxReveal>
                  <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3}>
                    <Input type="email" placeholder="email@example.com" value={form.email} onChange={set("email")} />
                  </BoxReveal>
                </div>
                <div className="flex flex-col gap-2">
                  <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
                    <Label>{t.address}</Label>
                  </BoxReveal>
                  <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3}>
                    <Input
                      type="text"
                      placeholder={lang === "mr" ? "गाव / शहर, जिल्हा" : "Village / Town, District"}
                      value={form.address}
                      onChange={set("address")}
                    />
                  </BoxReveal>
                </div>
              </div>

              {/* Password + Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
                    <Label>{t.password} <span className="text-red-500">*</span></Label>
                  </BoxReveal>
                  <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3}>
                    <div className="relative">
                      <Input
                        type={showPass ? "text" : "password"}
                        placeholder={lang === "mr" ? "किमान ६ अक्षरे" : "Min. 6 characters"}
                        value={form.password}
                        onChange={set("password")}
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
                  {form.password && (
                    <div className="flex items-center gap-1.5 mt-1">
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength ? STRENGTH[strength].color : "#e5e7eb" }} />
                      ))}
                      <span className="text-xs font-bold ml-1 whitespace-nowrap" style={{ color: STRENGTH[strength].color }}>
                        {lang === "mr" ? STRENGTH[strength].mr : STRENGTH[strength].label}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
                    <Label>{t.confirm} <span className="text-red-500">*</span></Label>
                  </BoxReveal>
                  <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3}>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder={lang === "mr" ? "पासवर्ड पुन्हा टाका" : "Repeat password"}
                        value={form.confirm}
                        onChange={set("confirm")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600 z-10"
                      >
                        {showConfirm ? <Eye size={17} /> : <EyeOff size={17} />}
                      </button>
                    </div>
                  </BoxReveal>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm font-medium flex items-center gap-2">
                  ⚠️ {error}
                </div>
              )}

              <BoxReveal width="100%" boxColor="var(--skeleton)" duration={0.3} overflow="visible">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative group/btn w-full h-11 rounded-md font-bold text-white text-sm outline-none hover:cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #1b5e20 0%, #4caf50 100%)" }}
                >
                  {loading ? t.submitting : t.submitBtn}
                  <BottomGradient />
                </button>
              </BoxReveal>

              <BoxReveal boxColor="var(--skeleton)" duration={0.3}>
                <p className="text-center text-sm text-neutral-400">
                  {t.haveAccount}{" "}
                  <button type="button" onClick={onGoLogin} className="text-green-600 font-bold hover:underline outline-none">
                    {t.loginLink}
                  </button>
                </p>
              </BoxReveal>

            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
