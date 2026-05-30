import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const API = "https://ayarewadi-project.onrender.com";

const RELATIONS = [
  { value: "father",  label: "Father / वडील" },
  { value: "mother",  label: "Mother / आई" },
  { value: "spouse",  label: "Husband/Wife / पती/पत्नी" },
  { value: "son",     label: "Son / मुलगा" },
  { value: "daughter",label: "Daughter / मुलगी" },
];

const GENDERS = [
  { value: "male",   label: "Male / पुरुष" },
  { value: "female", label: "Female / स्त्री" },
];

const STATUS_STYLE = {
  pending:  { bg: "#fff8e1", color: "#f57f17", border: "#ffe082", label: "⏳ Pending" },
  approved: { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7", label: "✅ Approved" },
  rejected: { bg: "#fdecea", color: "#c62828", border: "#ffcdd2", label: "❌ Rejected" },
};

const emptyPerson = { first_name: "", middle_name: "", last_name: "", nickname: "", mobile: "", dob: "", gender: "" };

export default function MyFamilyInfo({ member, onBack }) {
  const { getToken } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState("list"); // list | form
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const [person, setPerson]     = useState({ ...emptyPerson });
  const [relations, setRelations] = useState([]);

  const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

  const loadRequests = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/api/members/family-requests/mine`, { headers: authHeader() });
      setRequests(r.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadRequests(); }, []);

  const addRelation = () => {
    setRelations(prev => [...prev, { relation_type: "father", first_name: "", middle_name: "", last_name: "", nickname: "", mobile: "", dob: "", gender: "" }]);
  };

  const removeRelation = idx => {
    setRelations(prev => prev.filter((_, i) => i !== idx));
  };

  const updateRelation = (idx, key, val) => {
    setRelations(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r));
  };

  const submit = async e => {
    e.preventDefault();
    if (!person.first_name.trim() || !person.last_name.trim()) {
      setError("First name and last name are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await axios.post(
        `${API}/api/members/family-requests`,
        {
          request_type: "add_person",
          request_data: { person, relations },
        },
        { headers: authHeader() }
      );
      setSuccess("Family information submitted! Admin will review it soon.");
      setPerson({ ...emptyPerson });
      setRelations([]);
      setView("list");
      loadRequests();
    } catch (e) {
      setError(e.response?.data?.error || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (field, val) => setPerson(p => ({ ...p, [field]: val }));

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>← Back</button>
        <h2 style={s.title}>👤 My Family Information</h2>
        <div style={s.titleSub}>माझी कुटुंब माहिती</div>
      </div>

      {view === "list" && (
        <>
          {/* Info banner */}
          <div style={s.infoBanner}>
            <span style={{ fontSize: "1.2rem" }}>ℹ️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 2 }}>
                How it works / कसे काम करते
              </div>
              <div style={{ fontSize: "0.75rem", color: "#555", lineHeight: 1.5 }}>
                Submit your family details below. Admin will review and add them to the official Village Family Tree.
                Your details will not be added directly — they go through approval first.
              </div>
            </div>
          </div>

          {/* Add button */}
          <button style={s.addBtn} onClick={() => { setView("form"); setError(""); setSuccess(""); }}>
            ➕ Add Family Details · कुटुंब माहिती जोडा
          </button>

          {success && (
            <div style={s.successMsg}>✅ {success}</div>
          )}

          {/* My submitted requests */}
          <div style={s.sectionLabel}>My Requests · माझ्या विनंत्या</div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#aaa" }}>Loading...</div>
          ) : requests.length === 0 ? (
            <div style={s.emptyMsg}>
              No requests yet. Click "Add Family Details" to get started.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {requests.map(req => {
                const st = STATUS_STYLE[req.status] || STATUS_STYLE.pending;
                const data = req.request_data;
                const personData = data.person || data;
                return (
                  <div key={req.id} style={{ ...s.requestCard, borderColor: st.border }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#222", marginBottom: 3 }}>
                          {[personData.first_name, personData.middle_name, personData.last_name].filter(Boolean).join(" ")}
                          {personData.nickname && ` (${personData.nickname})`}
                        </div>
                        {personData.mobile && <div style={{ fontSize: "0.75rem", color: "#777" }}>📞 {personData.mobile}</div>}
                        {personData.dob && <div style={{ fontSize: "0.75rem", color: "#777" }}>📅 {new Date(personData.dob).toLocaleDateString("en-IN")}</div>}
                        {data.relations?.length > 0 && (
                          <div style={{ fontSize: "0.72rem", color: "#999", marginTop: 3 }}>
                            + {data.relations.length} relation(s) included
                          </div>
                        )}
                        {req.admin_notes && (
                          <div style={{ fontSize: "0.72rem", color: "#777", marginTop: 4, padding: "4px 8px", background: "#f5f5f5", borderRadius: 6 }}>
                            Admin note: {req.admin_notes}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, borderRadius: 20, padding: "2px 10px", fontSize: "0.68rem", fontWeight: 700, display: "inline-block" }}>
                          {st.label}
                        </span>
                        <div style={{ fontSize: "0.65rem", color: "#bbb", marginTop: 4 }}>
                          {new Date(req.created_at).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {view === "form" && (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button type="button" style={s.backLink} onClick={() => setView("list")}>
            ← Back to my requests
          </button>

          {/* My information (pre-filled read-only) */}
          <div style={s.card}>
            <div style={s.cardHeader}>📋 Member Information · सभासद माहिती</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.75rem 0" }}>
              {member.photo_url && <img src={member.photo_url} alt="" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />}
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{member.full_name}</div>
                <div style={{ fontSize: "0.75rem", color: "#777" }}>📞 {member.mobile}</div>
              </div>
            </div>
          </div>

          {/* Add a family person */}
          <div style={s.card}>
            <div style={s.cardHeader}>👥 Person to Add · जोडायचे कुटुंब सदस्य</div>

            <div style={g2}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={lbl}>First Name *</label>
                <input style={inp} placeholder="e.g. Ramchandra" value={person.first_name}
                  autoCapitalize="characters" autoCorrect="off" spellCheck={false}
                  onChange={e => setField("first_name", e.target.value.toUpperCase())} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={lbl}>Middle Name / Father's Name *</label>
                <input style={inp} placeholder="e.g. Balu" value={person.middle_name}
                  autoCapitalize="characters" autoCorrect="off" spellCheck={false}
                  onChange={e => setField("middle_name", e.target.value.toUpperCase())} />
              </div>
            </div>
            <div style={g2}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={lbl}>Last Name *</label>
                <input style={inp} placeholder="e.g. Ayare" value={person.last_name}
                  autoCapitalize="characters" autoCorrect="off" spellCheck={false}
                  onChange={e => setField("last_name", e.target.value.toUpperCase())} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={lbl}>Nickname</label>
                <input style={inp} placeholder="e.g. Ramya" value={person.nickname}
                  autoCapitalize="characters" autoCorrect="off" spellCheck={false}
                  onChange={e => setField("nickname", e.target.value.toUpperCase())} />
              </div>
            </div>
            <div style={g2}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={lbl}>Mobile</label>
                <input style={inp} type="tel" placeholder="10-digit mobile" value={person.mobile}
                  onChange={e => setField("mobile", e.target.value)} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={lbl}>Date of Birth</label>
                <input style={inp} type="date" value={person.dob}
                  onChange={e => setField("dob", e.target.value)} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={lbl}>Gender</label>
              <select style={inp} value={person.gender} onChange={e => setField("gender", e.target.value)}>
                <option value="">— Select —</option>
                {GENDERS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Relations */}
          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div style={s.cardHeader}>🔗 Family Relations (Optional)</div>
              <button type="button" style={s.addRelBtn} onClick={addRelation}>+ Add Relation</button>
            </div>

            {relations.length === 0 ? (
              <div style={{ fontSize: "0.78rem", color: "#bbb", textAlign: "center", padding: "0.5rem 0" }}>
                No relations added. Click "+ Add Relation" to link family members.
              </div>
            ) : (
              relations.map((rel, idx) => (
                <div key={idx} style={s.relCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <select style={{ ...inp, flex: 1, marginRight: 8 }} value={rel.relation_type}
                      onChange={e => updateRelation(idx, "relation_type", e.target.value)}>
                      {RELATIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <button type="button" onClick={() => removeRelation(idx)}
                      style={{ background: "#fdecea", border: "none", color: "#c62828", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.8rem" }}>
                      ✕
                    </button>
                  </div>
                  <div style={g2}>
                    <input style={inp} placeholder="First Name *" value={rel.first_name}
                      autoCapitalize="characters" autoCorrect="off" spellCheck={false}
                      onChange={e => updateRelation(idx, "first_name", e.target.value.toUpperCase())} />
                    <input style={inp} placeholder="Middle Name" value={rel.middle_name}
                      autoCapitalize="characters" autoCorrect="off" spellCheck={false}
                      onChange={e => updateRelation(idx, "middle_name", e.target.value.toUpperCase())} />
                  </div>
                  <div style={g2}>
                    <input style={inp} placeholder="Last Name *" value={rel.last_name}
                      autoCapitalize="characters" autoCorrect="off" spellCheck={false}
                      onChange={e => updateRelation(idx, "last_name", e.target.value.toUpperCase())} />
                    <input style={inp} placeholder="Nickname" value={rel.nickname}
                      autoCapitalize="characters" autoCorrect="off" spellCheck={false}
                      onChange={e => updateRelation(idx, "nickname", e.target.value.toUpperCase())} />
                  </div>
                  <div style={g2}>
                    <input style={inp} type="tel" placeholder="Mobile" value={rel.mobile}
                      onChange={e => updateRelation(idx, "mobile", e.target.value)} />
                    <input style={inp} type="date" value={rel.dob}
                      onChange={e => updateRelation(idx, "dob", e.target.value)} />
                  </div>
                </div>
              ))
            )}
          </div>

          {error && <div style={s.errorMsg}>⚠️ {error}</div>}

          <button type="submit" disabled={submitting} style={s.submitBtn}>
            {submitting ? "Submitting..." : "📤 Submit Family Details · माहिती सादर करा"}
          </button>
        </form>
      )}
    </div>
  );
}

const s = {
  wrap: { maxWidth: 560, margin: "0 auto", padding: "72px 1rem 3rem", display: "flex", flexDirection: "column", gap: "1rem" },
  header: { marginBottom: "0.25rem" },
  backBtn: { background: "none", border: "none", color: "#2e7d32", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", padding: "0 0 6px 0" },
  title:   { fontSize: "1.2rem", fontWeight: 800, color: "#1b5e20", margin: "4px 0 2px" },
  titleSub:{ fontSize: "0.78rem", color: "#888" },
  infoBanner: { background: "#f1f8e9", border: "1px solid #dcedc8", borderRadius: 12, padding: "0.9rem", display: "flex", gap: 10, alignItems: "flex-start" },
  addBtn: { background: "linear-gradient(135deg,#1b5e20,#4caf50)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 16px", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", textAlign: "left" },
  sectionLabel: { fontSize: "0.7rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", paddingTop: 4 },
  emptyMsg: { textAlign: "center", padding: "2rem 0", color: "#bbb", fontSize: "0.85rem" },
  requestCard: { background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 12, padding: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  card: { background: "#fff", border: "1.5px solid #f0f0f0", borderRadius: 12, padding: "1rem", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" },
  cardHeader: { fontWeight: 800, fontSize: "0.85rem", color: "#1b5e20", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid #f5f5f5" },
  relCard: { background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 10, padding: "0.75rem", marginBottom: "0.75rem" },
  addRelBtn: { background: "#e8f5e9", color: "#2e7d32", border: "none", borderRadius: 8, padding: "5px 12px", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" },
  backLink: { background: "none", border: "none", color: "#2e7d32", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", padding: 0, textAlign: "left" },
  errorMsg: { background: "#fdecea", border: "1px solid #ffcdd2", color: "#c62828", borderRadius: 8, padding: "10px 14px", fontSize: "0.83rem", fontWeight: 600 },
  successMsg: { background: "#e8f5e9", border: "1px solid #c8e6c9", color: "#2e7d32", borderRadius: 8, padding: "10px 14px", fontSize: "0.83rem", fontWeight: 600 },
  submitBtn: { background: "linear-gradient(135deg,#1b5e20,#4caf50)", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontWeight: 700, fontSize: "0.92rem", cursor: "pointer" },
};

const lbl = { fontSize: "0.73rem", fontWeight: 700, color: "#555", display: "block", marginBottom: 4 };
const inp = { width: "100%", height: 38, border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "0 10px", fontSize: "0.85rem", outline: "none", background: "#fafafa", boxSizing: "border-box", textTransform: "uppercase" };
const g2  = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 };
