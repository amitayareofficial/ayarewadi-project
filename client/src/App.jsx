import { lazy, Suspense, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "./context/AuthContext.jsx";
import "./App.css";

const Register        = lazy(() => import("./pages/portal/Register.jsx"));
const MemberLogin     = lazy(() => import("./pages/portal/MemberLogin.jsx"));
const MemberDashboard = lazy(() => import("./pages/portal/MemberDashboard.jsx"));
const ForgotPassword  = lazy(() => import("./pages/portal/ForgotPassword.jsx"));
const Admin           = lazy(() => import("./pages/Admin.jsx"));
const Blog_Page       = lazy(() => import("./pages/Blog.jsx"));
const Gallery_Page    = lazy(() => import("./pages/Gallery.jsx"));
import logoImg        from "./assets/images/ayarewadi-logo.png";
import { CinematicFooter } from "./components/ui/motion-footer";
import { TimelineContent } from "./components/ui/timeline-animation.jsx";
import heroImg        from "./assets/images/main_image_home.png";
import emergencyImg   from "./assets/images/emergency.png";
import eventsImg      from "./assets/images/news.png";
import galleryImg     from "./assets/images/gallery.png";
import portalImg      from "./assets/images/portal.png";
import templeImg      from "./assets/images/ravalnath_temple.png";
import villageInfoImg from "./assets/images/village_info_iamge.png";

const API = "https://ayarewadi-project.onrender.com";

const IMG = {
  hero:       heroImg,
  temple:     templeImg,
  templeReno: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=721,fit=crop,trim=165.20076481835565;0;479.08221797323137;0/YNq2a76xB3Ip7LZZ/img_20231008_171637-AMq8ka5gQ9T49MZn.jpg",
  busStand:   "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=721,fit=crop,trim=296.7117988394584;74.3175965665236;373.15280464216636;0/YNq2a76xB3Ip7LZZ/whatsapp-image-2025-06-07-at-7.06.56-pm-mePJZ51Bekfgav0a.jpeg",
  sports:     "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,h=721,fit=crop,trim=0;83.42158859470469;0;329.5152749490835/YNq2a76xB3Ip7LZZ/whatsapp-image-2025-08-10-at-1.24.58-am-mjEGa20ZkvuNlzg6.jpeg",
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
  logo:       logoImg,
};

/* ═══════════════════════════════════════════════════════════
   TRANSLATIONS  — add keys here to translate any new section
═══════════════════════════════════════════════════════════ */
const LANG = {
  en: {
    nav: {
      home: "Home", emergency: "Emergency", portal: "Portal",
      gallery: "Gallery", events: "Events", blog: "Blog", admin: "⚙️ Admin",
    },
    hero: {
      eyebrow: "Sindhudurg · Vaibhavwadi · Konkan · Maharashtra",
      tagline: '"One village, one identity, one bond – Ayarewadi!"',
    },
    marquee: {
      label: "Thoughts",
      slogans: [
        "Our village, our responsibility",
        "Clean village, proud village",
        "Development through unity",
        "Educated village, developed village",
        "Conserve water, sustain life",
        "A beautiful village blooms through unity",
        "We grow together, we rise together",
        "Our roots run deep — our future runs far",
      ],
    },
    services: {
      eyebrow: "Explore",
      title: "Village Services",
      subtitle: "Everything you need from Ayarewadi — always at your fingertips.",
      tiles: [
        { label: "Emergency", sub: "Hospitals & emergency contacts", tag: "Help & Safety" },
        { label: "Events",    sub: "Upcoming village programs",      tag: "Stay Updated"  },
        { label: "Gallery",   sub: "Village photo memories",         tag: "Photos"        },
        { label: "Portal",    sub: "Family tree & village budget",   tag: "Members Only"  },
      ],
    },
    vd: {
      eyebrow: "Our Village",
      title: "Ayarewadi", titleAccent: "Village",
      chips: ["📍 Mangavli", "🏛️ Vaibhavwadi", "🗺️ Sindhudurg", "🇮🇳 Maharashtra"],
      desc: "Nestled in the lush Konkan hills of Sindhudurg district, Ayarewadi is a close-knit village where tradition runs deep and nature surrounds every home. Marathi and Konkani are spoken here, and a shared faith in Shri Dev Ravalnath binds the community across generations. Neighbouring villages include Uple, Kolpe, Netal, and Echet.",
      stats: [
        { icon: "👥", val: "1,264", label: "Population"    },
        { icon: "📚", val: "69%",   label: "Literacy Rate" },
        { icon: "⚖️", val: "1,175", label: "Sex Ratio"     },
        { icon: "🏘️", val: "280+",  label: "Households"    },
      ],
      transport: [
        { icon: "🚉", strong: "Railway Station", p: "Vaibhavwadi Road (Nearby)" },
        { icon: "🛣️", strong: "Highway",         p: "NH‑166E · NH‑748"          },
      ],
      badge: "🛕 Shri Dev Ravalnath Temple · Ayarewadi",
      cta: "📸 View Village Photos →",
    },
    rt: {
      eyebrow: "Village Deity",
      sub: "Shri Dev",
      main: "Ravalnath Temple",
      caption: "🛕 Shri Dev Ravalnath Temple · Ayarewadi",
      tags: ["🏛️ Ancient Temple", "🔱 Village Deity", "🎉 Annual Jatra", "🙏 South Konkan"],
    },
    initiatives: {
      eyebrow: "Village Work",
      title: "Initiatives by Members",
      items: [
        { title: "Temple Renovation",    sub: "New stone flooring, expanded sanctum & prayer hall at the historic Ravalnath temple" },
        { title: "Bus Stand Sign Board", sub: "Designed and installed a landmark directional board at the village entry point"       },
        { title: "Organizing Sports",    sub: "Annual cricket & athletics tournament bringing together youth from Ayarewadi and beyond" },
      ],
    },
    festivals: { eyebrow: "Festivals", title: "🔱 Festivals in Ayarewadi" },
    eventsPreview: { eyebrow: "What's On", title: "Upcoming Events", btn: "All Events →" },
    team: {
      eyebrow: "Our Team",
      title: "Gram Committee",
      subtitle: "Ayarewadi Gram Panchayat — Dedicated leaders serving our village with pride and transparency.",
    },
    join: {
      eyebrow: "Community",
      title: "Stay Connected With Us",
      para: "Be part of the Ayarewadi community — receive updates on festivals, village decisions, and important news directly on WhatsApp. Wherever you live, the village stays close.",
      wa: "WhatsApp Group",
    },
    footer: {
      village: "Village", emergency: "Emergency", contact: "Contact",
      home: "Home", eventsNews: "Events & News", gallery: "Gallery",
      portal: "Member Portal", hospitals: "Hospitals",
      copy: "© 2026 Ayarewadi.in · All rights reserved",
    },
    emergency: {
      eyebrow: "Help & Safety",
      title: "🚨 Emergency Contacts",
      nearby: "Nearby Hospitals",
      tollfree: "🚑 Toll-Free Numbers",
      other: "Other Helplines",
      police: "Police:", fire: "Fire:", women: "Women Helpline:", child: "Child Helpline:",
      freeAmb: "Free emergency ambulance",
      ambHelp: "Ambulance helpline",
      district: "Sindhudurg:",
      alertFreeAmb: "Free Ambulance",
      alertHelpline: "Ambulance Helpline",
      alertDistrict: "Sindhudurg",
    },
    portal: {
      title: "Member Login", subtitle: "Village Member Login",
      idLabel: "Member ID", passLabel: "Password",
      loginBtn: "Login | प्रवेश करा",
      demo: "Demo: AYR001 / village",
      family: "👨‍👩‍👧‍👦 Family Tree",
      budget: "💰 Village Budget",
      balance: "💰 Current Balance",
      logout: "Logout | बाहेर पडा",
      welcome: "👤 Welcome —",
      household: "Family", houseNo: "House No.",
    },
    gallery: {
      eyebrow: "Memories",
      title: "Village Gallery | गाव फोटो",
      search: "Search photos...",
      empty: "No photos match",
    },
    events: {
      eyebrow: "Stay Updated",
      title: "📅 News & Events | बातम्या व कार्यक्रम",
      noticeTitle: "📢 Notice Board | सूचना फलक",
    },
  },

  mr: {
    nav: {
      home: "मुख्यपान", emergency: "आपत्कालीन", portal: "पोर्टल",
      gallery: "गॅलरी", events: "कार्यक्रम", blog: "ब्लॉग", admin: "⚙️ व्यवस्थापन",
    },
    hero: {
      eyebrow: "सिंधुदुर्ग · वैभववाडी · कोकण · महाराष्ट्र",
      tagline: '"एक गाव, एक ओळख, एक नातं – आयरेवाडी!"',
    },
    marquee: {
      label: "सुविचार",
      slogans: [
        "आपलं गाव, आपली जबाबदारी",
        "स्वच्छ गाव, अभिमानी गाव",
        "एकतेतून गावाचा विकास",
        "शिक्षित गाव, विकसित गाव",
        "पाणी अडवा, जीवन वाचवा",
        "एकजुटीतून घडेल सुंदर गाव",
        "एकत्र वाढूया, एकत्र उगवूया",
        "आमची मुळे खोल — आमचे भविष्य दूर",
      ],
    },
    services: {
      eyebrow: "Explore",
      title: "ग्राम सेवा",
      subtitle: "आयरेवाडीतील सर्व सेवा — नेहमी तुमच्या हाताशी.",
      tiles: [
        { label: "आपत्कालीन", sub: "रुग्णालये व आपत्कालीन संपर्क", tag: "मदत व सुरक्षा" },
        { label: "कार्यक्रम", sub: "येणारे गाव कार्यक्रम",          tag: "अद्ययावत राहा" },
        { label: "गॅलरी",    sub: "गावाच्या फोटो आठवणी",            tag: "फोटो" },
        { label: "पोर्टल",   sub: "कुटुंब वृक्ष व गाव अर्थसंकल्प", tag: "सभासद फक्त"   },
      ],
    },
    vd: {
      eyebrow: "आमचं गाव · Our Village",
      title: "आयरेवाडी", titleAccent: "गाव",
      chips: ["📍 मांगवली", "🏛️ वैभववाडी", "🗺️ सिंधुदुर्ग", "🇮🇳 महाराष्ट्र"],
      desc: "सिंधुदुर्ग जिल्ह्यातील हिरव्यागार कोकण डोंगरांमध्ये वसलेले आयरेवाडी हे एक घट्ट विणलेले गाव आहे — जिथे परंपरा खोलवर रुजलेली आहे आणि श्री देव रवळनाथावरील श्रद्धा पिढ्यानपिढ्या समाजाला एकत्र बांधते. येथे मराठी व कोकणी भाषा बोलल्या जातात. शेजारची गावे — उपले, कोळपे, नेटल आणि एचेट.",
      stats: [
        { icon: "👥", val: "1,264", label: "लोकसंख्या"    },
        { icon: "📚", val: "69%",   label: "साक्षरता दर"   },
        { icon: "⚖️", val: "1,175", label: " गुणोत्तर"  },
        { icon: "🏘️", val: "280+",  label: "कुटुंबे"       },
      ],
      transport: [
        { icon: "🚉", strong: "रेल्वे स्टेशन", p: "वैभववाडी रोड (जवळ)" },
        { icon: "🛣️", strong: "महामार्ग",      p: "NH‑166E · NH‑748"   },
      ],
      badge: "आयरेवाडी",
      cta: "📸 गाव फोटो पाहा →",
    },
    rt: {
      eyebrow: "ग्रामदैवत · Village Deity",
      sub: "श्री देव",
      main: "रवळनाथ मंदिर",
      caption: "🛕 श्री देव रवळनाथ मंदिर · आयरेवाडी",
      tags: ["🏛️ प्राचीन मंदिर", "🔱 ग्रामदैवत", "🎉 वार्षिक जत्रा", "🙏 दक्षिण कोकण"],
    },
    initiatives: {
      eyebrow: "गाव काम",
      title: "सभासदांचे उपक्रम",
      items: [
        { title: "मंदिर नूतनीकरण",     sub: "ऐतिहासिक रवळनाथ मंदिरात नवीन दगडी फरश, विस्तारित सभामंडप व गाभारा नूतनीकरण" },
        { title: "बस स्टँड साइनबोर्ड", sub: "गावाच्या प्रवेशद्वारावर नवीन दिशादर्शक साइनबोर्ड डिझाइन व उभारणी"             },
        { title: "क्रीडा आयोजन",       sub: "आयरेवाडी व शेजारच्या गावातील युवकांसाठी वार्षिक क्रिकेट व क्रीडा स्पर्धा"     },
      ],
    },
    festivals: { eyebrow: "उत्सव", title: "🔱 आयरेवाडीतील उत्सव" },
    eventsPreview: { eyebrow: "काय चालू आहे", title: "येणारे कार्यक्रम", btn: "सर्व कार्यक्रम →" },
    team: {
      eyebrow: "आमचा संघ",
      title: "ग्राम समिती",
      subtitle: "आयरेवाडी ग्रामपंचायत — अभिमान आणि पारदर्शकतेने गावाची सेवा करणारे समर्पित नेते.",
    },
    join: {
      eyebrow: "समुदाय",
      title: "जोडले राहा आमच्याशी",
      para: "आयरेवाडी समुदायाचा भाग व्हा — उत्सव, गाव निर्णय आणि महत्त्वाच्या बातम्या थेट WhatsApp वर मिळवा. आपण कुठेही असलात तरी, गाव नेहमी जवळ राहते.",
      wa: "WhatsApp ग्रुप",
    },
    footer: {
      village: "गाव", emergency: "आपत्कालीन", contact: "संपर्क",
      home: "मुख्यपान", eventsNews: "कार्यक्रम व बातम्या", gallery: "गॅलरी",
      portal: "सभासद पोर्टल", hospitals: "रुग्णालये",
      copy: "© 2026 Ayarewadi.in · सर्व हक्क राखीव",
    },
    emergency: {
      eyebrow: "मदत व सुरक्षा",
      title: "🚨 आपत्कालीन संपर्क",
      nearby: "जवळची रुग्णालये",
      tollfree: "🚑 टोल-फ्री नंबर",
      other: "इतर हेल्पलाइन",
      police: "पोलीस:", fire: "अग्निशमन:", women: "महिला हेल्पलाइन:", child: "बाल हेल्पलाइन:",
      freeAmb: "मोफत आपत्कालीन रुग्णवाहिका",
      ambHelp: "रुग्णवाहिका हेल्पलाइन",
      district: "सिंधुदुर्ग:",
      alertFreeAmb: "मोफत रुग्णवाहिका",
      alertHelpline: "रुग्णवाहिका हेल्पलाइन",
      alertDistrict: "सिंधुदुर्ग",
    },
    portal: {
      title: "सभासद लॉगिन", subtitle: "ग्राम सदस्य लॉगिन",
      idLabel: "सभासद ID", passLabel: "पासवर्ड",
      loginBtn: "प्रवेश करा",
      demo: "डेमो: AYR001 / village",
      family: "👨‍👩‍👧‍👦 कुटुंब वृक्ष",
      budget: "💰 गावाचा अर्थसंकल्प",
      balance: "💰 शिल्लक",
      logout: "बाहेर पडा",
      welcome: "👤 स्वागत —",
      household: "कुटुंब", houseNo: "घर क्र.",
    },
    gallery: {
      eyebrow: "आठवणी",
      title: "गाव फोटो | Village Gallery",
      search: "फोटो शोधा...",
      empty: "कोणतेही फोटो सापडले नाहीत",
    },
    events: {
      eyebrow: "अद्ययावत राहा",
      title: "📅 बातम्या व कार्यक्रम | News & Events",
      noticeTitle: "📢 सूचना फलक | Notice Board",
    },
  },
};

/* ═══════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [section, setSection]   = useState("home");
  const [events, setEvents]     = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang]         = useState("mr");

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
      <Navigation_Bar
        section={section} nav={nav}
        menuOpen={menuOpen} setMenuOpen={setMenuOpen}
        lang={lang} setLang={setLang}
      />
      <main id="main-content">
        <Suspense fallback={<div style={{ padding: "4rem", textAlign: "center", color: "#2e7d32" }}>Loading...</div>}>
          {section === "home"      && <Home_Page nav={nav} events={events} lang={lang} />}
          {section === "emergency" && <Emergency_Page lang={lang} />}
          {section === "portal"    && <Portal_Page lang={lang} />}
          {section === "gallery"   && <Gallery_Page lang={lang} />}
          {section === "events"    && <Events_Page events={events} lang={lang} />}
          {section === "blog"      && <Blog_Page />}
          {section === "admin"     && <Admin />}
        </Suspense>
      </main>
      <CinematicFooter nav={nav} lang={lang} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════ */
function Navigation_Bar({ section, nav, menuOpen, setMenuOpen, lang, setLang }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const t = LANG[lang].nav;
  const links = [
    { id: "home",      label: t.home      },
    { id: "emergency", label: t.emergency },
    { id: "portal",    label: t.portal    },
    { id: "gallery",   label: t.gallery   },
    { id: "events",    label: t.events    },
    { id: "blog",      label: t.blog      },
    { id: "admin",     label: t.admin     },
  ];

  return (
    <nav className={`navbar ${scrolled || section !== "home" ? "scrolled" : ""}`}>
      <div className="nav-brand" onClick={() => nav("home")}>
        <img src={IMG.logo} alt="Ayarewadi" className="nav-logo" />
      </div>

      <div className="nav-location">
        🌿 सिंधुदुर्ग · वैभववाडी · मांगवली · महाराष्ट्र 🌿
      </div>

      <div className="nav-lang-group">
        <button
          className={`lang-btn ${lang === "en" ? "active" : ""}`}
          onClick={() => setLang("en")}
        >
          English
        </button>
        <button
          className={`lang-btn ${lang === "mr" ? "active" : ""}`}
          onClick={() => setLang("mr")}
        >
          मराठी
        </button>
      </div>

      <div className="nav-actions">
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

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
   HOME PAGE
═══════════════════════════════════════════════════════════ */
function Home_Page({ nav, events, lang }) {
  return (
    <>
      <Hero_Section lang={lang} />
      <Village_Details nav={nav} lang={lang} />
      <Ravalnath_Temple lang={lang} />
      <Village_Services nav={nav} lang={lang} />
      <Member_Initiatives lang={lang} />
      <Village_Festivals lang={lang} />
      {events.length > 0 && <Events_Preview events={events} nav={nav} lang={lang} />}
      <Team_Members lang={lang} />
      <Join_Community lang={lang} />
    </>
  );
}

/* ── HERO ── */
function Hero_Section({ lang }) {
  const t = LANG[lang].hero;
  return (
    <section className="hero">
      <img src={IMG.hero} alt="Ayarewadi Village" className="hero-bg" />
      <div className="hero-overlay" />
      <div className="hero-content hero-content-top">
        <p className="hero-tagline">{t.tagline}</p>
      </div>
      <div className="hero-marquee-bar">
        <Slogan_Marquee lang={lang} />
      </div>
    </section>
  );
}

/* ── MARQUEE ── */
function Slogan_Marquee({ lang }) {
  const t = LANG[lang].marquee;
  const items = [...t.slogans, ...t.slogans];
  return (
    <div className="marquee-wrap slogan-marquee">
      <span className="marquee-label">{t.label}</span>
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

/* ── VILLAGE SERVICES ── */
function Village_Services({ nav, lang }) {
  const t = LANG[lang].services;
  const tilesMeta = [
    { img: emergencyImg, s: "emergency", icon: "🚨" },
    { img: eventsImg,    s: "events",    icon: "🎉" },
    { img: galleryImg,   s: "gallery",   icon: "📸" },
    { img: portalImg,    s: "portal",    icon: "👤" },
  ];
  return (
    <section className="svc-section">
      <div className="svc-inner">
        <div className="svc-header">
          <span className="eyebrow svc-eyebrow">{t.eyebrow}</span>
          <h2 className="svc-title">{t.title}</h2>
          <p className="svc-subtitle">{t.subtitle}</p>
        </div>
        <div className="svc-bento">
          {tilesMeta.map((m, i) => {
            const tile = t.tiles[i];
            return (
              <div
                className={`svc-card svc-card-${i}`} key={m.s}
                onClick={() => nav(m.s)}
                style={{ backgroundImage: `url(${m.img})` }}
              >
                <div className="svc-overlay" />
                <div className="svc-content">
                  <span className="svc-tag">{tile.tag}</span>
                  <div className="svc-glass-panel">
                    <span className="svc-icon">{m.icon}</span>
                    <div className="svc-text">
                      <h3>{tile.label}</h3>
                      <p>{tile.sub}</p>
                    </div>
                    <div className="svc-arrow">→</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── VILLAGE DETAILS ── */
function Village_Details({ nav, lang }) {
  const t = LANG[lang].vd;
  return (
    <section className="vd-section">
      <div className="vd-grid">
        <div className="vd-image-col">
          <div className="vd-img-wrap">
            <img src={villageInfoImg} alt="आयरेवाडी गाव" loading="lazy" />
            <div className="vd-img-badge">
              <span>🏠</span>
              <span>{t.badge}</span>
            </div>
          </div>
        </div>

        <div className="vd-info-col">
          <div className="vd-eyebrow">
            <span className="vd-eyebrow-dot" />
            {t.eyebrow}
          </div>

          <h2 className="vd-title">
            {t.title} <span className="vd-title-accent">{t.titleAccent}</span>
          </h2>

          <div className="vd-location-row">
            {t.chips.map((c, i) => (
              <span className="vd-location-chip" key={i}>{c}</span>
            ))}
          </div>

          <p className="vd-desc">{t.desc}</p>

          <div className="vd-stats-grid">
            {t.stats.map((s, i) => (
              <div className="vd-stat-card" key={i}>
                <span className="vd-stat-icon">{s.icon}</span>
                <strong>{s.val}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>

          <div className="vd-transport-row">
            {t.transport.map((tr, i) => (
              <div className="vd-transport-card" key={i}>
                <span className="vd-transport-icon">{tr.icon}</span>
                <div>
                  <strong>{tr.strong}</strong>
                  <p>{tr.p}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="vd-cta" onClick={() => nav("gallery")}>
            {t.cta}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── RAVALNATH TEMPLE ── */
function Ravalnath_Temple({ lang }) {
  const t = LANG[lang].rt;
  return (
    <section className="rt-section">
      <div className="rt-deco">🕉️</div>

      <div className="rt-container">
        <div className="rt-img-col">
          <div className="rt-img-frame">
            <img src={IMG.temple} alt="श्री देव रवळनाथ मंदिर" loading="lazy" />
            <div className="rt-img-glow" />
          </div>
          <div className="rt-img-caption">
            <span>🛕</span>
            {t.caption}
          </div>
        </div>

        <div className="rt-content-col">
          <span className="rt-eyebrow">{t.eyebrow}</span>

          <div className="rt-heading">
            <span className="rt-heading-sub">{t.sub}</span>
            <span className="rt-heading-main">{t.main}</span>
          </div>

          <div className="rt-rule" />

          <div className="rt-body">
            {lang === "en" ? (
              <>
                <p>Deep in the Konkan hills, the <strong>Ravalnath temple</strong> has stood for centuries — its stone walls worn smooth by generations of hands pressed in prayer. Ravalnath Dev is Ayarewadi's <strong>Gramdevata</strong>, the divine guardian of homes, fields, and the community that gathers beneath his gaze.</p>
                <p>Revered as a fierce form of <strong>Lord Shiva</strong>, he carries a sword and trident — symbols of protection, not threat. Konkan folklore holds that where Ravalnath watches, no evil lingers. His presence is felt not only in the temple but in every field boundary and village path.</p>
                <p>Once a year, the <strong>Ravalnath Jatra</strong> transforms the village. Drums echo off the hills, oil lamps crowd the sanctum, and devotees arrive from villages near and far. For one charged day, Ayarewadi is the centre of the world — and everyone who was ever from here finds their way back.</p>
              </>
            ) : (
              <>
                <p>कोकणाच्या डोंगरांच्या कुशीत, <strong>रवळनाथ मंदिर</strong> शतकानुशतके उभे आहे — त्याच्या दगडी भिंती पिढ्यानपिढ्यांच्या प्रार्थनेने गुळगुळीत झाल्या आहेत. रवळनाथ देव हे आयरेवाडीचे <strong>ग्रामदैवत</strong> — घरांचे, शेताचे आणि त्यांच्या दृष्टीखाली एकत्र येणाऱ्या समाजाचे दैवी रक्षणकर्ते.</p>
                <p><strong>भगवान शिवाचे</strong> उग्र रूप मानले जाणारे, ते हातात तलवार आणि त्रिशूल धारण करतात — संरक्षणाची प्रतीकं. कोकणातील लोकश्रद्धा सांगते की जिथे रवळनाथ पाहतात, तिथे वाईटाला थारा नाही. त्यांचं अस्तित्व केवळ मंदिरातच नाही — प्रत्येक शेताच्या बांधावर आणि गावाच्या वाटेवर जाणवतं.</p>
                <p>वर्षातून एकदा <strong>रवळनाथ जत्रा</strong> गावाला वेगळ्याच रूपात न्हाऊन टाकते. ढोल-ताशांचा आवाज डोंगरांमध्ये घुमतो, मंदिरात दिव्यांची रांग उजळते, आणि आसपासच्या गावांतून भक्त येतात. एका दिवसासाठी आयरेवाडी जगाचं केंद्र बनतं — आणि इथले प्रत्येक जण, कुठेही असला तरी, घरी परततो.</p>
              </>
            )}
          </div>

          <blockquote className="rt-blockquote">
            {lang === "en"
              ? <>"For us, Ravalnath Dev is not just a deity, but the{" "}<strong>pride and strength of our village.</strong>"</>
              : <>"आमच्यासाठी रवळनाथ देव म्हणजे केवळ देव नाही, तर{" "}<strong>गावाचा अभिमान आणि बळ आहे.</strong>"</>
            }
          </blockquote>

          <div className="rt-tags">
            {t.tags.map((tag, i) => (
              <span className="rt-tag" key={i}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── MEMBER INITIATIVES ── */
function Member_Initiatives({ lang }) {
  const t = LANG[lang].initiatives;
  const imgs = [IMG.templeReno, IMG.busStand, IMG.sports];
  return (
    <section className="initiatives-section">
      <div className="sec-header">
        <span className="eyebrow">{t.eyebrow}</span>
        <h2>{t.title}</h2>
      </div>
      <div className="init-grid">
        {t.items.map((e, i) => (
          <div className="init-card" key={i}>
            <div className="init-img-wrap">
              <img src={imgs[i]} alt={e.title} loading="lazy" />
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

/* ── FESTIVALS ── */
function Village_Festivals({ lang }) {
  const t = LANG[lang].festivals;
  return (
    <section className="page-section">
      <div className="sec-header">
        <span className="eyebrow">{t.eyebrow}</span>
        <h2>{t.title}</h2>
      </div>
      <div className="festival-grid">
        {[IMG.festival1, IMG.festival2, IMG.festival3].map((src, i) => (
          <div className="festival-img" key={i}>
            <img src={src} alt={`Festival ${i + 1}`} loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── EVENTS PREVIEW ── */
function Events_Preview({ events, nav, lang }) {
  const t = LANG[lang].eventsPreview;
  return (
    <section className="page-section events-preview-section">
      <div className="sec-header">
        <span className="eyebrow">{t.eyebrow}</span>
        <h2>{t.title}</h2>
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
      <button className="btn-accent-sm" onClick={() => nav("events")}>
        {t.btn}
      </button>
    </section>
  );
}

/* ── TEAM MEMBERS ── */
function Team_Members({ lang }) {
  const t = LANG[lang].team;
  const team = [
    {
      name: "Bhalchandra Ayare",
      roleMr: "अध्यक्ष", roleEn: "President",
      initials: "BA",
      gradient: "linear-gradient(135deg, #0d5c30 0%, #1aad5c 100%)",
      quote: "आयरेवाडी गावाचा विकास हे आमचे ध्येय. प्रत्येक निर्णय गावाच्या भविष्यासाठी घेतो.",
      quoteEn: "Ayarewadi's growth is our purpose. Every decision we make is for the village's future.",
    },
    {
      name: "Anant Ayare",
      roleMr: "सचिव", roleEn: "Secretary",
      initials: "AA",
      gradient: "linear-gradient(135deg, #0d3d5c 0%, #1a7db8 100%)",
      quote: "गावाचे सर्व उपक्रम व्यवस्थित चालावेत यासाठी सतत प्रयत्नशील असतो.",
      quoteEn: "I work to keep every village initiative running smoothly — no task too small.",
    },
    {
      name: "Pawan Ayare",
      roleMr: "खजिनदार", roleEn: "Treasurer",
      initials: "PA",
      gradient: "linear-gradient(135deg, #5c200d 0%, #b84020 100%)",
      quote: "गावाचा प्रत्येक पैसा योग्य कामी लागावा यासाठी पारदर्शकतेने काम करतो.",
      quoteEn: "Every rupee the village earns must serve the village. I work with full transparency.",
    },
    {
      name: "Amit Ayare",
      roleMr: "सभासद", roleEn: "Member",
      initials: "AA",
      gradient: "linear-gradient(135deg, #3a0d5c 0%, #7a2db8 100%)",
      quote: "गावातील युवापिढीसाठी नवीन संधी निर्माण करणे हे आमचे स्वप्न आहे.",
      quoteEn: "My dream is to create new opportunities for the youth of Ayarewadi.",
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
      <div className="team-marquee">
        <div className="team-marquee-inner">
          {marqueeItems.map((m, i) => (
            <span key={i} className="team-marquee-item">
              <span className="team-marquee-name">{m.name}</span>
              <span className="team-marquee-badge">
                {lang === "mr" ? m.roleMr : m.roleEn}
              </span>
              <span className="team-marquee-sep">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="team-header">
        <span className="eyebrow team-eyebrow">{t.eyebrow}</span>
        <h2 className="team-title">{t.title}</h2>
        <p className="team-subtitle">{t.subtitle}</p>
      </div>

      <div className="team-grid">
        {team.map((m, i) => (
          <div className="team-card" key={i}>
            <div className="team-avatar" style={{ background: m.gradient }}>
              {m.initials}
            </div>
            <div className="team-name">{m.name}</div>
            <div className="team-role-mr">{lang === "mr" ? m.roleMr : m.roleEn}</div>
            <div className="team-role-en">{lang === "mr" ? m.roleEn : m.roleMr}</div>
            <div className="team-divider" />
            <p className="team-quote">"{lang === "mr" ? m.quote : m.quoteEn}"</p>
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

/* ── JOIN COMMUNITY ── */
function Join_Community({ lang }) {
  const t = LANG[lang].join;
  return (
    <section className="join-section">
      <div className="join-content">
        <span className="eyebrow join-eyebrow">{t.eyebrow}</span>
        <h2>{t.title}</h2>
        <p>{t.para}</p>
        <div className="join-btns">
          <a href="https://wa.me/918149822015" target="_blank" rel="noreferrer" className="btn-whatsapp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {t.wa}
          </a>
          <a href="mailto:contact@ayarewadi.in" className="btn-email">
            contact@ayarewadi.in
          </a>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   EMERGENCY PAGE
═══════════════════════════════════════════════════════════ */
function Emergency_Page({ lang }) {
  const t = LANG[lang].emergency;
  const sectionRef = useRef(null);

  const revealVariants = {
    visible: (i) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { delay: i * 0.15, duration: 0.45 },
    }),
    hidden: {
      filter: "blur(8px)",
      y: 18,
      opacity: 0,
    },
  };

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
    <section ref={sectionRef} className="page-section">

      <TimelineContent animationNum={1} timelineRef={sectionRef} customVariants={revealVariants} once>
        <div className="sec-header">
          <span className="eyebrow">{t.eyebrow}</span>
          <h2>{t.title}</h2>
        </div>
      </TimelineContent>

      <TimelineContent animationNum={2} timelineRef={sectionRef} customVariants={revealVariants} once>
        <div className="alert-banner">
          ⚠️ &nbsp;
          <strong>108</strong> – {t.alertFreeAmb} &nbsp;|&nbsp;
          <strong>102</strong> – {t.alertHelpline} &nbsp;|&nbsp;
          {t.alertDistrict}: <strong>8149822015</strong> / <strong>7030397514</strong>
        </div>
      </TimelineContent>

      <TimelineContent animationNum={3} timelineRef={sectionRef} customVariants={revealVariants} once>
        <h3 className="sub-title">{t.nearby}</h3>
      </TimelineContent>

      <div className="hosp-cards">
        {hospitals.map((h, index) => (
          <TimelineContent
            key={h.name}
            animationNum={4 + index}
            timelineRef={sectionRef}
            customVariants={revealVariants}
            once
          >
            <div className="hosp-card">
              <img src={h.img} alt={h.name} loading="lazy" />
              <div className="hosp-body">
                <h3>{h.name}</h3>
                <div className="tags">{h.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div>
                <p>{h.addr}</p>
                {h.phone && (
                  <a href={`tel:${h.phone}`} className="btn-call">
                    📞 {h.phone}
                  </a>
                )}
              </div>
            </div>
          </TimelineContent>
        ))}
      </div>

      <TimelineContent animationNum={7} timelineRef={sectionRef} customVariants={revealVariants} once>
        <div className="hosp-card ambulance-card">
          <img src={IMG.ambulance} alt="Ambulance" className="ambulance-img" />
          <div className="ambulance-body">
            <h3>{t.tollfree}</h3>
            <p><strong>108</strong> — {t.freeAmb}</p>
            <p><strong>102</strong> — {t.ambHelp}</p>
            <p><strong>{t.district}</strong> 8149822015 / 7030397514</p>
          </div>
        </div>
      </TimelineContent>

      <TimelineContent animationNum={8} timelineRef={sectionRef} customVariants={revealVariants} once>
        <div className="info-card">
          <h3>{t.other}</h3>
          <ul>
            <li>{t.police} <strong>100</strong></li>
            <li>{t.fire} <strong>101</strong></li>
            <li>{t.women} <strong>1091</strong></li>
            <li>{t.child} <strong>1098</strong></li>
            <li>Email: <strong>contact@ayarewadi.in</strong></li>
          </ul>
        </div>
      </TimelineContent>

    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PORTAL — Member Authentication System
═══════════════════════════════════════════════════════════ */
function Portal_Page({ lang }) {
  const { member, loading } = useAuth();
  const [view, setView] = useState("login"); // login | register | forgot

  if (loading) return (
    <section className="page-section center-section">
      <div style={{ textAlign: "center", padding: "3rem", color: "#2e7d32", fontSize: "1.1rem" }}>
        Loading...
      </div>
    </section>
  );

  if (member) return (
    <Suspense fallback={<div style={{ padding: "4rem", textAlign: "center", color: "#2e7d32" }}>Loading...</div>}>
      <MemberDashboard />
    </Suspense>
  );

  return (
    <div style={{ marginTop: "-1px" }}>
      <Suspense fallback={<div style={{ padding: "4rem", textAlign: "center", color: "#2e7d32" }}>Loading...</div>}>
        {view === "login"    && <MemberLogin lang={lang} onGoRegister={() => setView("register")} onGoForgot={() => setView("forgot")} onLoginSuccess={() => {}} />}
        {view === "register" && <Register    lang={lang} onGoLogin={() => setView("login")} />}
        {view === "forgot"   && <ForgotPassword onGoBack={() => setView("login")} />}
      </Suspense>
    </div>
  );
}

/* Gallery_Page lives in ./pages/Gallery.jsx */

/* ═══════════════════════════════════════════════════════════
   EVENTS PAGE
═══════════════════════════════════════════════════════════ */
function Events_Page({ events, lang }) {
  const t = LANG[lang].events;
  const fallback = [
    { id: 1, title: "रवळनाथ जत्रा",               description: "Annual Ravalnath Jatra — ढोल-ताशांचा गजर, मिरवणुका, आणि भक्तांचा उत्साह.", date: "2026-11-15", tag: "Festival" },
    { id: 2, title: "Gram Sabha | ग्रामसभा",       description: "Village development meeting — all residents welcome. Budget review & upcoming works.", date: "2026-06-20", tag: "Meeting" },
    { id: 3, title: "Cricket Tournament | क्रिकेट", description: "Inter-village cricket with teams from Ayarewadi, Uple, Kolpe & Netal.", date: "2026-07-10", tag: "Sports" },
    { id: 4, title: "Ganeshotsav | गणेशोत्सव",    description: "10-day Ganesh festival with cultural programs, processions & community prasad.", date: "2026-08-22", tag: "Festival" },
  ];
  const list = events.length > 0 ? events : fallback;

  return (
    <section className="page-section">
      <div className="sec-header">
        <span className="eyebrow">{t.eyebrow}</span>
        <h2>{t.title}</h2>
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

      <div className="info-card">
        <h3>{t.noticeTitle}</h3>
        <ul>
          <li>Village tax deadline: <strong>30 June 2026</strong> — pay at Gram Panchayat office</li>
          <li>Ration card updates: Apply before <strong>15 June 2026</strong></li>
          <li>Contact & feedback: <strong>contact@ayarewadi.in</strong></li>
        </ul>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════ */
function Footer_Section({ nav, lang }) {
  const t = LANG[lang].footer;
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src={IMG.logo} alt="Ayarewadi" className="footer-logo" />
          <p>आयरेवाडी (मांगवली) · वैभववाडी<br />सिंधुदुर्ग · महाराष्ट्र</p>
          <p className="footer-tagline">"एक गाव, एक ओळख, एक नातं"</p>
        </div>

        <div className="footer-col">
          <h4>{t.village}</h4>
          <ul>
            <li><button onClick={() => nav("home")}>{t.home}</button></li>
            <li><button onClick={() => nav("events")}>{t.eventsNews}</button></li>
            <li><button onClick={() => nav("gallery")}>{t.gallery}</button></li>
            <li><button onClick={() => nav("portal")}>{t.portal}</button></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{t.emergency}</h4>
          <ul>
            <li><button onClick={() => nav("emergency")}>{t.hospitals}</button></li>
            <li><a href="tel:108">108 — Free Ambulance</a></li>
            <li><a href="tel:100">100 — Police</a></li>
            <li><a href="tel:101">101 — Fire Brigade</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{t.contact}</h4>
          <ul>
            <li>contact@ayarewadi.in</li>
            <li>Vaibhavwadi, Sindhudurg</li>
            <li>Maharashtra — 416810</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{t.copy}</p>
      </div>
    </footer>
  );
}
