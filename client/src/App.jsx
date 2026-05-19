import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

// ── BACKEND API URL — change this if your Render URL changes ──────────
const API = "https://ayarewadi-project.onrender.com";

// ── ALL IMAGES FROM ayarewadi.in — replace src URLs to use your own photos ──
const IMG = {
  // HERO: Full-screen background on home page — replace with your best village photo
  hero: "https://images.unsplash.com/photo-1694501333504-98ff498e2686?auto=format&fit=crop&w=1920",

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
            <button className={section === l.id ? "active" : ""} onClick={() => nav(l.id)}>
              {l.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════ */
function Home({ nav, events }) {
  return (
    <>
      {/* ── HERO SECTION ──────────────────────────────────
          Change IMG.hero above to use a different background.
          Change h1, p text below for your village tagline.
      ─────────────────────────────────────────────────── */}
      <section className="hero" style={{ backgroundImage: `url(${IMG.hero})` }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-eyebrow">सिंधुदुर्ग · वैभववाडी · कोकण · महाराष्ट्र</span>
          {/* MAIN HEADING — change village name/tagline here */}
          <h1>आयरेवाडी</h1>
          <p className="hero-tagline">"एक गाव, एक ओळख, एक नातं"</p>
          <p className="hero-sub">आमची संस्कृती, कार्यक्रम आणि बरेच काही — मोबाईल-अनुकूल स्वरूपात</p>
          <div className="hero-btns">
            <button className="btn-accent" onClick={() => nav("events")}>कार्यक्रम पाहा</button>
            <button className="btn-outline-white" onClick={() => nav("gallery")}>Gallery</button>
          </div>
        </div>
        <div className="hero-scroll-hint">↓</div>
      </section>

      {/* ── ABOUT STRIP ───────────────────────────────────
          Left: Temple photo (IMG.temple)
          Right: Village description text
          Change the <p> text to update village info.
      ─────────────────────────────────────────────────── */}
      <section className="about-strip">
        <div className="about-img-wrap">
          {/* Change IMG.temple to use a different side image */}
          <img src={IMG.temple} alt="Shri Dev Ravalnath Mandir" />
          <div className="about-img-label">🛕 श्री देव रवळनाथ मंदिर</div>
        </div>
        <div className="about-text">
          <span className="eyebrow">आमचं गाव</span>
          <h2>🌱 आयरेवाडी (मांगवली)</h2>
          {/* VILLAGE DESCRIPTION — update facts here */}
          <p>कोकण प्रदेशातील <strong>सिंधुदुर्ग जिल्ह्यात</strong> वसलेले आयरेवाडी हे एक सांस्कृतिक व निसर्गरम्य गाव आहे. येथे मराठी व कोकणी भाषा बोलल्या जातात.</p>
          <div className="about-stats-row">
            {/* STATS — change numbers to match your village data */}
            <div className="about-stat"><strong>1,264</strong><span>लोकसंख्या</span></div>
            <div className="about-stat"><strong>69%</strong><span>Literacy</span></div>
            <div className="about-stat"><strong>1,175</strong><span>Sex Ratio</span></div>
          </div>
          <p className="about-note">वैभववाडी रोड रेल्वे स्टेशन जवळ · NH‑166E / NH‑748 मार्गे</p>
          <button className="btn-accent-sm" onClick={() => nav("gallery")}>Photos →</button>
        </div>
      </section>

      {/* ── INITIATIVES ───────────────────────────────────
          3 cards showing village work done.
          Change title/sub/img for each card below.
      ─────────────────────────────────────────────────── */}
      <section className="initiatives-section">
        <div className="sec-header">
          <span className="eyebrow">Village Work</span>
          <h2>Initiatives by Members</h2>
        </div>
        <div className="init-grid">
          {[
            // TO ADD MORE CARDS: copy one object, change img/title/sub
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

      {/* ── TEMPLE / RAVALNATH SECTION ────────────────────
          Left: Text about Ravalnath temple
          Right: 3 village nature photos grid
          Change Marathi text below if needed.
      ─────────────────────────────────────────────────── */}

      {/* ── FESTIVALS ─────────────────────────────────────
          3 festival photos in a grid.
          Replace IMG.festival1/2/3 to change these photos.
      ─────────────────────────────────────────────────── */}
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

      {/* ── QUICK ACCESS CARDS ────────────────────────────
          4 service cards linking to other sections.
          Change label/sub to rename them.
      ─────────────────────────────────────────────────── */}
      <section className="page-section" style={{ paddingTop: 0 }}>
        <div className="sec-header">
          <span className="eyebrow">Quick Access</span>
          <h2>Village Services</h2>
        </div>
        <div className="cards-grid">
          {[
            { icon: "🚨", label: "Emergency",     sub: "Hospitals & contacts",  s: "emergency" },
            { icon: "👨‍👩‍👧", label: "Member Portal", sub: "Family tree & budget", s: "portal" },
            { icon: "📸", label: "Gallery",        sub: "Village photos",         s: "gallery" },
            { icon: "🎉", label: "Events",          sub: "Upcoming programs",     s: "events" },
          ].map(c => (
            <div className="qcard" key={c.s} onClick={() => nav(c.s)}>
              <span className="qcard-icon">{c.icon}</span>
              <h3>{c.label}</h3>
              <p>{c.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── EVENTS PREVIEW ────────────────────────────────
          Shows latest 3 events from your backend API.
          Only shows if events are loaded from database.
      ─────────────────────────────────────────────────── */}
      {events.length > 0 && (
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
      )}

      {/* ── STATS BAR ─────────────────────────────────────
          Bottom stats strip. Change numbers/labels here.
      ─────────────────────────────────────────────────── */}
      <div className="stats-strip">
        {[
          { n: "1,264", label: "लोकसंख्या" },
          { n: "69%",   label: "Literacy Rate" },
          { n: "1,175", label: " Ratio" },
          { n: "2025",  label: "ayarewadi.in" },
        ].map(s => (
          <div className="stat" key={s.label}>
            <strong>{s.n}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
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
      <div className="hosp-card" style={{ marginTop: "20px", flexDirection: "row", gap: "20px" }}>
        <img src={IMG.ambulance} alt="Ambulance"
          style={{ width: "160px", height: "140px", objectFit: "cover", borderRadius: "10px", flexShrink: 0 }} />
        <div style={{ padding: "12px 0" }}>
          <h3 style={{ color: "var(--accent)", marginBottom: "10px" }}>🚑 Toll-Free Numbers</h3>
          {/* EMERGENCY NUMBERS — update if changed */}
          <p><strong>108</strong> — Free emergency ambulance</p>
          <p style={{ marginTop: "6px" }}><strong>102</strong> — Ambulance helpline</p>
          <p style={{ marginTop: "6px" }}><strong>Sindhudurg:</strong> 8149822015 / 7030397514</p>
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

  const login = async () => {
    try {
      // REAL LOGIN — calls your backend API
      const res = await axios.post(`${API}/login`, { member_id: id, password: pass });
      setMember(res.data.member);
      const fam = await axios.get(`${API}/family/${id}`);
      setFamily(fam.data);
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
        setLoggedIn(true); setErr("");
      } else {
        setErr("Invalid ID or password.");
      }
    }
  };

  // BUDGET DATA — replace with real API call when ready
  const budget = [
    { desc: "Gram Panchayat Fund",    type: "income",  amt: "₹1,50,000" },
    { desc: "Festival Collection",    type: "income",  amt: "₹45,000" },
    { desc: "Water Pipeline Repair",  type: "expense", amt: "₹38,000" },
    { desc: "Road Maintenance",       type: "expense", amt: "₹52,000" },
    { desc: "School Renovation",      type: "expense", amt: "₹30,000" },
    { desc: "Festival Expenses",      type: "expense", amt: "₹25,000" },
  ];

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
        <table className="budget-table">
          <thead><tr><th>Description</th><th>Type</th><th>Amount</th></tr></thead>
          <tbody>
            {budget.map(b => (
              <tr key={b.desc}>
                <td>{b.desc}</td>
                <td><span className={`tag ${b.type}`}>{b.type}</span></td>
                <td>{b.amt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* BALANCE — change ₹50,000 to real balance from DB */}
        <div className="balance-bar">
          <span>💰 Current Balance | शिल्लक</span>
          <strong>₹50,000</strong>
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
function Gallery() {
  // TO ADD MORE DEFAULT PHOTOS: add { src: "URL", label: "Name" } here
  const defaults = [
    { src: IMG.templeReno, label: "Temple Renovation" },
    { src: IMG.busStand,   label: "Bus Stand" },
    { src: IMG.sports,     label: "Sports Events" },
    { src: IMG.temple,     label: "Ravalnath Temple" },
    { src: IMG.festival1,  label: "Festival" },
    { src: IMG.festival2,  label: "Festival" },
    { src: IMG.festival3,  label: "Celebration" },
    { src: IMG.nature1,    label: "Village Life" },
    { src: IMG.nature2,    label: "Village" },
    { src: IMG.nature3,    label: "Village" },
  ];
  const [photos, setPhotos] = useState(defaults);

  const upload = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotos(p => [{ src: ev.target.result, label: file.name }, ...p]);
    reader.readAsDataURL(file);
  };

  return (
    <section className="page-section">
      <div className="sec-header">
        <span className="eyebrow">Memories</span>
        <h2>🖼️ Village Gallery | गाव फोटो</h2>
      </div>
      <label className="upload-label">
        📷 Upload Photo
        <input type="file" accept="image/*" onChange={upload} style={{ display: "none" }} />
      </label>
      <div className="gallery-grid">
        {photos.map((p, i) => (
          <div className="gallery-item" key={i}>
            <img src={p.src} alt={p.label} />
            <div className="gallery-caption">{p.label}</div>
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
      <div className="footer-inner">
        <img src={IMG.logo} alt="Ayarewadi" style={{ height: "34px", marginBottom: "12px" }} />
        {/* FOOTER VILLAGE INFO — change location details here */}
        <p>आयरेवाडी (मांगवली) · वैभववाडी · सिंधुदुर्ग · महाराष्ट्र</p>
        <div className="footer-links">
          <button onClick={() => nav("home")}>Home</button>
          <button onClick={() => nav("emergency")}>Emergency</button>
          <button onClick={() => nav("events")}>Events</button>
          <button onClick={() => nav("gallery")}>Gallery</button>
        </div>
        {/* CONTACT EMAIL — change here */}
        <p style={{ marginTop: "8px" }}>📧 contact@ayarewadi.in</p>
        <p style={{ marginTop: "8px", opacity: 0.45, fontSize: "0.75rem" }}>
          © 2025 Ayarewadi.in · All rights reserved.
        </p>
      </div>
    </footer>
  );
}


return (
  <div className="app">
    <Navbar section={section} nav={nav} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    <main>
      {section === "home"      && <Home nav={nav} events={events} />}
      {section === "emergency" && <Emergency />}
      {section === "portal"    && <Portal />}
      {section === "gallery"   && <Gallery />}
      {section === "events"    && <Events events={events} />}
      {section === "admin"     && <Admin />}        {/* ← ADD THIS for admin page */}
    </main>

    <Footer nav={nav} />
    <a href="https://wa.me/919594179606" className="whatsapp-float" target="_blank" rel="noreferrer">💬</a>
  </div>
);
}