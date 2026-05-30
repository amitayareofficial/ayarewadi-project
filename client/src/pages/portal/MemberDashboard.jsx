import { useState, lazy, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";

const MyFamilyInfo = lazy(() => import("./MyFamilyInfo"));
const BalanceSheet = lazy(() => import("./BalanceSheet"));
const FamilyTree   = lazy(() => import("./FamilyTree"));

const LOADING = <div style={{ padding: "3rem", textAlign: "center", color: "#2e7d32", fontSize: "1rem" }}>Loading...</div>;

const CARDS = [
  {
    id:    "family",
    icon:  "👤",
    title: "My Family Information",
    mr:    "माझी कुटुंब माहिती",
    desc:  "Submit and manage your family details for the village tree.",
    mrDesc:"कुटुंबाची माहिती सादर करा व व्यवस्थापित करा.",
    bg:    "linear-gradient(135deg, #1b5e20 0%, #43a047 100%)",
    light: "#e8f5e9",
    border:"#a5d6a7",
  },
  {
    id:    "balance",
    icon:  "💰",
    title: "Village Balance Sheet",
    mr:    "गाव अर्थसंकल्प",
    desc:  "View village finances — income, expenses, and balance by year.",
    mrDesc:"गावाचे उत्पन्न, खर्च आणि शिल्लक वर्षानुसार पाहा.",
    bg:    "linear-gradient(135deg, #e65100 0%, #ff9800 100%)",
    light: "#fff3e0",
    border:"#ffcc80",
  },
  {
    id:    "tree",
    icon:  "🌳",
    title: "Village Family Tree",
    mr:    "गाव कुटुंब वृक्ष",
    desc:  "Explore the complete village family tree — search and browse.",
    mrDesc:"संपूर्ण गाव कुटुंब वृक्ष शोधा व पाहा.",
    bg:    "linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)",
    light: "#e3f2fd",
    border:"#90caf9",
  },
];

export default function MemberDashboard() {
  const { member, logout } = useAuth();
  const [active, setActive] = useState(null);

  if (!member) return null;

  const dob = member.dob
    ? new Date(member.dob).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  if (active === "family") return (
    <Suspense fallback={LOADING}>
      <MyFamilyInfo member={member} onBack={() => setActive(null)} />
    </Suspense>
  );
  if (active === "balance") return (
    <Suspense fallback={LOADING}>
      <BalanceSheet onBack={() => setActive(null)} />
    </Suspense>
  );
  if (active === "tree") return (
    <Suspense fallback={LOADING}>
      <FamilyTree onBack={() => setActive(null)} />
    </Suspense>
  );

  return (
    <div style={s.wrap}>

      {/* Profile header */}
      <div style={s.profileCard}>
        <div style={s.avatarWrap}>
          {member.photo_url
            ? <img src={member.photo_url} alt={member.full_name} style={s.avatar} />
            : <div style={s.avatarFallback}>{member.full_name?.charAt(0)?.toUpperCase()}</div>
          }
          <div style={s.approvedDot} title="Approved Member">✓</div>
        </div>

        <div style={s.profileInfo}>
          <h2 style={s.name}>{member.full_name}</h2>
          {member.nickname && <p style={s.nickname}>"{member.nickname}"</p>}
          <span style={s.badge}>✅ Approved Member · Ayarewadi</span>
          <div style={s.metaRow}>
            <span>📞 {member.mobile}</span>
            {member.dob && <span>📅 {dob}</span>}
          </div>
        </div>

        <button style={s.logoutBtn} onClick={logout} title="Logout">
          🚪
        </button>
      </div>

      {/* Welcome banner */}
      <div style={s.welcomeBanner}>
        <div style={s.welcomeInner}>
          <span style={{ fontSize: "1.4rem" }}>🏠</span>
          <div>
            <div style={s.welcomeTitle}>आयरेवाडी ग्राम पोर्टल</div>
            <div style={s.welcomeSub}>मांगवली · वैभववाडी · सिंधुदुर्ग · महाराष्ट्र</div>
          </div>
        </div>
      </div>

      {/* 3 Main Cards */}
      <div style={s.sectionLabel}>Village Insights · ग्राम माहिती</div>
      <div style={s.cardsGrid}>
        {CARDS.map(card => (
          <button key={card.id} style={s.card} onClick={() => setActive(card.id)}>
            <div style={{ ...s.cardIconWrap, background: card.bg }}>
              <span style={s.cardIcon}>{card.icon}</span>
            </div>
            <div style={s.cardBody}>
              <div style={s.cardTitle}>{card.title}</div>
              <div style={s.cardTitleMr}>{card.mr}</div>
              <div style={s.cardDesc}>{card.desc}</div>
            </div>
            <div style={s.cardArrow}>→</div>
          </button>
        ))}
      </div>

      {/* Footer logout */}
      <button style={s.logoutFull} onClick={logout}>
        🚪 Logout · बाहेर पडा
      </button>
    </div>
  );
}

const s = {
  wrap: {
    maxWidth: 560,
    margin: "0 auto",
    padding: "1.5rem 1rem 3rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  profileCard: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
    padding: "1.25rem 1rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    position: "relative",
  },
  avatarWrap: { position: "relative", flexShrink: 0 },
  avatar: { width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2.5px solid #4caf50" },
  avatarFallback: {
    width: 64, height: 64, borderRadius: "50%",
    background: "linear-gradient(135deg,#2e7d32,#81c784)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.6rem", color: "#fff", fontWeight: 800,
    border: "2.5px solid #4caf50",
  },
  approvedDot: {
    position: "absolute", bottom: 2, right: 2,
    background: "#4caf50", color: "#fff", borderRadius: "50%",
    width: 18, height: 18,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.6rem", fontWeight: 800, border: "2px solid #fff",
  },
  profileInfo: { flex: 1, minWidth: 0 },
  name:        { fontSize: "1.05rem", fontWeight: 800, color: "#1b5e20", margin: "0 0 2px" },
  nickname:    { fontSize: "0.78rem", color: "#888", fontStyle: "italic", margin: "0 0 4px" },
  badge: {
    background: "#e8f5e9", color: "#2e7d32",
    border: "1px solid #c8e6c9", borderRadius: 20,
    padding: "2px 10px", fontSize: "0.68rem", fontWeight: 700,
    display: "inline-block", marginBottom: 6,
  },
  metaRow: { display: "flex", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.75rem", color: "#777" },
  logoutBtn: {
    position: "absolute", top: 12, right: 12,
    background: "none", border: "none",
    fontSize: "1.1rem", cursor: "pointer",
    color: "#aaa", padding: 4,
  },
  welcomeBanner: {
    background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)",
    borderRadius: 14,
    padding: "0.9rem 1.1rem",
    color: "#fff",
  },
  welcomeInner: { display: "flex", alignItems: "center", gap: "0.75rem" },
  welcomeTitle: { fontWeight: 800, fontSize: "0.92rem", marginBottom: 2 },
  welcomeSub:   { fontSize: "0.72rem", opacity: 0.75 },
  sectionLabel: {
    fontSize: "0.72rem", fontWeight: 700,
    color: "#aaa", textTransform: "uppercase",
    letterSpacing: "0.08em", paddingLeft: 2,
  },
  cardsGrid: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  card: {
    background: "#fff",
    border: "1.5px solid #f0f0f0",
    borderRadius: 14,
    padding: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    cursor: "pointer",
    textAlign: "left",
    transition: "box-shadow 0.2s, border-color 0.2s",
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
  },
  cardIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  cardIcon:   { fontSize: "1.5rem" },
  cardBody:   { flex: 1, minWidth: 0 },
  cardTitle:  { fontSize: "0.92rem", fontWeight: 800, color: "#222", marginBottom: 1 },
  cardTitleMr:{ fontSize: "0.78rem", fontWeight: 600, color: "#555", marginBottom: 3 },
  cardDesc:   { fontSize: "0.72rem", color: "#999", lineHeight: 1.4 },
  cardArrow:  { fontSize: "1.2rem", color: "#ccc", flexShrink: 0 },
  logoutFull: {
    width: "100%", background: "#fff",
    border: "2px solid #ef5350", color: "#ef5350",
    padding: "11px", borderRadius: 12,
    fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
    marginTop: "0.5rem",
  },
};
