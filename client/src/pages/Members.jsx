import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://ayarewadi-project.onrender.com";

export default function Members_Page({ lang, onPortalClick }) {
  const [members,    setMembers]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeRole, setActiveRole] = useState("All");
  const [query,      setQuery]      = useState("");

  const isMr = lang === "mr";

  useEffect(() => {
    axios.get(`${API}/gram-members`)
      .then(r => setMembers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const roles = ["All", ...new Set(members.map(m => m.role).filter(Boolean))];

  const q       = query.trim().toLowerCase();
  const byRole  = activeRole === "All" ? members : members.filter(m => m.role === activeRole);
  const visible = q
    ? byRole.filter(m =>
        [m.name, m.father_name, m.address, m.mumbai_location, m.bio]
          .some(v => v && v.toLowerCase().includes(q))
      )
    : byRole;

  return (
    <div className="mem-page">

      {/* ── HERO ── */}
      <div className="mem-hero">
        <div className="mem-hero-bg" aria-hidden="true" />
        <div className="mem-hero-inner">
          <span className="mem-eyebrow">{isMr ? "आमचे लोक" : "Our People"}</span>
          <h1 className="mem-title">आयरेवाडी ग्रामविकास मंडळ</h1>
          <p className="mem-subtitle">
            {isMr
              ? "आयरेवाडी गावाचे अभिमानी रहिवासी आणि ग्रामसमिती सदस्य."
              : "The proud residents and committee members of Ayarewadi village."}
          </p>
          <div className="mem-hero-count">
            {!loading && (
              <span>{members.length} {isMr ? "नोंदणीकृत सदस्य" : "registered members"}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── SEARCH + FILTER ── */}
      {!loading && (
        <div className="mem-filter-bar">
          <div className="mem-search-wrap">
            <svg className="mem-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="mem-search-input"
              type="search"
              placeholder={isMr ? "नाव, पत्ता शोधा…" : "Search by name, address…"}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button className="mem-search-clear" onClick={() => setQuery("")} aria-label="Clear">✕</button>
            )}
          </div>

          {roles.length > 1 && (
            <div className="mem-filters">
              {roles.map(r => (
                <button
                  key={r}
                  className={`mem-filter-btn${activeRole === r ? " active" : ""}`}
                  onClick={() => setActiveRole(r)}
                >
                  {r}
                  {r !== "All" && (
                    <span className="mem-filter-count">
                      {members.filter(m => m.role === r).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── GRID ── */}
      <div className="mem-grid-wrap">

        {/* Skeleton */}
        {loading && (
          <div className="mem-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="mem-skeleton" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && visible.length === 0 && (
          <div className="mem-empty">
            <span className="mem-empty-icon">{q ? "🔍" : "👥"}</span>
            <p>
              {q
                ? (isMr ? `"${query}" साठी कोणताही सदस्य सापडला नाही.` : `No members found for "${query}".`)
                : (isMr ? "कोणतेही सदस्य सापडले नाहीत." : "No members found.")}
            </p>
            {(q || activeRole !== "All") && (
              <button className="mem-search-reset" onClick={() => { setQuery(""); setActiveRole("All"); }}>
                {isMr ? "फिल्टर साफ करा" : "Clear filters"}
              </button>
            )}
          </div>
        )}

        {/* Cards */}
        {!loading && visible.length > 0 && (
          <div className="mem-grid">
            {visible.map((m, i) => (
              <MemberCard key={m.id} member={m} index={i} onPortalClick={onPortalClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MemberCard({ member: m, index, onPortalClick }) {
  const initials = m.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  const gradients = [
    "linear-gradient(135deg,#0d5c30,#1aad5c)",
    "linear-gradient(135deg,#0d3d5c,#1a7db8)",
    "linear-gradient(135deg,#5c3d0d,#b88020)",
    "linear-gradient(135deg,#3a0d5c,#7a2db8)",
    "linear-gradient(135deg,#5c0d0d,#b83030)",
    "linear-gradient(135deg,#0d5c4e,#1aad96)",
  ];
  const grad = gradients[index % gradients.length];

  return (
    <div className="mem-card" onClick={onPortalClick} style={{ cursor: "pointer" }}>
      <div className="mem-photo-ring" style={{ "--grad": grad }}>
        {m.photo_url
          ? <img src={m.photo_url} alt={m.name} className="mem-photo" loading="lazy" />
          : <div className="mem-avatar" style={{ background: grad }}>{initials}</div>
        }
      </div>

      <div className="mem-card-body">
        <h3 className="mem-name">{m.name}</h3>
        <div className="mem-badges">
          <span className="mem-role-badge">{m.role || "सदस्य"}</span>
          {m.education && m.education !== "NA" && (
            <span className="mem-edu-badge">🎓 {m.education}</span>
          )}
        </div>
        {m.father_name && <p className="mem-father">वडील: {m.father_name}</p>}
        {m.address && (
          <p className="mem-address">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {m.address}
          </p>
        )}
        {m.mumbai_location && (
          <p className="mem-address" style={{ color: "#1565c0" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            मुंबई: {m.mumbai_location}
          </p>
        )}
        {m.bio && <p className="mem-bio">{m.bio}</p>}
      </div>
    </div>
  );
}
