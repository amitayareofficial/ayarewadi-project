import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import Admin from "./pages/Admin.jsx";
import heroImg from "./assets/images/main_image_home.png";

// ── BACKEND API URL — change this if your Render URL changes ──────────
const API = "https://ayarewadi-project.onrender.com";

// ── ALL IMAGES FROM ayarewadi.in — replace src URLs to use your own photos ──
const IMG = {
  // HERO: Full-screen background on home page — replace with your best village photo
  hero: heroImg,

  // TEMPLE: Side image in About section — your Ravalnath temple photo
  temple: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=964,fit=crop/YNq2a76xB3Ip7LZZ/img_20231008_171703-YBgbklJZkwuXBwnj.jpg",

  // INITIATIVES: 3 cards below hero — replace with your village work photos
  templeReno: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=721,fit=crop,trim=165.20076481835565;0;479.08221797323137;0/YNq2a76xB3Ip7LZZ/img_20231008_171637-AMq8ka5gQ9T49MZn.jpg",
  busStand:   "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=721,fit=crop,trim=296.7117988394584;74.3175965665236;373.15280464216636;0/YNq2a76xB3Ip7LZZ/whatsapp-image-2025-06-07-at-7.06.56-pm-mePJZ51Bekfgav0a.jpeg",
  sports:     "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=721,fit=crop,trim=0;83.42158859470469;0;329.5152749490835/YNq2a76xB3Ip7LZZ/whatsapp-image-2025-08-10-at-1.24.58-am-mjEGa20ZkvuNlzg6.jpeg",

  // FESTIVALS: 3 festival photos in festival section
  festival1:  "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=721,fit=crop,trim=0;209.69450101832996;0;0/YNq2a76xB3Ip7LZZ/whatsapp-image-2025-08-10-at-12.06.58-am-AzGNwDaNRWIk2lae.jpeg",
  festival2:  "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=721,fit=crop,trim=0;384.54211956521743;0;362.81657608695656/YNq2a76xB3Ip7LZZ/whatsapp-image-2025-08-10-at-12.07.00-am-1-mP4MkNVWqrTxwBb0.jpeg",
  festival3:  "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=721,fit=crop,trim=0;117.31160896130346;0;463.3808553971487/YNq2a76xB3Ip7LZZ/img_20230923_151456-dOqDklw1xKup1yxM.jpg",

  // NATURE PICS: Small grid in temple section
  nature1:    "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=310,fit=crop,trim=0;59.96330275229358;0;34.715596330275226/YNq2a76xB3Ip7LZZ/whatsapp-image-2025-08-10-at-1.24.59-am-ALpPkJDvqQFz7l0N.jpeg",
  nature2:    "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=310,fit=crop,trim=425.32323232323233;0;514.1565656565656;0/YNq2a76xB3Ip7LZZ/whatsapp-image-2025-08-10-at-12.06.52-am-mv0J6lZwOyiRQzkn.jpeg",
  nature3:    "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=337,fit=crop,trim=0;128;0;132.92307692307693/YNq2a76xB3Ip7LZZ/whatsapp-image-2025-08-10-at-12.30.51-am-1-A0xjJrWaDDt2zOMB.jpeg",

  // HOSPITALS: Photos on emergency page
  ruralHosp:  "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=723,fit=crop/YNq2a76xB3Ip7LZZ/rural-hospital-vaibhavwadi-mk3JOK95lPFqKXZx.webp",
  aaaanadi:   "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=723,fit=crop/YNq2a76xB3Ip7LZZ/anadi-hospital-A85VKX1j4xFDB4Zy.png",
  marathe:    "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=723,fit=crop,trim=0;81.04735062006765;0;158.608793686584/YNq2a76xB3Ip7LZZ/marathe-clinic-hospital-YanJ8K4l8pCllDbZ.png",
  ambulance:  "https://images.unsplash.com/photo-1599700403969-f77b3aa74837?auto=format&fit=crop&w=612&h=576",

  // LOGO: Shows in navbar and footer — your Ayarewadi logo
  logo: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=44,fit=crop/YNq2a76xB3Ip7LZZ/logo-AMq8kxQE5PsQv1g4.png",
};

