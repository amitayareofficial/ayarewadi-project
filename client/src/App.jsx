import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "https://ayarewadi-project.onrender.com";

// ── All images from your own ayarewadi.in website ──────────────────
const IMG = {
  hero:       "https://images.unsplash.com/photo-1694501333504-98ff498e2686?auto=format&fit=crop&w=1920",
  templeReno: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=721,fit=crop,trim=165.20076481835565;0;479.08221797323137;0/YNq2a76xB3Ip7LZZ/img_20231008_171637-AMq8ka5gQ9T49MZn.jpg",
  busStand:   "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=721,fit=crop,trim=296.7117988394584;74.3175965665236;373.15280464216636;0/YNq2a76xB3Ip7LZZ/whatsapp-image-2025-06-07-at-7.06.56-pm-mePJZ51Bekfgav0a.jpeg",
  sports:     "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=721,fit=crop,trim=0;83.42158859470469;0;329.5152749490835/YNq2a76xB3Ip7LZZ/whatsapp-image-2025-08-10-at-1.24.58-am-mjEGa20ZkvuNlzg6.jpeg",
  temple:     "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=964,fit=crop/YNq2a76xB3Ip7LZZ/img_20231008_171703-YBgbklJZkwuXBwnj.jpg",
  festival1:  "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=721,fit=crop,trim=0;209.69450101832996;0;0/YNq2a76xB3Ip7LZZ/whatsapp-image-2025-08-10-at-12.06.58-am-AzGNwDaNRWIk2lae.jpeg",
  festival2:  "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=721,fit=crop,trim=0;384.54211956521743;0;362.81657608695656/YNq2a76xB3Ip7LZZ/whatsapp-image-2025-08-10-at-12.07.00-am-1-mP4MkNVWqrTxwBb0.jpeg",
  festival3:  "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=721,fit=crop,trim=0;117.31160896130346;0;463.3808553971487/YNq2a76xB3Ip7LZZ/img_20230923_151456-dOqDklw1xKup1yxM.jpg",
  nature1:    "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=310,fit=crop,trim=0;59.96330275229358;0;34.715596330275226/YNq2a76xB3Ip7LZZ/whatsapp-image-2025-08-10-at-1.24.59-am-ALpPkJDvqQFz7l0N.jpeg",
  nature2:    "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=310,fit=crop,trim=425.32323232323233;0;514.1565656565656;0/YNq2a76xB3Ip7LZZ/whatsapp-image-2025-08-10-at-12.06.52-am-mv0J6lZwOyiRQzkn.jpeg",
  nature3:    "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=337,fit=crop,trim=0;128;0;132.92307692307693/YNq2a76xB3Ip7LZZ/whatsapp-image-2025-08-10-at-12.30.51-am-1-A0xjJrWaDDt2zOMB.jpeg",
  ruralHosp:  "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=723,fit=crop/YNq2a76xB3Ip7LZZ/rural-hospital-vaibhavwadi-mk3JOK95lPFqKXZx.webp",
  aaaanadi:   "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=723,fit=crop/YNq2a76xB3Ip7LZZ/anadi-hospital-A85VKX1j4xFDB4Zy.png",
  marathe:    "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=723,fit=crop,trim=0;81.04735062006765;0;158.608793686584/YNq2a76xB3Ip7LZZ/marathe-clinic-hospital-YanJ8K4l8pCllDbZ.png",
  ambulance:  "https://images.unsplash.com/photo-1599700403969-f77b3aa74837?auto=format&fit=crop&w=612&h=576",
  logo:       "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,h=44,fit=crop/YNq2a76xB3Ip7LZZ/logo-AMq8kxQE5PsQv1g4.png",
  hospitalBg: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1920",
};

