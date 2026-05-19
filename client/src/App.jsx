import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import Admin from "./pages/Admin.jsx";
import heroImg      from "./assets/images/main_image_home.png";
import emergencyImg from "./assets/images/emergency.png";
import eventsImg    from "./assets/images/news.png";
import galleryImg   from "./assets/images/gallery.png";
import portalImg    from "./assets/images/portal.png";
import templeImg    from "./assets/images/ravalnath_temple.png";
import villageInfoImg from "./assets/images/village_info_iamge.png";

// ── BACKEND API URL — change this if your Render URL changes ──────────
const API = "https://ayarewadi-project.onrender.com";

// ── ALL IMAGES FROM ayarewadi.in — replace src URLs to use your own photos ──
const IMG = {
  // HERO: Full-screen background on home page — replace with your best village photo
  hero: heroImg,

  // TEMPLE: Side image in About section — your Ravalnath temple photo
  temple: templeImg,

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
      <Navigation_Bar section={section} nav={nav} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        {section === "home"      && <Home_Page nav={nav} events={events} />}
        {section === "emergency" && <Emergency_Page />}
        {section === "portal"    && <Portal_Page />}
        {section === "gallery"   && <Gallery_Page />}
        {section === "events"    && <Events_Page events={events} />}
        {section === "admin"     && <Admin />}
      </main>
      <Footer_Section nav={nav} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAVBAR
   - Logo auto-inverts to white
   - Transparent on hero, solid on scroll
═══════════════════════════════════════════════════════════ */
function Navigation_Bar({ section, nav, menuOpen, setMenuOpen }) {
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
function Hero_Section() {
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

function Slogan_Marquee() {
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

function Village_Services({ nav }) {
  const tiles = [
    { img: emergencyImg, label: "Emergency", sub: "Hospitals & emergency contacts", s: "emergency", tag: "Help & Safety", icon: "🚨" },
    { img: eventsImg,    label: "Events",    sub: "Upcoming village programs",      s: "events",    tag: "Stay Updated",  icon: "🎉" },
    { img: galleryImg,   label: "Gallery",   sub: "Village photo memories",         s: "gallery",   tag: "Photos",        icon: "📸" },
    { img: portalImg,    label: "Portal",    sub: "Family tree & village budget",   s: "portal",    tag: "Members Only",  icon: "👤" },
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
              style={{ backgroundImage: `url(${t.img})` }}>
              <div className="svc-overlay" />
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

function Village_Details({ nav }) {
  return (
    <section className="vd-section">
      <div className="vd-grid">

        {/* Left — temple image */}
        <div className="vd-image-col">
          <div className="vd-img-wrap">
            <img src={villageInfoImg} alt="आयरेवाडी गाव" />
            <div className="vd-img-badge">
              <span>🛕</span>
              <span>श्री देव रवळनाथ मंदिर · आयरेवाडी</span>
            </div>
          </div>
        </div>

        {/* Right — village info cards */}
        <div className="vd-info-col">
          <div className="vd-eyebrow">
            <span className="vd-eyebrow-dot" />
            आमचं गाव · Our Village
          </div>

          <h2 className="vd-title">
            आयरेवाडी <span className="vd-title-accent">गाव</span>
          </h2>

          <div className="vd-location-row">
            <span className="vd-location-chip">📍 मांगवली</span>
            <span className="vd-location-chip">🏛️ वैभववाडी</span>
            <span className="vd-location-chip">🗺️ सिंधुदुर्ग</span>
            <span className="vd-location-chip">🇮🇳 महाराष्ट्र</span>
          </div>

          <p className="vd-desc">
            कोकण प्रदेशातील सिंधुदुर्ग जिल्ह्यात वसलेले आयरेवाडी हे एक
            सांस्कृतिक व निसर्गरम्य गाव आहे. येथे मराठी व कोकणी भाषा
            बोलल्या जातात. गाव आसपासील उपले, कोळपे, नेटल, एचेट या गावांजवळ आहे.
          </p>

          <div className="vd-stats-grid">
            <div className="vd-stat-card">
              <span className="vd-stat-icon">👥</span>
              <strong>1,264</strong>
              <span>लोकसंख्या</span>
            </div>
            <div className="vd-stat-card">
              <span className="vd-stat-icon">📚</span>
              <strong>69%</strong>
              <span>Literacy Rate</span>
            </div>
            <div className="vd-stat-card">
              <span className="vd-stat-icon">⚖️</span>
              <strong>1,175</strong>
              <span>Ratio</span>
            </div>
            <div className="vd-stat-card">
              <span className="vd-stat-icon">🏘️</span>
              <strong>280+</strong>
              <span>Households</span>
            </div>
          </div>

          <div className="vd-transport-row">
            <div className="vd-transport-card">
              <span className="vd-transport-icon">🚉</span>
              <div>
                <strong>रेल्वे स्टेशन</strong>
                <p>वैभववाडी रोड (जवळ)</p>
              </div>
            </div>
            <div className="vd-transport-card">
              <span className="vd-transport-icon">🛣️</span>
              <div>
                <strong>महामार्ग</strong>
                <p>NH‑166E · NH‑748</p>
              </div>
            </div>
          </div>

          <button className="vd-cta" onClick={() => nav("gallery")}>
            📸 गाव फोटो पाहा →
          </button>
        </div>
      </div>
    </section>
  );
}

function Ravalnath_Temple() {
  return (
    <section className="rt-section">
      <div className="rt-deco">🕉️</div>

      <div className="rt-container">

        {/* Left — framed temple image */}
        <div className="rt-img-col">
          <div className="rt-img-frame">
            <img src={IMG.temple} alt="श्री देव रवळनाथ मंदिर" />
            <div className="rt-img-glow" />
          </div>
          <div className="rt-img-caption">
            <span>🛕</span>
            श्री देव रवळनाथ मंदिर · आयरेवाडी
          </div>
        </div>

        {/* Right — temple history & content */}
        <div className="rt-content-col">
          <span className="rt-eyebrow">ग्रामदैवत · Village Deity</span>

          <div className="rt-heading">
            <span className="rt-heading-sub">श्री देव</span>
            <span className="rt-heading-main">रवळनाथ मंदिर</span>
          </div>

          <div className="rt-rule" />

          <div className="rt-body">
            <p>श्री देव रवळनाथ हे दक्षिण कोकणातील एक प्रसिद्ध दैवत आहे. आमच्या गावातलं रवळनाथ मंदिर खूप जुनं आहे आणि वर्षानुवर्षं आम्ही त्यांची पूजा करत आलो आहोत. रवळनाथ देव आमच्या गावाचे <strong>ग्रामदैवत</strong> असून ते गावाचं, शेताचं आणि जनावरांचं रक्षण करतात.</p>
            <p>श्रद्धेनुसार, रवळनाथ देव हे <strong>भगवान शिव किंवा भैरव</strong> यांचे उग्र रूप मानले जाते. त्यांच्या हातात तलवार आणि बाजूला त्रिशूल ही त्यांची मुख्य प्रतीकं आहेत. कोकणातील लोकांचा विश्वास आहे की रवळनाथ देव वाईट शक्ती, रोगराई आणि संकटं यापासून गावाचं संरक्षण करतात.</p>
            <p>दरवर्षी <strong>रवळनाथ जत्रा</strong> मोठ्या उत्साहात साजरी केली जाते. त्या दिवशी ढोल-ताशांचा गजर, मिरवणुका आणि देवाला नैवेद्य अर्पण करण्यासाठी दूरदूरून भक्त येतात. मंदिर परिसर फुलांनी सजवला जातो आणि वातावरण भक्तीभावाने भारून जातं.</p>
          </div>

          <blockquote className="rt-blockquote">
            "आमच्यासाठी रवळनाथ देव म्हणजे केवळ देव नाही, तर{" "}
            <strong>गावाचा अभिमान आणि बळ आहे.</strong>"
          </blockquote>

          <div className="rt-tags">
            <span className="rt-tag">🏛️ प्राचीन मंदिर</span>
            <span className="rt-tag">🔱 ग्रामदैवत</span>
            <span className="rt-tag">🎉 वार्षिक जत्रा</span>
            <span className="rt-tag">🙏 दक्षिण कोकण</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Member_Initiatives() {
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

function Village_Festivals() {
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

function Events_Preview({ events, nav }) {
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

function Team_Members() {
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


function Join_Community() {
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

function Home_Page({ nav, events }) {
  return (
    <>
      <Hero_Section />
      <Slogan_Marquee />
      <Village_Services nav={nav} />
      <Village_Details nav={nav} />
      <Ravalnath_Temple />
      <Member_Initiatives />
      <Village_Festivals />
      {events.length > 0 && <Events_Preview events={events} nav={nav} />}
      <Team_Members />
      <Join_Community />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   EMERGENCY PAGE
   Real hospital data from ayarewadi.in
   Add more hospitals by copying an object in the array below.
═══════════════════════════════════════════════════════════ */
function Emergency_Page() {
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
function Portal_Page() {
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

function Gallery_Page() {
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
function Events_Page({ events }) {
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
function Footer_Section({ nav }) {
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