export default function App() {
  const [section, setSection]   = useState("home");
  const [events, setEvents]     = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch events from your backend on load
  useEffect(() => {
    axios.get(`${API}/events`).then(r => setEvents(r.data)).catch(() => {});
  }, []);

  const nav = s => {
    setSection(s);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app">
      <Navbar section={section} nav={nav} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        {section === "home"      && <Home nav={nav} events={events} />}
        {section === "emergency" && <Emergency />}
        {section === "portal"    && <Portal />}
        {section === "gallery"   && <Gallery />}
        {section === "events"    && <Events events={events} />}
        {section === "admin"     && <Admin />}
      </main>
      <Footer nav={nav} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAVBAR
   - Logo auto-inverts to white
   - Transparent on hero, solid on scroll
═══════════════════════════════════════════════════════════ */
function Navbar({ section, nav, menuOpen, setMenuOpen }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { id: "home",      label: "Home" },
    { id: "emergency", label: "Emergency" },
    { id: "portal",    label: "Portal" },
    { id: "gallery",   label: "Gallery" },
    { id: "events",    label: "Events" },
    { id: "admin",     label: "⚙️ Admin" },
  ];

  return (
    <nav className={`navbar ${scrolled || section !== "home" ? "scrolled" : ""}`}>
      {/* LOGO — replace IMG.logo to change navbar logo */}
      <div className="nav-brand" onClick={() => nav("home")}>
        <img src={IMG.logo} alt="Ayarewadi" className="nav-logo" />
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? "✕" : "☰"}
      </button>

      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        {links.map(l => (
          <li key={l.id}>
            <button
              className={[
                section === l.id ? "active" : "",
                l.id === "admin" ? "nav-cta" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => nav(l.id)}
            >
              {l.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOME PAGE — modular sub-components
═══════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="hero">
      <img src={IMG.hero} alt="Ayarewadi Village" className="hero-bg" />
      <div className="hero-overlay" />
      <div className="hero-content hero-content-top">
        <span className="hero-eyebrow">सिंधुदुर्ग · वैभववाडी · कोकण · महाराष्ट्र</span>
        <p className="hero-tagline">"एक गाव, एक ओळख, एक नातं – आयरेवाडी!"</p>
      </div>
    </section>
  );
}

function SloganMarquee() {
  const slogans = [
    "आपलं गाव, आपली जबाबदारी",
    "सुंदर विचार, सुंदर गाव",
    "सर्वांनी मिळून सुंदर गाव घडवूया",
    "एकतेतून गावाचा विकास",
    "शिक्षित गाव, विकसित गाव",
    "पाणी अडवा, पाणी जिरवा",
    "एकजुटीतून घडेल सुंदर गाव",
  ];
  const items = [...slogans, ...slogans];
  return (
    <div className="marquee-wrap slogan-marquee">
      <span className="marquee-label">सुविचार</span>
      <div className="marquee-track">
        <div className="marquee-inner">
          {items.map((s, i) => (
            <span key={i} className="marquee-item">
              {s}&nbsp;<span className="marquee-sep">✦</span>&nbsp;
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmergencySVG() {
  return (
    <svg viewBox="0 0 360 230" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="295" cy="48" r="70" fill="#FFCCC5" opacity="0.45"/>
      <circle cx="52" cy="195" r="55" fill="#FFCCC5" opacity="0.35"/>
      <rect x="118" y="50" width="142" height="155" rx="10" fill="#FFB8AD"/>
      <rect x="118" y="50" width="142" height="28" rx="10" fill="#FF8F82"/>
      <rect x="118" y="65" width="142" height="13" fill="#FF8F82"/>
      <rect x="136" y="94" width="22" height="22" rx="4" fill="rgba(255,245,244,0.85)"/>
      <rect x="168" y="94" width="22" height="22" rx="4" fill="rgba(255,245,244,0.85)"/>
      <rect x="200" y="94" width="22" height="22" rx="4" fill="rgba(255,245,244,0.85)"/>
      <rect x="136" y="127" width="22" height="22" rx="4" fill="rgba(255,245,244,0.85)"/>
      <rect x="200" y="127" width="22" height="22" rx="4" fill="rgba(255,245,244,0.85)"/>
      <rect x="160" y="159" width="36" height="46" rx="6" fill="#FF8F82"/>
      <rect x="167" y="55" width="24" height="7" rx="3" fill="#D94030"/>
      <rect x="173" y="49" width="7" height="24" rx="3" fill="#D94030"/>
      <circle cx="75" cy="150" r="13" fill="#FFD5CE"/>
      <rect x="62" y="163" width="26" height="30" rx="10" fill="#E05040"/>
      <rect x="50" y="166" width="12" height="7" rx="3" fill="#FFD5CE"/>
      <rect x="88" y="166" width="12" height="7" rx="3" fill="#FFD5CE"/>
      <rect x="222" y="170" width="90" height="38" rx="8" fill="#FF9B8F"/>
      <rect x="230" y="158" width="56" height="24" rx="6" fill="#FFB8AD"/>
      <circle cx="238" cy="212" r="8" fill="#C03020"/>
      <circle cx="296" cy="212" r="8" fill="#C03020"/>
      <rect x="244" y="172" width="18" height="6" rx="3" fill="white"/>
      <rect x="250" y="166" width="6" height="18" rx="3" fill="white"/>
      <rect x="28" y="68" width="14" height="5" rx="2" fill="#FFB8AD"/>
      <rect x="33" y="63" width="5" height="14" rx="2" fill="#FFB8AD"/>
      <rect x="306" y="102" width="10" height="4" rx="2" fill="#FFB8AD"/>
      <rect x="309" y="98" width="4" height="10" rx="2" fill="#FFB8AD"/>
      <circle cx="44" cy="102" r="5" fill="#FFCCC5"/>
      <circle cx="322" cy="60" r="4" fill="#FFB8AD"/>
    </svg>
  );
}

function EventsSVG() {
  return (
    <svg viewBox="0 0 260 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="212" cy="42" r="55" fill="#D4CCFF" opacity="0.45"/>
      <circle cx="40" cy="212" r="45" fill="#D4CCFF" opacity="0.35"/>
      <rect x="58" y="62" width="152" height="142" rx="14" fill="#C4B5FD"/>
      <rect x="58" y="62" width="152" height="38" rx="14" fill="#8B75E8"/>
      <rect x="58" y="85" width="152" height="15" fill="#8B75E8"/>
      <rect x="98" y="50" width="10" height="22" rx="5" fill="#6B5BD4"/>
      <rect x="160" y="50" width="10" height="22" rx="5" fill="#6B5BD4"/>
      <rect x="92" y="70" width="84" height="7" rx="3" fill="rgba(255,255,255,0.85)"/>
      <rect x="70" y="113" width="18" height="14" rx="4" fill="rgba(255,255,255,0.7)"/>
      <rect x="94" y="113" width="18" height="14" rx="4" fill="rgba(255,255,255,0.7)"/>
      <rect x="118" y="113" width="18" height="14" rx="4" fill="#6B5BD4"/>
      <rect x="142" y="113" width="18" height="14" rx="4" fill="rgba(255,255,255,0.7)"/>
      <rect x="166" y="113" width="18" height="14" rx="4" fill="rgba(255,255,255,0.7)"/>
      <rect x="70" y="135" width="18" height="14" rx="4" fill="rgba(255,255,255,0.7)"/>
      <rect x="94" y="135" width="18" height="14" rx="4" fill="rgba(255,255,255,0.7)"/>
      <rect x="118" y="135" width="18" height="14" rx="4" fill="rgba(255,255,255,0.7)"/>
      <rect x="142" y="135" width="18" height="14" rx="4" fill="#8B75E8"/>
      <rect x="166" y="135" width="18" height="14" rx="4" fill="rgba(255,255,255,0.7)"/>
      <rect x="70" y="157" width="18" height="14" rx="4" fill="rgba(255,255,255,0.7)"/>
      <rect x="94" y="157" width="18" height="14" rx="4" fill="rgba(255,255,255,0.7)"/>
      <circle cx="212" cy="152" r="18" fill="#D4CCFF"/>
      <rect x="200" y="170" width="24" height="35" rx="10" fill="#8B75E8"/>
      <rect x="22" y="88" width="8" height="8" rx="2" fill="#C4B5FD" transform="rotate(15,22,88)"/>
      <rect x="237" y="84" width="7" height="7" rx="2" fill="#8B75E8" transform="rotate(-20,237,84)"/>
      <circle cx="34" cy="130" r="5" fill="#D4CCFF"/>
      <circle cx="240" cy="132" r="4" fill="#C4B5FD"/>
      <rect x="216" y="58" width="6" height="6" rx="1" fill="#C4B5FD" transform="rotate(30,216,58)"/>
      <circle cx="48" cy="64" r="4" fill="#D4CCFF"/>
      <rect x="44" y="162" width="8" height="8" rx="2" fill="#C4B5FD" transform="rotate(-10,44,162)"/>
    </svg>
  );
}

function GallerySVG() {
  return (
    <svg viewBox="0 0 360 195" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="292" cy="42" r="62" fill="#B8F0D8" opacity="0.5"/>
      <circle cx="58" cy="172" r="52" fill="#B8F0D8" opacity="0.4"/>
      <rect x="28" y="50" width="68" height="52" rx="8" fill="#A8E8C8"/>
      <rect x="34" y="56" width="56" height="36" rx="5" fill="#7FCEAC"/>
      <rect x="34" y="85" width="56" height="12" rx="3" fill="#A8E8C8"/>
      <polygon points="38,83 55,60 72,83" fill="#5FBFA0"/>
      <polygon points="56,83 68,67 82,83" fill="#3D9E80"/>
      <circle cx="47" cy="67" r="5" fill="#FFD96A" opacity="0.85"/>
      <rect x="272" y="60" width="62" height="48" rx="8" fill="#A8E8C8"/>
      <rect x="278" y="66" width="50" height="32" rx="5" fill="#7FCEAC"/>
      <rect x="278" y="91" width="50" height="12" rx="3" fill="#A8E8C8"/>
      <polygon points="282,90 295,72 308,90" fill="#5FBFA0"/>
      <polygon points="302,90 314,76 326,90" fill="#3D9E80"/>
      <rect x="120" y="58" width="132" height="98" rx="16" fill="#5FBFA0"/>
      <rect x="125" y="53" width="52" height="18" rx="8" fill="#3D9E80"/>
      <circle cx="186" cy="108" r="34" fill="#3D9E80"/>
      <circle cx="186" cy="108" r="25" fill="#2A7D62"/>
      <circle cx="186" cy="108" r="16" fill="#1D6550"/>
      <circle cx="186" cy="108" r="8" fill="#124D3C"/>
      <circle cx="178" cy="100" r="4" fill="rgba(255,255,255,0.35)"/>
      <rect x="222" y="64" width="22" height="14" rx="5" fill="#A8E8C8"/>
      <circle cx="148" cy="64" r="6" fill="#7FCEAC"/>
      <circle cx="68" cy="138" r="14" fill="#B8F0D8"/>
      <rect x="56" y="153" width="24" height="30" rx="10" fill="#3D9E80"/>
      <rect x="72" y="145" width="28" height="20" rx="5" fill="#5FBFA0"/>
      <circle cx="312" cy="152" r="5" fill="#B8F0D8"/>
      <circle cx="332" cy="132" r="3" fill="#A8E8C8"/>
      <circle cx="24" cy="120" r="4" fill="#B8F0D8"/>
    </svg>
  );
}

function PortalSVG() {
  return (
    <svg viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="212" cy="42" r="55" fill="#FFE8A0" opacity="0.5"/>
      <circle cx="44" cy="178" r="46" fill="#FFE8A0" opacity="0.4"/>
      <rect x="52" y="38" width="162" height="112" rx="12" fill="#F5C842"/>
      <rect x="60" y="46" width="146" height="92" rx="8" fill="#FFF8E0"/>
      <rect x="116" y="150" width="34" height="18" rx="4" fill="#E8A030"/>
      <rect x="98" y="166" width="70" height="8" rx="4" fill="#E8A030"/>
      <rect x="73" y="55" width="58" height="8" rx="4" fill="#F5D080"/>
      <rect x="136" y="55" width="38" height="8" rx="4" fill="#FFECA0"/>
      <polyline points="73,84 95,70 117,76 139,62 161,67 183,57" stroke="#E8A030" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="73" cy="84" r="3" fill="#C27820"/>
      <circle cx="117" cy="76" r="3" fill="#C27820"/>
      <circle cx="161" cy="67" r="3" fill="#C27820"/>
      <line x1="70" y1="130" x2="186" y2="130" stroke="#F5D080" strokeWidth="2"/>
      <rect x="73" y="110" width="16" height="20" rx="3" fill="#F5C842"/>
      <rect x="95" y="98" width="16" height="32" rx="3" fill="#E8A030"/>
      <rect x="117" y="86" width="16" height="44" rx="3" fill="#F5C842"/>
      <rect x="139" y="102" width="16" height="28" rx="3" fill="#C27820"/>
      <rect x="161" y="94" width="16" height="36" rx="3" fill="#E8A030"/>
      <circle cx="220" cy="136" r="16" fill="#FFE8A0"/>
      <rect x="208" y="152" width="24" height="28" rx="10" fill="#E8A030"/>
      <rect x="48" y="174" width="224" height="8" rx="4" fill="#F5C842"/>
      <rect x="22" y="72" width="22" height="8" rx="4" fill="#FFE8A0"/>
      <rect x="22" y="86" width="16" height="8" rx="4" fill="#F5D080"/>
      <rect x="22" y="100" width="19" height="8" rx="4" fill="#FFE8A0"/>
      <circle cx="242" cy="86" r="4" fill="#FFE8A0"/>
      <circle cx="232" cy="102" r="3" fill="#F5D080"/>
    </svg>
  );
}

function ServiceTiles({ nav }) {
  const tiles = [
    { label: "Emergency", sub: "Hospitals & emergency contacts", s: "emergency", tag: "Help & Safety",  icon: "🚨", bg: "linear-gradient(145deg,#FFF5F4 0%,#FFE4DF 100%)", accent: "#D94030", svg: <EmergencySVG /> },
    { label: "Events",    sub: "Upcoming village programs",      s: "events",    tag: "Stay Updated",   icon: "🎉", bg: "linear-gradient(145deg,#F6F4FF 0%,#EBE5FF 100%)", accent: "#6B5BD4", svg: <EventsSVG />    },
    { label: "Gallery",   sub: "Village photo memories",         s: "gallery",   tag: "Photos",         icon: "📸", bg: "linear-gradient(145deg,#F0FFF8 0%,#DDFAF0 100%)", accent: "#2A8F72", svg: <GallerySVG />   },
    { label: "Portal",    sub: "Family tree & village budget",   s: "portal",    tag: "Members Only",   icon: "👤", bg: "linear-gradient(145deg,#FFFBF0 0%,#FFF3D0 100%)", accent: "#C27820", svg: <PortalSVG />    },
  ];
  return (
    <section className="svc-section">
      <div className="svc-inner">
        <div className="svc-header">
          <span className="eyebrow svc-eyebrow">Explore</span>
          <h2 className="svc-title">Village Services</h2>
          <p className="svc-subtitle">Everything you need from Ayarewadi — always at your fingertips.</p>
        </div>
        <div className="svc-bento">
          {tiles.map((t, i) => (
            <div className={`svc-card svc-card-${i}`} key={t.s} onClick={() => nav(t.s)}
              style={{ background: t.bg, "--svc-accent": t.accent }}>
              <div className="svc-illustration">{t.svg}</div>
              <div className="svc-content">
                <span className="svc-tag">{t.tag}</span>
                <div className="svc-glass-panel">
                  <span className="svc-icon">{t.icon}</span>
                  <div className="svc-text">
                    <h3>{t.label}</h3>
                    <p>{t.sub}</p>
                  </div>
                  <div className="svc-arrow">→</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VillageStory({ nav }) {
  return (
    <section className="about-strip">
      <div className="about-img-wrap">
        <img src={IMG.temple} alt="Shri Dev Ravalnath Mandir" />
        <div className="about-img-label">🛕 श्री देव रवळनाथ मंदिर</div>
      </div>
      <div className="about-text">
        <span className="eyebrow">आमचं गाव</span>
        <h2>🌿 कोकणातलं सुंदर गाव – आयरेवाडी</h2>
        <p className="about-location">मांगवली · वैभववाडी · सिंधुदुर्ग · महाराष्ट्र</p>
        <p>कोकण प्रदेशातील <strong>सिंधुदुर्ग जिल्ह्यात</strong> वसलेले आयरेवाडी हे एक सांस्कृतिक व निसर्गरम्य गाव आहे. येथे मराठी व कोकणी भाषा बोलल्या जातात व गावाची लोकसंख्या अंदाजे <strong>1,264</strong> इतकी आहे. 2011 च्या जनगणनेनुसार साक्षरता दर 69% असून, स्त्री-पुरूष गुणोत्तर 1,175 आहे.</p>
        <p>गाव आसपासील गावे — <strong>उपले, कोळपे, नेटल, एचेट</strong> — जवळ आहेत.</p>
        <div className="about-stats-row">
          <div className="about-stat"><strong>1,264</strong><span>लोकसंख्या</span></div>
          <div className="about-stat"><strong>69%</strong><span>Literacy</span></div>
          <div className="about-stat"><strong>1,175</strong><span>Sex Ratio</span></div>
        </div>
        <p className="about-note">🚉 वैभववाडी रोड रेल्वे स्टेशन जवळ &nbsp;·&nbsp; 🛣️ NH‑166E / NH‑748 मार्गे सहज पोहोचता येते.</p>
        <button className="btn-accent-sm" onClick={() => nav("gallery")}>Photos →</button>
      </div>
    </section>
  );
}

function Initiatives() {
  return (
    <section className="initiatives-section">
      <div className="sec-header">
        <span className="eyebrow">Village Work</span>
        <h2>Initiatives by Members</h2>
      </div>
      <div className="init-grid">
        {[
          { img: IMG.templeReno, title: "Temple Renovation",    sub: "Restoration of Ravalnath temple" },
          { img: IMG.busStand,   title: "Bus Stand Sign Board", sub: "New sign board for village bus stand" },
          { img: IMG.sports,     title: "Organizing Sports",    sub: "Cricket & sports events for village youth" },
        ].map(e => (
          <div className="init-card" key={e.title}>
            <div className="init-img-wrap">
              <img src={e.img} alt={e.title} />
            </div>
            <div className="init-body">
              <h3>{e.title}</h3>
              <p>{e.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Festivals() {
  return (
    <section className="page-section">
      <div className="sec-header">
        <span className="eyebrow">उत्सव</span>
        <h2>🔱 Festivals in Ayarewadi</h2>
      </div>
      <div className="festival-grid">
        {[IMG.festival1, IMG.festival2, IMG.festival3].map((src, i) => (
          <div className="festival-img" key={i}>
            <img src={src} alt={`Festival ${i + 1}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

function EventsPreview({ events, nav }) {
  return (
    <section className="page-section" style={{ paddingTop: 0 }}>
      <div className="sec-header">
        <span className="eyebrow">What's On</span>
        <h2>Upcoming Events</h2>
      </div>
      <div className="events-list">
        {events.slice(0, 3).map(ev => (
          <div className="event-card" key={ev.id}>
            <div className="event-date">📅 {new Date(ev.date).toDateString()}</div>
            <h3>{ev.title}</h3>
            <p>{ev.description}</p>
          </div>
        ))}
      </div>
      <button className="btn-accent-sm" style={{ marginTop: "16px" }} onClick={() => nav("events")}>
        All Events →
      </button>
    </section>
  );
}

function TeamSection() {
  const team = [
    {
      name: "Bhalchandra Ayare",
      roleMr: "अध्यक्ष",
      roleEn: "President",
      initials: "BA",
      gradient: "linear-gradient(135deg, #0d5c30 0%, #1aad5c 100%)",
      quote: "आयरेवाडी गावाचा विकास हे आमचे ध्येय. प्रत्येक निर्णय गावाच्या भविष्यासाठी घेतो.",
    },
    {
      name: "Anant Ayare",
      roleMr: "सचिव",
      roleEn: "Secretary",
      initials: "AA",
      gradient: "linear-gradient(135deg, #0d3d5c 0%, #1a7db8 100%)",
      quote: "गावाचे सर्व उपक्रम व्यवस्थित चालावेत यासाठी सतत प्रयत्नशील असतो.",
    },
    {
      name: "Pawan Ayare",
      roleMr: "खजिनदार",
      roleEn: "Treasurer",
      initials: "PA",
      gradient: "linear-gradient(135deg, #5c200d 0%, #b84020 100%)",
      quote: "गावाचा प्रत्येक पैसा योग्य कामी लागावा यासाठी पारदर्शकतेने काम करतो.",
    },
    {
      name: "Amit Ayare",
      roleMr: "सभासद",
      roleEn: "Member",
      initials: "AA",
      gradient: "linear-gradient(135deg, #3a0d5c 0%, #7a2db8 100%)",
      quote: "गावातील युवापिढीसाठी नवीन संधी निर्माण करणे हे आमचे स्वप्न आहे.",
    },
  ];

  const allMembers = [
    ...team,
    { name: "Raju Ayare",     roleMr: "सभासद", roleEn: "Member" },
    { name: "Ganesh Ayare",   roleMr: "सभासद", roleEn: "Member" },
    { name: "Mahendra Ayare", roleMr: "सभासद", roleEn: "Member" },
    { name: "Avinash Ayare",  roleMr: "सभासद", roleEn: "Member" },
    { name: "Akshay Ayare",   roleMr: "सभासद", roleEn: "Member" },
    { name: "Sandeep Ayare",  roleMr: "सभासद", roleEn: "Member" },
    { name: "Sidhesh Ayare",  roleMr: "सभासद", roleEn: "Member" },
  ];
  const marqueeItems = [...allMembers, ...allMembers];

  return (
    <section className="team-section">
      {/* Scrolling name marquee */}
      <div className="team-marquee">
        <div className="team-marquee-inner">
          {marqueeItems.map((m, i) => (
            <span key={i} className="team-marquee-item">
              <span className="team-marquee-name">{m.name}</span>
              <span className="team-marquee-badge">{m.roleMr} · {m.roleEn}</span>
              <span className="team-marquee-sep">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Section header */}
      <div className="team-header">
        <span className="eyebrow team-eyebrow">Our Team</span>
        <h2 className="team-title">ग्राम समिती</h2>
        <p className="team-subtitle">Ayarewadi Gram Panchayat — Dedicated leaders serving our village with pride and transparency.</p>
      </div>

      {/* Glassmorphism cards */}
      <div className="team-grid">
        {team.map((m, i) => (
          <div className="team-card" key={i}>
            <div className="team-avatar" style={{ background: m.gradient }}>
              {m.initials}
            </div>
            <div className="team-name">{m.name}</div>
            <div className="team-role-mr">{m.roleMr}</div>
            <div className="team-role-en">{m.roleEn}</div>
            <div className="team-divider" />
            <p className="team-quote">"{m.quote}"</p>
            <div className="team-socials">
              <a href="https://wa.me/918149822015" target="_blank" rel="noreferrer" className="team-social-btn" title="WhatsApp">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a href="mailto:contact@ayarewadi.in" className="team-social-btn" title="Email">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </a>
              <a href="#" className="team-social-btn" title="Village Portal">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <div className="stats-strip">
      {[
        { n: "1,264", label: "लोकसंख्या" },
        { n: "69%",   label: "Literacy Rate" },
        { n: "1,175", label: "Sex Ratio" },
        { n: "2025",  label: "ayarewadi.in" },
      ].map(s => (
        <div className="stat" key={s.label}>
          <strong>{s.n}</strong>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function JoinCommunity() {
  return (
    <section className="join-section">
      <div className="join-content">
        <span className="eyebrow join-eyebrow">Community</span>
        <h2>जोडले राहा आमच्याशी</h2>
        <p>Stay connected with Ayarewadi village — get updates on festivals, events, and village news directly on WhatsApp.</p>
        <div className="join-btns">
          <a href="https://wa.me/918149822015" target="_blank" rel="noreferrer" className="btn-whatsapp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp Group
          </a>
          <a href="mailto:contact@ayarewadi.in" className="btn-email">
            contact@ayarewadi.in
          </a>
        </div>
      </div>
    </section>
  );
}

function Home({ nav, events }) {
  return (
    <>
      <SloganMarquee />
      <Hero />
      <SloganMarquee />
      <ServiceTiles nav={nav} />
      <VillageStory nav={nav} />
      <Initiatives />
      <Festivals />
      {events.length > 0 && <EventsPreview events={events} nav={nav} />}
      <TeamSection />
      <StatsBar />
      <JoinCommunity />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   EMERGENCY PAGE
   Real hospital data from ayarewadi.in
   Add more hospitals by copying an object in the array below.
═══════════════════════════════════════════════════════════ */
function Emergency() {
  // TO ADD A HOSPITAL: copy one object and fill in details
  const hospitals = [
    {
      name:  "Rural Hospital Vaibhavwadi",
      img:   IMG.ruralHosp,
      addr:  "Khambalwadi, Maharashtra 416810",
      phone: "02367-237222",
      tags:  ["Ambulance", "24/7"],
    },
    {
      name:  "Aanadi Hospital",
      img:   IMG.aaaanadi,
      addr:  "SH-115, Vijaydurg Gaganbawda Rd, Sindhudurg 416810",
      phone: null,
      tags:  ["General"],
    },
    {
      name:  "Dr. Sanjay Marathe — Marathe Clinic",
      img:   IMG.marathe,
      addr:  "SH-115, Vijaydurg Gaganbawda Rd, Sindhudurg 416810",
      phone: null,
      tags:  ["Clinic"],
    },
  ];

  return (
    <section className="page-section">
      <div className="sec-header">
        <span className="eyebrow">Help & Safety</span>
        <h2>🚨 Emergency Contacts</h2>
      </div>

      {/* ALERT BANNER — change numbers if needed */}
      <div className="alert-banner">
        ⚠️ &nbsp;
        <strong>108</strong> – Free Ambulance &nbsp;|&nbsp;
        <strong>102</strong> – Ambulance Helpline &nbsp;|&nbsp;
        Sindhudurg: <strong>8149822015</strong> / <strong>7030397514</strong>
      </div>

      <h3 className="sub-title">Nearby Hospitals</h3>
      <div className="hosp-cards">
        {hospitals.map(h => (
          <div className="hosp-card" key={h.name}>
            <img src={h.img} alt={h.name} />
            <div className="hosp-body">
              <h3>{h.name}</h3>
              <div className="tags">{h.tags.map(t => <span className="tag" key={t}>{t}</span>)}</div>
              <p>{h.addr}</p>
              {h.phone && (
                <a href={`tel:${h.phone}`} className="btn-call" style={{ marginTop: "10px", display: "inline-block" }}>
                  📞 {h.phone}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* AMBULANCE STRIP */}
      <div className="hosp-card ambulance-card" style={{ marginTop: "20px" }}>
        <img src={IMG.ambulance} alt="Ambulance" className="ambulance-img" />
        <div className="ambulance-body">
          <h3 style={{ color: "var(--accent)", marginBottom: "10px" }}>🚑 Toll-Free Numbers</h3>
          <p><strong>108</strong> — Free emergency ambulance</p>
          <p><strong>102</strong> — Ambulance helpline</p>
          <p><strong>Sindhudurg:</strong> 8149822015 / 7030397514</p>
        </div>
      </div>

      <div className="info-card" style={{ marginTop: "20px" }}>
        <h3>Other Helplines</h3>
        <ul>
          <li>Police: <strong>100</strong></li>
          <li>Fire: <strong>101</strong></li>
          <li>Women Helpline: <strong>1091</strong></li>
          <li>Child Helpline: <strong>1098</strong></li>
          <li>Email: <strong>contact@ayarewadi.in</strong></li>
        </ul>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   MEMBER PORTAL / LOGIN
   Demo: AYR001 / village
   When backend is ready: real login via POST /login
═══════════════════════════════════════════════════════════ */
function Portal() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [id, setId]       = useState("");
  const [pass, setPass]   = useState("");
  const [err, setErr]     = useState("");
  const [member, setMember] = useState(null);
  const [family, setFamily] = useState([]);
  const [budget, setBudget] = useState([]);

  const login = async () => {
    try {
      // REAL LOGIN — calls your backend API
      const res = await axios.post(`${API}/login`, { member_id: id, password: pass });
      setMember(res.data.member);
      const [fam, bud] = await Promise.all([
        axios.get(`${API}/family/${id}`),
        axios.get(`${API}/budget`),
      ]);
      setFamily(fam.data);
      setBudget(bud.data);
      setLoggedIn(true); setErr("");
    } catch {
      // DEMO FALLBACK — remove this block when real backend login is ready
      if (id === "AYR001" && pass === "village") {
        setMember({ household_name: "Patil", house_no: "12" });
        setFamily([
          { id: 1, name: "Ramesh Patil",  role: "Head",     phone: "9876543210" },
          { id: 2, name: "Sunita Patil",  role: "Wife",      phone: "9876543211" },
          { id: 3, name: "Akash Patil",   role: "Son",       phone: "9876543212" },
          { id: 4, name: "Priya Patil",   role: "Daughter",  phone: null },
        ]);
        setBudget([
          { id: 1, description: "Gram Panchayat Fund",   type: "income",  amount: 150000 },
          { id: 2, description: "Festival Collection",   type: "income",  amount: 45000 },
          { id: 3, description: "Water Pipeline Repair", type: "expense", amount: 38000 },
          { id: 4, description: "Road Maintenance",      type: "expense", amount: 52000 },
          { id: 5, description: "School Renovation",     type: "expense", amount: 30000 },
          { id: 6, description: "Festival Expenses",     type: "expense", amount: 25000 },
        ]);
        setLoggedIn(true); setErr("");
      } else {
        setErr("Invalid ID or password.");
      }
    }
  };

  const balance = budget.reduce((acc, e) =>
    e.type === "income" ? acc + Number(e.amount) : acc - Number(e.amount), 0);

  if (!loggedIn) return (
    <section className="page-section center-section">
      <div className="login-box">
        <img src={IMG.logo} alt="Ayarewadi" style={{ height: "38px", marginBottom: "16px" }} />
        <h2>Member Login<br /><small>ग्राम सदस्य लॉगिन</small></h2>
        <label>Member ID</label>
        <input value={id} onChange={e => setId(e.target.value)} placeholder="e.g. AYR001" />
        <label>Password</label>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)}
          placeholder="Password" onKeyDown={e => e.key === "Enter" && login()} />
        {err && <p className="err">{err}</p>}
        <button className="btn-green" onClick={login}>Login | प्रवेश करा</button>
        <p className="hint">Demo: AYR001 / village</p>
      </div>
    </section>
  );

  return (
    <section className="page-section">
      <h2 className="section-title">
        👤 Welcome — {member?.household_name} कुटुंब (घर क्र. {member?.house_no})
      </h2>

      {/* FAMILY TREE — populated from DB after login */}
      <div className="info-card">
        <h3>👨‍👩‍👧‍👦 Family Tree | कुटुंब वृक्ष</h3>
        <div className="family-list">
          {family.map(m => (
            <div className="family-row" key={m.id}>
              <div><strong>{m.name}</strong> <span className="tag">{m.role}</span></div>
              {m.phone
                ? <a href={`tel:${m.phone}`} className="btn-call">📞 {m.phone}</a>
                : <span className="muted">—</span>}
            </div>
          ))}
        </div>
      </div>

      {/* BUDGET TABLE — replace static data with API when ready */}
      <div className="info-card" style={{ marginTop: "20px" }}>
        <h3>💰 Village Budget | गावाचा अर्थसंकल्प</h3>
        <div className="budget-table-wrap">
        <table className="budget-table">
          <thead><tr><th>Description</th><th>Type</th><th>Amount</th></tr></thead>
          <tbody>
            {budget.map(b => (
              <tr key={b.id}>
                <td>{b.description}</td>
                <td><span className={`tag ${b.type}`}>{b.type}</span></td>
                <td>₹{Number(b.amount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {/* BALANCE — change ₹50,000 to real balance from DB */}
        <div className="balance-bar">
          <span>💰 Current Balance | शिल्लक</span>
          <strong style={{ color: balance >= 0 ? "#2e7d32" : "#c62828" }}>
            ₹{balance.toLocaleString()}
          </strong>
        </div>
      </div>

      <button className="btn-green"
        style={{ marginTop: "16px", width: "auto", padding: "10px 28px" }}
        onClick={() => { setLoggedIn(false); setId(""); setPass(""); }}>
        Logout | बाहेर पडा
      </button>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   GALLERY PAGE
   Real village photos preloaded from ayarewadi.in
   Users can also upload their own photos (stored in memory).
═══════════════════════════════════════════════════════════ */
const GALLERY_DEFAULTS = [
  { src: IMG.templeReno, fullSrc: IMG.templeReno, label: "Temple Renovation" },
  { src: IMG.busStand,   fullSrc: IMG.busStand,   label: "Bus Stand" },
  { src: IMG.sports,     fullSrc: IMG.sports,     label: "Sports Events" },
  { src: IMG.temple,     fullSrc: IMG.temple,     label: "Ravalnath Temple" },
  { src: IMG.festival1,  fullSrc: IMG.festival1,  label: "Festival" },
  { src: IMG.festival2,  fullSrc: IMG.festival2,  label: "Festival" },
  { src: IMG.festival3,  fullSrc: IMG.festival3,  label: "Celebration" },
  { src: IMG.nature1,    fullSrc: IMG.nature1,    label: "Village Life" },
  { src: IMG.nature2,    fullSrc: IMG.nature2,    label: "Village" },
  { src: IMG.nature3,    fullSrc: IMG.nature3,    label: "Village" },
];

function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [query, setQuery]   = useState("");

  useEffect(() => {
    axios.get(`${API}/gallery`)
      .then(r => setPhotos(
        r.data.length > 0
          ? r.data.map(p => ({ src: p.thumbnail_url || p.url, fullSrc: p.url, label: p.caption || p.category || "" }))
          : GALLERY_DEFAULTS
      ))
      .catch(() => setPhotos(GALLERY_DEFAULTS));
  }, []);

  const filtered = query
    ? photos.filter(p => p.label.toLowerCase().includes(query.toLowerCase()))
    : photos;

  const download = async (src, label) => {
    try {
      const res  = await fetch(src);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = (label || "photo") + ".jpg";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(src, "_blank");
    }
  };

  return (
    <section className="page-section">
      <div className="sec-header">
        <span className="eyebrow">Memories</span>
        <h2 className="gallery-heading">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          Village Gallery | गाव फोटो
        </h2>
      </div>

      <div className="gallery-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          placeholder="Search photos..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button className="gallery-search-clear" onClick={() => setQuery("")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {filtered.length === 0 && query && (
        <p className="gallery-empty">No photos match "{query}"</p>
      )}

      <div className="gallery-grid">
        {filtered.map((p, i) => (
          <div className="gallery-item" key={i}>
            <img src={p.src} alt={p.label} loading="lazy" />
            <div className="gallery-overlay">
              <span className="gallery-caption">{p.label}</span>
              <button
                className="gallery-download"
                onClick={() => download(p.fullSrc || p.src, p.label)}
                title="Download photo"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   EVENTS PAGE
   Events load from your Supabase DB via backend.
   Fallback events shown if DB is empty or API is down.
   TO ADD EVENTS: insert rows in your Supabase events table.
═══════════════════════════════════════════════════════════ */
function Events({ events }) {
  // FALLBACK EVENTS — shown when DB has no data
  const fallback = [
    { id: 1, title: "रवळनाथ जत्रा",               description: "Annual Ravalnath Jatra — ढोल-ताशांचा गजर, मिरवणुका.", date: "2025-11-15", tag: "Festival" },
    { id: 2, title: "Gram Sabha | ग्रामसभा",       description: "Monthly village development meeting.", date: "2025-06-20", tag: "Meeting" },
    { id: 3, title: "Cricket Tournament | क्रिकेट", description: "Annual inter-village cricket tournament.", date: "2025-07-10", tag: "Sports" },
    { id: 4, title: "Ganeshotsav | गणेशोत्सव",    description: "10-day Ganesh festival with cultural programs.", date: "2025-08-29", tag: "Festival" },
  ];
  const list = events.length > 0 ? events : fallback;

  return (
    <section className="page-section">
      <div className="sec-header">
        <span className="eyebrow">Stay Updated</span>
        <h2>📅 News & Events | बातम्या व कार्यक्रम</h2>
      </div>
      <div className="events-list">
        {list.map(ev => (
          <div className="event-card" key={ev.id}>
            <div className="event-date">📅 {new Date(ev.date).toDateString()}</div>
            <h3>{ev.title}</h3>
            <p>{ev.description}</p>
            {ev.tag && <span className="tag">{ev.tag}</span>}
          </div>
        ))}
      </div>

      {/* NOTICE BOARD — update notices manually here */}
      <div className="info-card" style={{ marginTop: "24px" }}>
        <h3>📢 Notice Board | सूचना फलक</h3>
        <ul style={{ marginTop: "8px" }}>
          <li>Newsletter: <strong>contact@ayarewadi.in</strong></li>
          <li>Village tax deadline: <strong>30th June 2025</strong></li>
          <li>Ration cards: Apply at Gram Panchayat before 15th June</li>
        </ul>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
   Change contact email, social links, village name below.
═══════════════════════════════════════════════════════════ */
function Footer({ nav }) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src={IMG.logo} alt="Ayarewadi" className="footer-logo" />
          <p>आयरेवाडी (मांगवली) · वैभववाडी<br />सिंधुदुर्ग · महाराष्ट्र</p>
          <p className="footer-tagline">"एक गाव, एक ओळख, एक नातं"</p>
        </div>

        <div className="footer-col">
          <h4>Village</h4>
          <ul>
            <li><button onClick={() => nav("home")}>Home</button></li>
            <li><button onClick={() => nav("events")}>Events &amp; News</button></li>
            <li><button onClick={() => nav("gallery")}>Gallery</button></li>
            <li><button onClick={() => nav("portal")}>Member Portal</button></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Emergency</h4>
          <ul>
            <li><button onClick={() => nav("emergency")}>Hospitals</button></li>
            <li><a href="tel:108">108 — Free Ambulance</a></li>
            <li><a href="tel:100">100 — Police</a></li>
            <li><a href="tel:101">101 — Fire Brigade</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li>contact@ayarewadi.in</li>
            <li>Vaibhavwadi, Sindhudurg</li>
            <li>Maharashtra — 416810</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Ayarewadi.in · All rights reserved</p>
      </div>
    </footer>
  );
}