export default function App() {
  const [section, setSection]   = useState("home");
  const [events, setEvents]     = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    axios.get(`${API}/events`).then(r => setEvents(r.data)).catch(() => {});
  }, []);

  const nav = s => { setSection(s); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

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

/* ── NAVBAR ─────────────────────────────────────────────── */
function Navbar({ section, nav, menuOpen, setMenuOpen }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const links = [
    { id: "home", label: "Home" },
    { id: "emergency", label: "Emergency" },
    { id: "portal", label: "Portal" },
    { id: "gallery", label: "Gallery" },
    { id: "events", label: "Events" },
  ];
  return (
    <nav className={`navbar ${scrolled || section !== "home" ? "scrolled" : ""}`}>
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

/* ── HOME ────────────────────────────────────────────────── */
function Home({ nav, events }) {
  return (
    <>
      {/* HERO — your own sea/water image */}
      <section className="hero" style={{ backgroundImage: `url(${IMG.hero})` }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-eyebrow">सिंधुदुर्ग · कोकण · महाराष्ट्र</span>
          <h1>आयरेवाडी गाव</h1>
          <p>"एक गाव, एक ओळख, एक नातं – आयरेवाडी!"</p>
          <p className="hero-sub">आमची संस्कृती, वंशवृक्ष, कार्यक्रम आणि बरेच काही मोबाईल-अनुकूल स्वरूपात शोधा</p>
          <div className="hero-btns">
            <button className="btn-white" onClick={() => nav("events")}>कार्यक्रम पाहा</button>
            <button className="btn-outline-white" onClick={() => nav("gallery")}>Gallery</button>
          </div>
        </div>
        <div className="hero-scroll-hint">↓ Scroll</div>
      </section>

      {/* ABOUT STRIP */}
      <section className="about-strip">
        <div className="about-img-wrap">
          <img src={IMG.temple} alt="Shri Dev Ravalnath Temple" />
        </div>
        <div className="about-text">
          <span className="eyebrow">आमचं गाव</span>
          <h2>🌱 आयरेवाडी (मांगवली)</h2>
          <p>कोकण प्रदेशातील सिंधुदुर्ग जिल्ह्यात वसलेले आयरेवाडी हे एक सांस्कृतिक व निसर्गरम्य गाव आहे. येथे मराठी व कोकणी भाषा बोलल्या जातात व गावाची लोकसंख्या अंदाजे <strong>1,264</strong> इतकी आहे.</p>
          <p style={{marginTop:"10px"}}>2011 च्या जनगणनेनुसार साक्षरता दर <strong>69%</strong> असून, स्त्री-पुरूष गुणोत्तर <strong>1,175</strong> आहे. वैभववाडी रोड रेल्वे स्टेशन जवळ आहे आणि NH‑166E / NH‑748 मार्गे सहज पोहोचता येते.</p>
          <button className="btn-green-sm" style={{marginTop:"20px"}} onClick={() => nav("gallery")}>More Photos →</button>
        </div>
      </section>

      {/* INITIATIVES — your real village photos */}
      <section className="exp-section">
        <div className="exp-header">
          <span className="eyebrow">Village Work</span>
          <h2>Initiatives by Ayarewadi Members</h2>
        </div>
        <div className="exp-grid">
          {[
            { img: IMG.templeReno, title: "Temple Renovation",  sub: "Restoration of our village temple" },
            { img: IMG.busStand,   title: "Bus Stand Sign Board", sub: "New sign board at village bus stand" },
            { img: IMG.sports,     title: "Organizing Sports",  sub: "Sports events for village youth" },
          ].map(e => (
            <div className="exp-card" key={e.title}>
              <img src={e.img} alt={e.title} />
              <div className="exp-card-body">
                <h3>{e.title}</h3>
                <p>{e.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TEMPLE SECTION */}
      <section className="temple-section">
        <div className="temple-text">
          <span className="eyebrow">ग्रामदैवत</span>
          <h2>🕉️ श्री देव रवळनाथ मंदिर</h2>
          <p>श्री देव रवळनाथ हे दक्षिण कोकणातील एक प्रसिद्ध दैवत आहे. आमच्या गावातलं रवळनाथ मंदिर खूप जुनं आहे आणि वर्षानुवर्षं आम्ही त्यांची पूजा करत आलो आहोत.</p>
          <p style={{marginTop:"12px"}}>रवळनाथ देव हे भगवान शिव किंवा भैरव यांचे उग्र रूप मानले जाते. दरवर्षी <strong>रवळनाथ जत्रा</strong> मोठ्या उत्साहात साजरी केली जाते — ढोल-ताशांचा गजर, मिरवणुका आणि दूरदूरून भक्त येतात.</p>
          <p style={{marginTop:"12px", color:"#a5d6a7"}}>आमच्यासाठी रवळनाथ देव म्हणजे केवळ देव नाही, तर गावाचा अभिमान आणि बळ आहे.</p>
        </div>
        <div className="temple-imgs">
          <img src={IMG.nature1} alt="Village nature" />
          <img src={IMG.nature2} alt="Village scene" />
          <img src={IMG.nature3} alt="Village scene" />
        </div>
      </section>

      {/* FESTIVALS */}
      <section className="page-section">
        <div className="section-head">
          <span className="eyebrow">उत्सव</span>
          <h2 className="section-title">🔱 Festivals in Ayarewadi</h2>
        </div>
        <div className="festival-grid">
          {[IMG.festival1, IMG.festival2, IMG.festival3].map((src, i) => (
            <div className="festival-img" key={i}>
              <img src={src} alt={`Festival ${i+1}`} />
            </div>
          ))}
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="page-section" style={{paddingTop:0}}>
        <div className="section-head">
          <span className="eyebrow">Quick Access</span>
          <h2 className="section-title">Village Services</h2>
        </div>
        <div className="cards-grid">
          {[
            { icon: "🚨", label: "Emergency", sub: "Hospitals & contacts", s: "emergency" },
            { icon: "👨‍👩‍👧‍👦", label: "Member Portal", sub: "Family tree & budget", s: "portal" },
            { icon: "📸", label: "Gallery", sub: "Village photos", s: "gallery" },
            { icon: "🎉", label: "Events", sub: "Upcoming programs", s: "events" },
          ].map(c => (
            <div className="qcard" key={c.s} onClick={() => nav(c.s)}>
              <span className="qcard-icon">{c.icon}</span>
              <h3>{c.label}</h3>
              <p>{c.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EVENTS PREVIEW */}
      {events.length > 0 && (
        <section className="page-section" style={{paddingTop:0}}>
          <div className="section-head">
            <span className="eyebrow">What's On</span>
            <h2 className="section-title">Upcoming Events</h2>
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
          <button className="btn-green-sm" style={{marginTop:"16px"}} onClick={() => nav("events")}>All Events →</button>
        </section>
      )}

      {/* STATS */}
      <div className="stats-strip">
        {[
          { n: "1,264", label: "लोकसंख्या" },
          { n: "69%",   label: "Literacy Rate" },
          { n: "1,175", label: "Sex Ratio" },
          { n: "1",     label: "एक गाव, एक नातं" },
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

/* ── EMERGENCY ──────────────────────────────────────────── */
function Emergency() {
  const hospitals = [
    {
      name: "Rural Hospital Vaibhavwadi",
      img: IMG.ruralHosp,
      addr: "Khambalwadi, Maharashtra 416810",
      phone: "02367-237222",
      tags: ["Ambulance", "24/7"],
    },
    {
      name: "Aanadi Hospital",
      img: IMG.aaaanadi,
      addr: "SH-115, Vijaydurg Gaganbawda Road, Sindhudurg 416810",
      phone: null,
      tags: ["General"],
    },
    {
      name: "Dr. Sanjay Marathe — Marathe Clinic",
      img: IMG.marathe,
      addr: "SH-115, Vijaydurg Gaganbawda Road, Sindhudurg 416810",
      phone: null,
      tags: ["Clinic"],
    },
  ];
  return (
    <section className="page-section">
      <div className="section-head">
        <span className="eyebrow">Help & Safety</span>
        <h2 className="section-title">🚨 Emergency Contacts</h2>
      </div>

      {/* banner */}
      <div className="alert-banner">
        ⚠️ &nbsp;
        <strong>108</strong> – Free Ambulance &nbsp;|&nbsp;
        <strong>102</strong> – Ambulance Helpline &nbsp;|&nbsp;
        Sindhudurg District: <strong>8149822015</strong> / <strong>7030397514</strong>
      </div>

      {/* hospital cards with images */}
      <h3 className="sub-title">Nearby Hospitals</h3>
      <div className="hosp-cards">
        {hospitals.map(h => (
          <div className="hosp-card" key={h.name}>
            <img src={h.img} alt={h.name} />
            <div className="hosp-body">
              <h3>{h.name}</h3>
              <div className="tags">{h.tags.map(t => <span className="tag" key={t}>{t}</span>)}</div>
              <p>{h.addr}</p>
              {h.phone && <a href={`tel:${h.phone}`} className="btn-call" style={{marginTop:"10px", display:"inline-block"}}>📞 {h.phone}</a>}
            </div>
          </div>
        ))}
      </div>

      {/* ambulance */}
      <div className="hosp-card" style={{marginTop:"20px", flexDirection:"row", gap:"20px"}}>
        <img src={IMG.ambulance} alt="Ambulance" style={{width:"160px", height:"140px", objectFit:"cover", borderRadius:"10px", flexShrink:0}} />
        <div style={{padding:"12px 0"}}>
          <h3 style={{color:"var(--green)", marginBottom:"10px"}}>🚑 Toll-Free Emergency Numbers</h3>
          <p><strong>108</strong> — Free emergency medical response (ambulance)</p>
          <p style={{marginTop:"6px"}}><strong>102</strong> — Ambulance helpline</p>
          <p style={{marginTop:"6px"}}><strong>Sindhudurg District Ambulance:</strong> 8149822015 / 7030397514</p>
        </div>
      </div>

      <div className="info-card" style={{marginTop:"20px"}}>
        <h3>Other Helplines</h3>
        <ul>
          <li>Police: <strong>100</strong></li>
          <li>Fire Brigade: <strong>101</strong></li>
          <li>Women Helpline: <strong>1091</strong></li>
          <li>Child Helpline: <strong>1098</strong></li>
          <li>Email: <strong>contact@ayarewadi.in</strong></li>
        </ul>
      </div>
    </section>
  );
}

/* ── PORTAL ─────────────────────────────────────────────── */
function Portal() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [id, setId]     = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr]   = useState("");
  const [member, setMember]   = useState(null);
  const [family, setFamily]   = useState([]);

  const login = async () => {
    try {
      const res = await axios.post(`${API}/login`, { member_id: id, password: pass });
      setMember(res.data.member);
      const fam = await axios.get(`${API}/family/${id}`);
      setFamily(fam.data);
      setLoggedIn(true); setErr("");
    } catch {
      // fallback demo
      if (id === "AYR001" && pass === "village") {
        setMember({ household_name: "Patil", house_no: "12" });
        setFamily([
          { id:1, name:"Ramesh Patil",  role:"Head",     phone:"9876543210" },
          { id:2, name:"Sunita Patil",  role:"Wife",      phone:"9876543211" },
          { id:3, name:"Akash Patil",   role:"Son",       phone:"9876543212" },
          { id:4, name:"Priya Patil",   role:"Daughter",  phone:null },
        ]);
        setLoggedIn(true); setErr("");
      } else {
        setErr("Invalid ID or password.");
      }
    }
  };

  const budget = [
    { desc:"Gram Panchayat Fund",   type:"income",  amt:"₹1,50,000" },
    { desc:"Festival Collection",   type:"income",  amt:"₹45,000" },
    { desc:"Water Pipeline Repair", type:"expense", amt:"₹38,000" },
    { desc:"Road Maintenance",      type:"expense", amt:"₹52,000" },
    { desc:"School Renovation",     type:"expense", amt:"₹30,000" },
    { desc:"Festival Expenses",     type:"expense", amt:"₹25,000" },
  ];

  if (!loggedIn) return (
    <section className="page-section center-section">
      <div className="login-box">
        <img src={IMG.logo} alt="Ayarewadi" style={{height:"40px", marginBottom:"16px"}} />
        <h2>Member Login<br /><small>ग्राम सदस्य लॉगिन</small></h2>
        <label>Member ID</label>
        <input value={id} onChange={e => setId(e.target.value)} placeholder="e.g. AYR001" />
        <label>Password</label>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Password"
          onKeyDown={e => e.key==="Enter" && login()} />
        {err && <p className="err">{err}</p>}
        <button className="btn-green" onClick={login}>Login | प्रवेश करा</button>
        <p className="hint">Demo: AYR001 / village</p>
      </div>
    </section>
  );

  return (
    <section className="page-section">
      <h2 className="section-title">👤 Welcome, {member?.household_name} (घर क्र. {member?.house_no})</h2>
      <div className="info-card">
        <h3>👨‍👩‍👧‍👦 Family Tree</h3>
        <div className="family-list">
          {family.map(m => (
            <div className="family-row" key={m.id}>
              <div><strong>{m.name}</strong> <span className="tag">{m.role}</span></div>
              {m.phone ? <a href={`tel:${m.phone}`} className="btn-call">📞 {m.phone}</a>
                       : <span className="muted">—</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="info-card" style={{marginTop:"20px"}}>
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
        <div className="balance-bar">
          <span>💰 Current Balance | शिल्लक</span>
          <strong>₹50,000</strong>
        </div>
      </div>
      <button className="btn-green" style={{marginTop:"16px",width:"auto",padding:"10px 28px"}}
        onClick={() => { setLoggedIn(false); setId(""); setPass(""); }}>
        Logout | बाहेर पडा
      </button>
    </section>
  );
}

/* ── GALLERY ─────────────────────────────────────────────── */
function Gallery() {
  const defaults = [
    { src: IMG.templeReno, label: "Temple Renovation" },
    { src: IMG.busStand,   label: "Bus Stand" },
    { src: IMG.sports,     label: "Sports Events" },
    { src: IMG.temple,     label: "Ravalnath Temple" },
    { src: IMG.festival1,  label: "Festival" },
    { src: IMG.festival2,  label: "Festival" },
    { src: IMG.festival3,  label: "Celebration" },
    { src: IMG.nature1,    label: "Village" },
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
      <div className="section-head">
        <span className="eyebrow">Memories</span>
        <h2 className="section-title">🖼️ Village Gallery | गाव फोटो</h2>
      </div>
      <label className="upload-label">
        📷 Upload Photo
        <input type="file" accept="image/*" onChange={upload} style={{display:"none"}} />
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

/* ── EVENTS ──────────────────────────────────────────────── */
function Events({ events }) {
  const fallback = [
    { id:1, title:"रवळनाथ जत्रा", description:"Annual Ravalnath Jatra — ढोल-ताशांचा गजर, मिरवणुका आणि भक्तीभाव.", date:"2025-11-15", tag:"Festival" },
    { id:2, title:"Gram Sabha Meeting | ग्रामसभा", description:"Monthly meeting for village development and budget review.", date:"2025-06-20", tag:"Meeting" },
    { id:3, title:"Sports Event | क्रीडा स्पर्धा", description:"Annual sports competition for village youth.", date:"2025-07-10", tag:"Sports" },
    { id:4, title:"Ganeshotsav | गणेशोत्सव", description:"10-day Ganesh festival with cultural programs.", date:"2025-08-29", tag:"Festival" },
  ];
  const list = events.length > 0 ? events : fallback;

  return (
    <section className="page-section">
      <div className="section-head">
        <span className="eyebrow">Stay Updated</span>
        <h2 className="section-title">📅 News & Events | बातम्या व कार्यक्रम</h2>
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
      <div className="info-card" style={{marginTop:"24px", background:"var(--pale)"}}>
        <h3>📢 Notice Board | सूचना फलक</h3>
        <ul style={{marginTop:"8px"}}>
          <li>Subscribe to newsletter: <strong>contact@ayarewadi.in</strong></li>
          <li>Village tax payment deadline: 30th June 2025.</li>
          <li>New ration cards: Apply at Gram Panchayat office before 15th June.</li>
        </ul>
      </div>
    </section>
  );
}

/* ── FOOTER ──────────────────────────────────────────────── */
function Footer({ nav }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <img src={IMG.logo} alt="Ayarewadi" style={{height:"36px", marginBottom:"12px"}} />
        <p>आयरेवाडी (मांगवली) · वैभववाडी · सिंधुदुर्ग · महाराष्ट्र</p>
        <div className="footer-links">
          <button onClick={() => nav("home")}>Home</button>
          <button onClick={() => nav("emergency")}>Emergency</button>
          <button onClick={() => nav("events")}>Events</button>
          <button onClick={() => nav("gallery")}>Gallery</button>
        </div>
        <p style={{marginTop:"8px"}}>📧 contact@ayarewadi.in</p>
        <p style={{marginTop:"8px", opacity:0.5, fontSize:"0.75rem"}}>© 2025 Ayarewadi.in · All rights reserved.</p>
      </div>
    </footer>
  );
}