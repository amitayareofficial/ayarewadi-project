import { ArrowUp, Heart, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import logoImg from "@/assets/images/ayarewadi-logo.png";

function scrollTop() {
  window.scroll({ top: 0, behavior: "smooth" });
}

const NAV = {
  en: [
    {
      name: "Village",
      items: [
        { name: "Home",           section: "home"      },
        { name: "Events & News",  section: "events"    },
        { name: "Gallery",        section: "gallery"   },
        { name: "Member Portal",  section: "portal"    },
        { name: "Blog",           section: "blog"      },
      ],
    },
    {
      name: "Emergency",
      items: [
        { name: "Hospitals",        section: "emergency"              },
        { name: "108 — Ambulance",  href: "tel:108"                   },
        { name: "100 — Police",     href: "tel:100"                   },
        { name: "101 — Fire",       href: "tel:101"                   },
        { name: "1091 — Women",     href: "tel:1091"                  },
      ],
    },
    {
      name: "Contact",
      items: [
        { name: "contact@ayarewadi.in", href: "mailto:contact@ayarewadi.in" },
        { name: "WhatsApp Group",        href: "https://wa.me/918149822015", external: true },
        { name: "Vaibhavwadi, Sindhudurg" },
        { name: "Maharashtra — 416810"   },
        { name: "PIN: 416810"            },
      ],
    },
    {
      name: "About",
      items: [
        { name: "Gram Panchayat" },
        { name: "Shri Dev Ravalnath" },
        { name: "Konkan · Maharashtra" },
        { name: "Sindhudurg District" },
      ],
    },
  ],
  mr: [
    {
      name: "गाव",
      items: [
        { name: "मुख्यपान",          section: "home"    },
        { name: "कार्यक्रम व बातम्या", section: "events"  },
        { name: "गॅलरी",            section: "gallery"  },
        { name: "सभासद पोर्टल",     section: "portal"   },
        { name: "ब्लॉग",            section: "blog"     },
      ],
    },
    {
      name: "आपत्कालीन",
      items: [
        { name: "रुग्णालये",           section: "emergency"           },
        { name: "108 — रुग्णवाहिका",   href: "tel:108"                },
        { name: "100 — पोलीस",         href: "tel:100"                },
        { name: "101 — अग्निशमन",      href: "tel:101"                },
        { name: "1091 — महिला",        href: "tel:1091"               },
      ],
    },
    {
      name: "संपर्क",
      items: [
        { name: "contact@ayarewadi.in", href: "mailto:contact@ayarewadi.in" },
        { name: "WhatsApp ग्रुप",        href: "https://wa.me/918149822015", external: true },
        { name: "वैभववाडी, सिंधुदुर्ग" },
        { name: "महाराष्ट्र — ४१६८१०" },
        { name: "पिन: ४१६८१०"          },
      ],
    },
    {
      name: "आयरेवाडी",
      items: [
        { name: "ग्रामपंचायत"      },
        { name: "श्री देव रवळनाथ" },
        { name: "कोकण · महाराष्ट्र" },
        { name: "सिंधुदुर्ग जिल्हा" },
      ],
    },
  ],
};

const SOCIAL = [
  {
    label:  "WhatsApp",
    href:   "https://wa.me/918149822015",
    icon:   <MessageCircle size={18} />,
    hoverColor: "#25D366",
    external: true,
  },
  {
    label: "Email",
    href:  "mailto:contact@ayarewadi.in",
    icon:  <Mail size={18} />,
  },
  {
    label: "Phone",
    href:  "tel:8149822015",
    icon:  <Phone size={18} />,
  },
  {
    label:    "Map",
    href:     "https://maps.google.com/?q=Ayarewadi,Vaibhavwadi,Sindhudurg,Maharashtra",
    icon:     <MapPin size={18} />,
    external: true,
  },
];

const pill = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  borderRadius: "0.75rem",
  border: "1px dotted rgba(240,244,240,0.2)",
  color: "rgba(240,244,240,0.6)",
  transition: "color 0.2s, border-color 0.2s",
  textDecoration: "none",
  background: "none",
  cursor: "pointer",
  flexShrink: 0,
};

function NavItem({ item, nav }) {
  const base = {
    fontSize: "0.8rem",
    lineHeight: 1.6,
    color: "rgba(240,244,240,0.55)",
    transition: "color 0.2s",
    textDecoration: "none",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "default",
    display: "block",
    textAlign: "left",
  };

  if (item.section) {
    return (
      <button
        style={{ ...base, cursor: "pointer" }}
        onClick={() => nav(item.section)}
        onMouseEnter={e => (e.currentTarget.style.color = "#f0f4f0")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,244,240,0.55)")}
      >
        {item.name}
      </button>
    );
  }
  if (item.href) {
    return (
      <a
        href={item.href}
        style={{ ...base, cursor: "pointer" }}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noreferrer" : undefined}
        onMouseEnter={e => (e.currentTarget.style.color = "#f0f4f0")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,244,240,0.55)")}
      >
        {item.name}
      </a>
    );
  }
  return <span style={base}>{item.name}</span>;
}

