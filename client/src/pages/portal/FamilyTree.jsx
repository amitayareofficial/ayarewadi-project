import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = "https://ayarewadi-project.onrender.com";

const RELATION_LABELS = {
  father:   { label: "Father / वडील",      color: "#1565c0", bg: "#e3f2fd" },
  mother:   { label: "Mother / आई",         color: "#6a1b9a", bg: "#f3e5f5" },
  spouse:   { label: "Spouse / पती/पत्नी",  color: "#c62828", bg: "#fce4ec" },
  son:      { label: "Son / मुलगा",         color: "#2e7d32", bg: "#e8f5e9" },
  daughter: { label: "Daughter / मुलगी",    color: "#00695c", bg: "#e0f2f1" },
};

function personName(p) {
  if (!p) return "Unknown";
  return [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" ");
}

export default function FamilyTree({ onBack }) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [person,  setPerson]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [allPeople, setAllPeople] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/api/members/family-people`)
      .then(r => setAllPeople(r.data))
      .catch(() => {});
  }, []);

  const search = q => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(() => {
      axios.get(`${API}/api/members/family-search?q=${encodeURIComponent(q)}`)
        .then(r => setResults(r.data))
        .catch(() => {});
    }, 300);
  };

  const openPerson = async id => {
    setLoading(true);
    setResults([]);
    setQuery("");
    try {
      const r = await axios.get(`${API}/api/members/family-people/${id}`);
      setPerson(r.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>← Back</button>
        <h2 style={s.title}>🌳 Village Family Tree</h2>
        <div style={s.titleSub}>गाव कुटुंब वृक्ष · Ayarewadi</div>
      </div>

      {/* Info banner */}
      <div style={s.infoBanner}>
        <span style={{ fontSize: "1.1rem" }}>ℹ️</span>
        <div style={{ fontSize: "0.75rem", color: "#555", lineHeight: 1.5 }}>
          This tree contains all village family members. Not every person in the tree is a registered portal member.
          Search by first name, last name, or nickname.
        </div>
      </div>

      {/* Search */}
      <div style={s.searchWrap}>
        <span style={s.searchIcon}>🔍</span>
        <input
          style={s.searchInput}
          placeholder="Search by name or nickname..."
          value={query}
          onChange={e => search(e.target.value)}
          autoFocus
        />
        {query && (
          <button style={s.clearBtn} onClick={() => { setQuery(""); setResults([]); }}>✕</button>
        )}
      </div>

      {/* Search results dropdown */}
      {results.length > 0 && (
        <div style={s.dropdown}>
          {results.map(p => (
            <button key={p.id} style={s.dropdownItem} onClick={() => openPerson(p.id)}>
              {p.photo_url
                ? <img src={p.photo_url} alt="" style={s.miniAvatar} />
                : <div style={s.miniAvatarFallback}>{p.first_name?.charAt(0)}</div>
              }
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{personName(p)}</div>
                {p.nickname && <div style={{ fontSize: "0.72rem", color: "#888" }}>"{p.nickname}"</div>}
                <div style={{ fontSize: "0.7rem", color: "#aaa" }}>
                  {p.gender && <span>{p.gender} · </span>}
                  {p.dob && new Date(p.dob).getFullYear()}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "2rem", color: "#aaa" }}>Loading...</div>
      )}

      {/* Person detail */}
      {person && !loading && (
        <PersonDetail person={person} onClose={() => setPerson(null)} onOpenPerson={openPerson} />
      )}

      {/* All people list (when no search/person) */}
      {!person && !loading && query === "" && (
        <div style={{ marginTop: "0.5rem" }}>
          <div style={s.sectionLabel}>All Family Members · सर्व कुटुंब सदस्य ({allPeople.length})</div>
          {allPeople.length === 0 ? (
            <div style={s.emptyBox}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>🌳</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Family tree is empty</div>
              <div style={{ fontSize: "0.8rem", color: "#aaa" }}>
                Submit family details via "My Family Information" and admin will add them here.
              </div>
            </div>
          ) : (
            <div style={s.peopleGrid}>
              {allPeople.map(p => (
                <button key={p.id} style={s.personCard} onClick={() => openPerson(p.id)}>
                  {p.photo_url
                    ? <img src={p.photo_url} alt="" style={s.personAvatar} />
                    : <div style={s.personAvatarFallback}>{p.first_name?.charAt(0)}</div>
                  }
                  <div style={s.personName}>{personName(p)}</div>
                  {p.nickname && <div style={s.personNickname}>"{p.nickname}"</div>}
                  <div style={s.personMeta}>
                    {p.gender && <span style={{ textTransform: "capitalize" }}>{p.gender}</span>}
                    {p.dob && <span> · {new Date(p.dob).getFullYear()}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PersonDetail({ person, onClose, onOpenPerson }) {
  const parents   = (person.relations || []).filter(r => r.relation_type === "father" || r.relation_type === "mother");
  const spouse    = (person.relations || []).filter(r => r.relation_type === "spouse");
  const children  = (person.relations || []).filter(r => r.relation_type === "son" || r.relation_type === "daughter");
  const others    = (person.relations || []).filter(r => !["father","mother","spouse","son","daughter"].includes(r.relation_type));

  return (
    <div style={pd.wrap}>
      {/* Person card */}
      <div style={pd.personCard}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {person.photo_url
            ? <img src={person.photo_url} alt="" style={pd.avatar} />
            : <div style={pd.avatarFallback}>{person.first_name?.charAt(0)}</div>
          }
          <div style={{ flex: 1 }}>
            <h3 style={pd.name}>
              {personName(person)}
              <span style={pd.id}> #{person.id}</span>
            </h3>
            {person.nickname && <div style={pd.nickname}>"{person.nickname}"</div>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
              {person.gender && <InfoChip text={person.gender === "male" ? "👨 Male" : "👩 Female"} />}
              {person.dob && <InfoChip text={`📅 ${new Date(person.dob).toLocaleDateString("en-IN")}`} />}
              {person.mobile && <InfoChip text={`📞 ${person.mobile}`} />}
            </div>
          </div>
          <button style={pd.closeBtn} onClick={onClose}>✕</button>
        </div>
      </div>

      {/* No relations */}
      {(person.relations || []).length === 0 && (
        <div style={{ textAlign: "center", padding: "1.5rem 0", color: "#aaa", fontSize: "0.82rem" }}>
          No family relations recorded yet.
        </div>
      )}

      {/* Parents */}
      {parents.length > 0 && (
        <RelationSection title="Parents · पालक" relations={parents} onOpen={onOpenPerson} />
      )}

      {/* Spouse */}
      {spouse.length > 0 && (
        <RelationSection title="Spouse · पती/पत्नी" relations={spouse} onOpen={onOpenPerson} />
      )}

      {/* Children */}
      {children.length > 0 && (
        <RelationSection title="Children · मुले" relations={children} onOpen={onOpenPerson} />
      )}

      {/* Others */}
      {others.length > 0 && (
        <RelationSection title="Other Relations" relations={others} onOpen={onOpenPerson} />
      )}
    </div>
  );
}

function RelationSection({ title, relations, onOpen }) {
  return (
    <div style={pd.section}>
      <div style={pd.sectionTitle}>{title}</div>
      {relations.map((rel, i) => {
        const meta = RELATION_LABELS[rel.relation_type] || { label: rel.relation_type, color: "#555", bg: "#f5f5f5" };
        const name = [rel.first_name, rel.middle_name, rel.last_name].filter(Boolean).join(" ");
        return (
          <button key={i} style={pd.relRow} onClick={() => onOpen(rel.related_person_id)}>
            {rel.photo_url
              ? <img src={rel.photo_url} alt="" style={pd.relAvatar} />
              : <div style={{ ...pd.relAvatarFallback, background: meta.bg, color: meta.color }}>
                  {rel.first_name?.charAt(0)}
                </div>
            }
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{name}</div>
              {rel.nickname && <div style={{ fontSize: "0.7rem", color: "#888" }}>"{rel.nickname}"</div>}
            </div>
            <span style={{ ...pd.relBadge, background: meta.bg, color: meta.color }}>
              {meta.label}
            </span>
            <span style={{ color: "#ccc", fontSize: "0.9rem" }}>→</span>
          </button>
        );
      })}
    </div>
  );
}

function InfoChip({ text }) {
  return (
    <span style={{ background: "#f5f5f5", borderRadius: 20, padding: "2px 10px", fontSize: "0.7rem", color: "#555" }}>
      {text}
    </span>
  );
}

const s = {
  wrap:     { maxWidth: 560, margin: "0 auto", padding: "72px 1rem 3rem", display: "flex", flexDirection: "column", gap: "1rem" },
  header:   { marginBottom: "0.25rem" },
  backBtn:  { background: "none", border: "none", color: "#2e7d32", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", padding: "0 0 6px 0" },
  title:    { fontSize: "1.2rem", fontWeight: 800, color: "#1b5e20", margin: "4px 0 2px" },
  titleSub: { fontSize: "0.78rem", color: "#888" },
  infoBanner: { background: "#f1f8e9", border: "1px solid #dcedc8", borderRadius: 12, padding: "0.75rem 1rem", display: "flex", gap: 8, alignItems: "flex-start" },
  searchWrap: { display: "flex", alignItems: "center", background: "#fff", border: "2px solid #e0e0e0", borderRadius: 12, padding: "0 12px", gap: 8 },
  searchIcon: { fontSize: "1rem", color: "#bbb" },
  searchInput: { flex: 1, border: "none", outline: "none", padding: "11px 0", fontSize: "0.9rem", background: "transparent" },
  clearBtn: { background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: "1rem", padding: 4 },
  dropdown: { background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
  dropdownItem: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "none", background: "none", cursor: "pointer", borderBottom: "1px solid #f5f5f5", transition: "background 0.15s" },
  miniAvatar: { width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 },
  miniAvatarFallback: { width: 36, height: 36, borderRadius: "50%", background: "#e8f5e9", color: "#2e7d32", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem", flexShrink: 0 },
  sectionLabel: { fontSize: "0.7rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 },
  emptyBox: { textAlign: "center", padding: "3rem 0", color: "#bbb" },
  peopleGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 },
  personCard: { background: "#fff", border: "1.5px solid #f0f0f0", borderRadius: 12, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", textAlign: "center" },
  personAvatar: { width: 52, height: 52, borderRadius: "50%", objectFit: "cover", marginBottom: 8 },
  personAvatarFallback: { width: 52, height: 52, borderRadius: "50%", background: "#e8f5e9", color: "#2e7d32", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.3rem", marginBottom: 8 },
  personName: { fontWeight: 700, fontSize: "0.82rem", color: "#222", lineHeight: 1.3, marginBottom: 2 },
  personNickname: { fontSize: "0.7rem", color: "#999", fontStyle: "italic", marginBottom: 2 },
  personMeta: { fontSize: "0.68rem", color: "#aaa", textTransform: "capitalize" },
};

const pd = {
  wrap: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  personCard: { background: "#fff", border: "2px solid #e8f5e9", borderRadius: 16, padding: "1.1rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  avatar: { width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2.5px solid #4caf50", flexShrink: 0 },
  avatarFallback: { width: 64, height: 64, borderRadius: "50%", background: "#e8f5e9", color: "#2e7d32", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.6rem", border: "2.5px solid #4caf50", flexShrink: 0 },
  name: { fontSize: "1.1rem", fontWeight: 800, color: "#1b5e20", margin: "0 0 2px" },
  id:   { fontSize: "0.65rem", fontWeight: 400, color: "#bbb" },
  nickname: { fontSize: "0.78rem", color: "#888", fontStyle: "italic", marginBottom: 2 },
  closeBtn: { background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: "1.2rem", padding: 4, alignSelf: "flex-start" },
  section: { background: "#fff", border: "1.5px solid #f0f0f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" },
  sectionTitle: { fontWeight: 800, fontSize: "0.82rem", color: "#555", padding: "10px 14px", borderBottom: "1px solid #f5f5f5", background: "#fafafa" },
  relRow: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "none", background: "none", cursor: "pointer", borderBottom: "1px solid #f9f9f9" },
  relAvatar: { width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0 },
  relAvatarFallback: { width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem", flexShrink: 0 },
  relBadge: { borderRadius: 20, padding: "2px 8px", fontSize: "0.65rem", fontWeight: 700, flexShrink: 0 },
};