export function VillageFooter({ nav, lang = "mr" }) {
  const sections = NAV[lang];
  const copyright =
    lang === "mr"
      ? "© 2026 Ayarewadi.in · सर्व हक्क राखीव"
      : "© 2026 Ayarewadi.in · All rights reserved";
  const madeBy  = lang === "mr" ? "अमित राजू आयरे" : "Amit Raju Ayare";
  const madeWith = lang === "mr" ? "बनवले" : "Made with";
  const madeByLabel = lang === "mr" ? "यांनी" : "by";
  const desc =
    lang === "mr"
      ? "आयरेवाडी (मांगवली) · वैभववाडी · सिंधुदुर्ग · महाराष्ट्र — श्री देव रवळनाथाच्या कृपेने सुखी-समृद्ध गाव."
      : "Ayarewadi (Mangavli) · Vaibhavwadi · Sindhudurg · Maharashtra — A close-knit Konkan village, blessed by Shri Dev Ravalnath.";

  const divider = (
    <div style={{ borderTop: "1px dotted rgba(240,244,240,0.12)", margin: "0" }} />
  );

  return (
    <footer
      style={{
        background: "#0a0f0a",
        color: "#f0f4f0",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* ── Top: logo + description ── */}
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "2.5rem 1.5rem 0",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            paddingBottom: "1.5rem",
          }}
          className="md:flex-row"
        >
          <img
            src={logoImg}
            alt="Ayarewadi"
            style={{ height: "80px", mixBlendMode: "lighten", filter: "brightness(1.1)", flexShrink: 0 }}
          />
          <p
            style={{
              fontSize: "0.75rem",
              lineHeight: 1.7,
              color: "rgba(240,244,240,0.5)",
              textAlign: "center",
              margin: 0,
              maxWidth: "38rem",
            }}
          >
            {desc}
          </p>
        </div>

        {divider}

        {/* ── Nav columns ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "2rem",
            padding: "2rem 0",
          }}
          className="sm:grid-cols-4"
        >
          {sections.map((col) => (
            <div key={col.name}>
              <h4
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(240,244,240,0.35)",
                  marginBottom: "0.75rem",
                  marginTop: 0,
                }}
              >
                {col.name}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {col.items.map((item) => (
                  <li key={item.name}>
                    <NavItem item={item} nav={nav} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {divider}
      </div>

      {/* ── Social icons ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.6rem",
          padding: "1.5rem 1.5rem",
        }}
      >
        {SOCIAL.map((s) => (
          <a
            key={s.label}
            href={s.href}
            aria-label={s.label}
            target={s.external ? "_blank" : undefined}
            rel={s.external ? "noreferrer" : undefined}
            style={pill}
            onMouseEnter={e => {
              e.currentTarget.style.color = s.hoverColor || "#f0f4f0";
              e.currentTarget.style.borderColor = s.hoverColor ? s.hoverColor : "rgba(240,244,240,0.5)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "rgba(240,244,240,0.6)";
              e.currentTarget.style.borderColor = "rgba(240,244,240,0.2)";
            }}
          >
            {s.icon}
          </a>
        ))}

        <button
          onClick={scrollTop}
          aria-label="Back to top"
          style={pill}
          onMouseEnter={e => {
            e.currentTarget.style.color = "#f0f4f0";
            e.currentTarget.style.borderColor = "rgba(240,244,240,0.5)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = "rgba(240,244,240,0.6)";
            e.currentTarget.style.borderColor = "rgba(240,244,240,0.2)";
          }}
        >
          <ArrowUp size={18} />
        </button>
      </div>

      {/* ── Bottom bar ── */}
      <div
        style={{
          borderTop: "1px dotted rgba(240,244,240,0.1)",
          padding: "1rem 1.5rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.4rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            fontSize: "0.72rem",
            color: "rgba(240,244,240,0.4)",
          }}
        >
          <span>{madeWith}</span>
          <Heart size={13} style={{ color: "#e53935" }} />
          <span>{madeByLabel}</span>
          <span style={{ color: "#f0f4f0", fontWeight: 700 }}>{madeBy}</span>
        </div>
        <p
          style={{
            fontSize: "0.62rem",
            color: "rgba(240,244,240,0.25)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {copyright}
        </p>
      </div>
    </footer>
  );
}
