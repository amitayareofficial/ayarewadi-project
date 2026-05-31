import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const API = "https://ayarewadi-project.onrender.com";

const RELATIONS = [
  { value: "father",   label: "Father / वडील" },
  { value: "mother",   label: "Mother / आई" },
  { value: "spouse",   label: "Husband/Wife / पती/पत्नी" },
  { value: "brother",  label: "Brother / भाऊ" },
  { value: "son",      label: "Son / मुलगा" },
  { value: "daughter", label: "Daughter / मुलगी" },
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

const REQ_LABEL = {
  add_person:   { text: "New Person",   color: "#1565c0", bg: "#e3f2fd" },
  add_relation: { text: "Add Relation", color: "#6a1b9a", bg: "#f3e5f5" },
  edit_person:  { text: "Edit Info",    color: "#e65100", bg: "#fff3e0" },
};

const emptyPerson = { first_name: "", middle_name: "", last_name: "", nickname: "", mobile: "", dob: "", gender: "" };
const emptyRel    = { relation_type: "father", first_name: "", middle_name: "", last_name: "", nickname: "", mobile: "", dob: "", gender: "" };

const pName = p => [p?.first_name, p?.middle_name, p?.last_name].filter(Boolean).join(" ");

export default function MyFamilyInfo({ member, onBack }) {
  const { getToken } = useAuth();

  const [requests,     setRequests]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [myPeople,     setMyPeople]     = useState([]);
  const [myLoading,    setMyLoading]    = useState(true);

  // view: list | addPerson | addRel | editInfo | editPersonDetail
  const [view,         setView]         = useState("list");
  const [targetPerson, setTargetPerson] = useState(null); // person whose relations we're viewing/editing
  const [editTarget,   setEditTarget]   = useState(null); // specific person being edited (own or relation)

  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");

  // addPerson form
  const [person,      setPerson]      = useState({ ...emptyPerson });
  const [personPhoto, setPersonPhoto] = useState(null);
  const [relations,   setRelations]   = useState([]);
  const [relPhotos,   setRelPhotos]   = useState([]);

  // addRel form
  const [relForm,     setRelForm]     = useState({ ...emptyRel });
  const [relPhoto,    setRelPhoto]    = useState(null);

  // editPersonDetail form
  const [editData,    setEditData]    = useState({ ...emptyPerson });
  const [editPhoto,   setEditPhoto]   = useState(null);

  const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

  const loadRequests = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/api/members/family-requests/mine`, { headers: authHeader() });
      setRequests(r.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const loadMyPeople = async () => {
    setMyLoading(true);
    try {
      const r = await axios.get(`${API}/api/members/family-people/mine`, { headers: authHeader() });
      setMyPeople(Array.isArray(r.data) ? r.data : []);
    } catch { /* silent */ }
    finally { setMyLoading(false); }
  };

  useEffect(() => { loadRequests(); loadMyPeople(); }, []);

  // ── Upload photo helper ──
  const uploadPhoto = async (file) => {
    if (!file) return null;
    const fd = new FormData();
    fd.append("photo", file);
    const r = await axios.post(`${API}/api/members/family-photo-upload`, fd, {
      headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
    });
    return r.data.url;
  };

  const goBack = () => { setView("list"); setError(""); setSuccess(""); };

  // ── addPerson relation row helpers ──
  const addRelRow    = () => { setRelations(p => [...p, { ...emptyRel }]); setRelPhotos(p => [...p, null]); };
  const removeRelRow = i  => { setRelations(p => p.filter((_, j) => j !== i)); setRelPhotos(p => p.filter((_, j) => j !== i)); };
  const updateRelRow = (i, k, v) => setRelations(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const updateRelPhoto = (i, f) => setRelPhotos(p => p.map((x, j) => j === i ? f : x));

  // ── Submit: add_person ──
  const submitAddPerson = async e => {
    e.preventDefault();
    if (!person.first_name.trim() || !person.last_name.trim()) { setError("First name and last name are required."); return; }
    setSubmitting(true); setError("");
    try {
      const personPhotoUrl = await uploadPhoto(personPhoto);
      const relsWithPhotos = await Promise.all(
        relations.map(async (rel, i) => ({ ...rel, photo_url: await uploadPhoto(relPhotos[i]) }))
      );
      await axios.post(`${API}/api/members/family-requests`,
        { request_type: "add_person", request_data: { person: { ...person, photo_url: personPhotoUrl }, relations: relsWithPhotos } },
        { headers: authHeader() }
      );
      setSuccess("Family information submitted! Admin will review it soon.");
      setPerson({ ...emptyPerson }); setPersonPhoto(null); setRelations([]); setRelPhotos([]);
      setView("list"); loadRequests(); loadMyPeople();
    } catch (e) {
      setError(e.response?.data?.error || "Submission failed.");
    } finally { setSubmitting(false); }
  };

  // ── Submit: add_relation ──
  const submitAddRelation = async e => {
    e.preventDefault();
    if (!relForm.first_name.trim() || !relForm.last_name.trim()) { setError("First name and last name are required."); return; }
    setSubmitting(true); setError("");
    try {
      const photoUrl = await uploadPhoto(relPhoto);
      await axios.post(`${API}/api/members/family-requests`,
        {
          request_type: "add_relation",
          request_data: { person_id: targetPerson.id, person_name: pName(targetPerson), relation: { ...relForm, photo_url: photoUrl } },
        },
        { headers: authHeader() }
      );
      setSuccess("Relation request submitted! Admin will review it.");
      setRelForm({ ...emptyRel }); setRelPhoto(null); setView("list"); loadRequests();
    } catch (e) {
      setError(e.response?.data?.error || "Submission failed.");
    } finally { setSubmitting(false); }
  };

  // ── Submit: edit_person ──
  const submitEditPerson = async e => {
    e.preventDefault();
    if (!editData.first_name.trim() || !editData.last_name.trim()) { setError("First name and last name are required."); return; }
    setSubmitting(true); setError("");
    try {
      const photoUrl = await uploadPhoto(editPhoto);
      const changes  = { ...editData, ...(photoUrl ? { photo_url: photoUrl } : {}) };
      await axios.post(`${API}/api/members/family-requests`,
        {
          request_type: "edit_person",
          request_data: { person_id: editTarget.id, person_name: pName(editTarget), changes },
        },
        { headers: authHeader() }
      );
      setSuccess(`Edit request for "${pName(editTarget)}" submitted! Admin will review it.`);
      setView("editInfo"); loadRequests();
    } catch (e) {
      setError(e.response?.data?.error || "Submission failed.");
    } finally { setSubmitting(false); }
  };

  const openEditInfo = p => {
    setTargetPerson(p); setError(""); setSuccess(""); setView("editInfo");
  };

  const openAddRel = p => {
    setTargetPerson(p); setRelForm({ ...emptyRel }); setRelPhoto(null); setError(""); setSuccess(""); setView("addRel");
  };

  const openEditPersonDetail = (personRow) => {
    setEditTarget(personRow);
    setEditData({
      first_name:  personRow.first_name  || "",
      middle_name: personRow.middle_name || "",
      last_name:   personRow.last_name   || "",
      nickname:    personRow.nickname    || "",
      mobile:      personRow.mobile      || "",
      dob:         personRow.dob ? personRow.dob.split("T")[0] : "",
      gender:      personRow.gender      || "",
    });
    setEditPhoto(null); setError(""); setSuccess(""); setView("editPersonDetail");
  };

  // ════════════════════════════════════════════════
  //  LIST VIEW
  // ════════════════════════════════════════════════
  if (view === "list") return (
    <div style={s.wrap}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>← Back</button>
        <h2 style={s.title}>👤 My Family Information</h2>
        <div style={s.titleSub}>माझी कुटुंब माहिती</div>
      </div>

      <div style={s.infoBanner}>
        <span style={{ fontSize: "1.2rem" }}>ℹ️</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 2 }}>How it works / कसे काम करते</div>
          <div style={{ fontSize: "0.75rem", color: "#555", lineHeight: 1.5 }}>
            Submit family details for admin approval. After approval you can edit any person's info or add new relations —
            every change requires admin review before going live.
          </div>
        </div>
      </div>

      {success && <div style={s.successMsg}>✅ {success}</div>}

      {!myLoading && myPeople.length > 0 && (
        <div>
          <div style={s.sectionLabel}>My People in Family Tree · माझे सदस्य</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {myPeople.map(p => (
              <div key={p.id} style={s.myPersonCard}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                  {p.photo_url
                    ? <img src={p.photo_url} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    : <div style={s.personInitial}>{p.first_name?.charAt(0)}</div>
                  }
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1b5e20", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pName(p)}</div>
                    {p.nickname && <div style={{ fontSize: "0.72rem", color: "#888" }}>"{p.nickname}"</div>}
                    <div style={{ fontSize: "0.7rem", color: "#aaa" }}>{(p.relations || []).length} relation(s) · #{p.id}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button style={s.editBtn}    onClick={() => openEditInfo(p)}>✏️ Edit</button>
                  <button style={s.addRelBtn2} onClick={() => openAddRel(p)}>➕ Relation</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button style={s.addBtn} onClick={() => { setView("addPerson"); setError(""); setSuccess(""); }}>
        ➕ Add Family Member · कुटुंब सदस्य जोडा
      </button>

      <div style={s.sectionLabel}>My Requests · माझ्या विनंत्या</div>
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#aaa" }}>Loading...</div>
      ) : requests.length === 0 ? (
        <div style={s.emptyMsg}>No requests yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {requests.map(req => {
            const st   = STATUS_STYLE[req.status] || STATUS_STYLE.pending;
            const data = req.request_data;
            const type = req.request_type;
            const rl   = REQ_LABEL[type] || { text: type, color: "#555", bg: "#f5f5f5" };
            let title = "", sub = "";
            if (type === "add_person") {
              const pd = data.person || data;
              title = pName(pd) || "—";
              sub   = data.relations?.length > 0 ? `+ ${data.relations.length} relation(s)` : "";
            } else if (type === "add_relation") {
              const rl2 = RELATIONS.find(r => r.value === data.relation?.relation_type)?.label?.split(" / ")[0] || "";
              title = data.person_name || "Person";
              sub   = `Add ${rl2}: ${pName(data.relation || {})}`;
            } else if (type === "edit_person") {
              title = data.person_name || "Family Member";
              sub   = "Info edit request";
            }
            return (
              <div key={req.id} style={{ ...s.requestCard, borderColor: st.border }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "0.62rem", background: rl.bg, color: rl.color, borderRadius: 20, padding: "1px 8px", fontWeight: 700, display: "inline-block", marginBottom: 4 }}>{rl.text}</span>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#222" }}>{title}</div>
                    {sub && <div style={{ fontSize: "0.72rem", color: "#888", marginTop: 2 }}>{sub}</div>}
                    {req.admin_notes && (
                      <div style={{ fontSize: "0.72rem", color: "#777", marginTop: 4, padding: "4px 8px", background: "#f5f5f5", borderRadius: 6 }}>
                        Admin note: {req.admin_notes}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, borderRadius: 20, padding: "2px 10px", fontSize: "0.68rem", fontWeight: 700, display: "inline-block" }}>{st.label}</span>
                    <div style={{ fontSize: "0.65rem", color: "#bbb", marginTop: 4 }}>{new Date(req.created_at).toLocaleDateString("en-IN")}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ════════════════════════════════════════════════
  //  ADD PERSON VIEW
  // ════════════════════════════════════════════════
  if (view === "addPerson") return (
    <div style={s.wrap}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>← Back</button>
        <h2 style={s.title}>➕ Add Family Member</h2>
      </div>
      <form onSubmit={submitAddPerson} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <button type="button" style={s.backLink} onClick={goBack}>← Back to list</button>

        <div style={s.card}>
          <div style={s.cardHeader}>📋 Submitted By · सभासद</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.5rem 0" }}>
            {member.photo_url && <img src={member.photo_url} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />}
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{member.full_name}</div>
              <div style={{ fontSize: "0.74rem", color: "#777" }}>📞 {member.mobile}</div>
            </div>
          </div>
        </div>

        <div style={s.card}>
          <div style={s.cardHeader}>👤 Person to Add · जोडायचे सदस्य</div>
          <PhotoPicker current={null} file={personPhoto} onChange={setPersonPhoto} />
          <PersonFields data={person} setField={(k, v) => setPerson(p => ({ ...p, [k]: v }))} showLabels />
        </div>

        <div style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <div style={s.cardHeader}>🔗 Family Relations (Optional)</div>
            <button type="button" style={s.addRelBtnSm} onClick={addRelRow}>+ Add</button>
          </div>
          {relations.length === 0 ? (
            <div style={{ fontSize: "0.78rem", color: "#bbb", textAlign: "center", padding: "0.5rem 0" }}>No relations added yet.</div>
          ) : (
            relations.map((rel, idx) => (
              <div key={idx} style={s.relCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <select style={{ ...inp, flex: 1, marginRight: 8 }} value={rel.relation_type}
                    onChange={e => updateRelRow(idx, "relation_type", e.target.value)}>
                    {RELATIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <button type="button" onClick={() => removeRelRow(idx)}
                    style={{ background: "#fdecea", border: "none", color: "#c62828", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.8rem" }}>✕</button>
                </div>
                <PhotoPicker current={null} file={relPhotos[idx]} onChange={f => updateRelPhoto(idx, f)} />
                <PersonFields data={rel} setField={(k, v) => updateRelRow(idx, k, v)} />
              </div>
            ))
          )}
        </div>

        {error && <div style={s.errorMsg}>⚠️ {error}</div>}
        <button type="submit" disabled={submitting} style={s.submitBtn}>
          {submitting ? "Uploading & Submitting..." : "📤 Submit · माहिती सादर करा"}
        </button>
      </form>
    </div>
  );

  // ════════════════════════════════════════════════
  //  ADD RELATION VIEW
  // ════════════════════════════════════════════════
  if (view === "addRel") return (
    <div style={s.wrap}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>← Back</button>
        <h2 style={s.title}>➕ Add Relation</h2>
        <div style={s.titleSub}>नवीन नातेसंबंध जोडा</div>
      </div>
      <form onSubmit={submitAddRelation} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <button type="button" style={s.backLink} onClick={goBack}>← Back</button>

        <div style={{ background: "#f3e5f5", border: "1px solid #ce93d8", borderRadius: 10, padding: "10px 14px", fontSize: "0.78rem", color: "#6a1b9a", fontWeight: 600 }}>
          ℹ️ Adding a relation to: <strong>{pName(targetPerson)}</strong> — requires admin approval.
        </div>

        <div style={s.card}>
          <div style={s.cardHeader}>🔗 Relation Type</div>
          <select style={inp} value={relForm.relation_type}
            onChange={e => setRelForm(f => ({ ...f, relation_type: e.target.value }))}>
            {RELATIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        <div style={s.card}>
          <div style={s.cardHeader}>👤 Person Details · व्यक्तीची माहिती</div>
          <PhotoPicker current={null} file={relPhoto} onChange={setRelPhoto} />
          <PersonFields data={relForm} setField={(k, v) => setRelForm(f => ({ ...f, [k]: v }))} showLabels />
        </div>

        {error && <div style={s.errorMsg}>⚠️ {error}</div>}
        <button type="submit" disabled={submitting} style={s.submitBtn}>
          {submitting ? "Uploading & Submitting..." : "📤 Submit Relation Request"}
        </button>
      </form>
    </div>
  );

  // ════════════════════════════════════════════════
  //  EDIT INFO VIEW  (person + all relations listed)
  // ════════════════════════════════════════════════
  if (view === "editInfo") return (
    <div style={s.wrap}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>← Back</button>
        <h2 style={s.title}>✏️ Edit Family Info</h2>
        <div style={s.titleSub}>माहिती संपादन</div>
      </div>
      <button type="button" style={s.backLink} onClick={goBack}>← Back to list</button>

      {success && <div style={s.successMsg}>✅ {success}</div>}

      <div style={{ background: "#fff3e0", border: "1px solid #ffcc80", borderRadius: 10, padding: "10px 14px", fontSize: "0.78rem", color: "#e65100", fontWeight: 600 }}>
        ⚠️ Every edit goes to admin for approval before going live.
      </div>

      {/* Own details card */}
      <div style={s.card}>
        <div style={s.cardHeader}>👤 Own Details · स्वतःची माहिती</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {targetPerson?.photo_url
            ? <img src={targetPerson.photo_url} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid #4caf50" }} />
            : <div style={{ ...s.personInitial, width: 52, height: 52, fontSize: "1.2rem" }}>{targetPerson?.first_name?.charAt(0)}</div>
          }
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#1b5e20" }}>{pName(targetPerson)}</div>
            {targetPerson?.nickname && <div style={{ fontSize: "0.72rem", color: "#888" }}>"{targetPerson.nickname}"</div>}
            {targetPerson?.mobile   && <div style={{ fontSize: "0.72rem", color: "#aaa" }}>📞 {targetPerson.mobile}</div>}
          </div>
          <button style={s.editBtn} onClick={() => openEditPersonDetail(targetPerson)}>✏️ Edit</button>
        </div>
      </div>

      {/* Relations cards */}
      {(targetPerson?.relations || []).length > 0 && (
        <div style={s.card}>
          <div style={s.cardHeader}>🔗 Relations · नातेसंबंध</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(targetPerson.relations || []).map((rel, i) => {
              const relLabel = RELATIONS.find(r => r.value === rel.relation_type)?.label || rel.relation_type;
              const relName  = [rel.first_name, rel.middle_name, rel.last_name].filter(Boolean).join(" ");
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < targetPerson.relations.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                  {rel.photo_url
                    ? <img src={rel.photo_url} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    : <div style={{ ...s.personInitial, width: 40, height: 40, fontSize: "1rem" }}>{rel.first_name?.charAt(0)}</div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{relName}</div>
                    <div style={{ fontSize: "0.68rem", color: "#888" }}>{relLabel}</div>
                  </div>
                  <button style={s.editBtn} onClick={() => openEditPersonDetail({ id: rel.related_person_id, first_name: rel.first_name, middle_name: rel.middle_name, last_name: rel.last_name, nickname: rel.nickname, photo_url: rel.photo_url })}>
                    ✏️ Edit
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(targetPerson?.relations || []).length === 0 && (
        <div style={s.emptyMsg}>No relations on record yet.</div>
      )}
    </div>
  );

  // ════════════════════════════════════════════════
  //  EDIT PERSON DETAIL VIEW  (single person edit form)
  // ════════════════════════════════════════════════
  if (view === "editPersonDetail") return (
    <div style={s.wrap}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>← Back</button>
        <h2 style={s.title}>✏️ Edit Details</h2>
        <div style={s.titleSub}>माहिती बदला · Requires approval</div>
      </div>
      <form onSubmit={submitEditPerson} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <button type="button" style={s.backLink} onClick={() => setView("editInfo")}>← Back to edit list</button>

        <div style={{ background: "#fff3e0", border: "1px solid #ffcc80", borderRadius: 10, padding: "10px 14px", fontSize: "0.78rem", color: "#e65100", fontWeight: 600 }}>
          ✏️ Editing: <strong>{pName(editTarget)}</strong> — changes go live only after admin approval.
        </div>

        <div style={s.card}>
          <div style={s.cardHeader}>📷 Photo · फोटो</div>
          <PhotoPicker current={editTarget?.photo_url} file={editPhoto} onChange={setEditPhoto} />
        </div>

        <div style={s.card}>
          <div style={s.cardHeader}>📋 Personal Details · वैयक्तिक माहिती</div>
          <PersonFields data={editData} setField={(k, v) => setEditData(d => ({ ...d, [k]: v }))} showLabels />
        </div>

        {error && <div style={s.errorMsg}>⚠️ {error}</div>}
        <button type="submit" disabled={submitting} style={s.submitBtn}>
          {submitting ? "Uploading & Submitting..." : "📤 Submit Edit Request · बदल सादर करा"}
        </button>
      </form>
    </div>
  );

  return null;
}

/* ── Photo picker component ── */
function PhotoPicker({ current, file, onChange }) {
  const preview = file ? URL.createObjectURL(file) : current;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, padding: "10px 0" }}>
      {preview
        ? <img src={preview} alt="" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", border: "2.5px solid #4caf50", flexShrink: 0 }} />
        : <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#e8f5e9", border: "2px dashed #a5d6a7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>📷</div>
      }
      <div>
        <label style={{ display: "inline-block", background: "#e8f5e9", color: "#2e7d32", borderRadius: 8, padding: "7px 14px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>
          {file ? "Change Photo" : current ? "Change Photo" : "Add Photo"}
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => onChange(e.target.files[0] || null)} />
        </label>
        {file  && <div style={{ fontSize: "0.68rem", color: "#2e7d32", marginTop: 4 }}>✓ New photo selected</div>}
        {!file && !current && <div style={{ fontSize: "0.68rem", color: "#bbb", marginTop: 4 }}>Optional · पर्यायी</div>}
      </div>
    </div>
  );
}

/* ── Reusable person form fields ── */
function PersonFields({ data, setField, showLabels }) {
  const up = v => v.toUpperCase();
  return (
    <>
      <div style={g2}>
        <Field label="First Name *" show={showLabels}>
          <input style={inp} placeholder="First Name *" value={data.first_name}
            autoCapitalize="characters" autoCorrect="off" spellCheck={false}
            onChange={e => setField("first_name", up(e.target.value))} />
        </Field>
        <Field label="Middle Name" show={showLabels}>
          <input style={inp} placeholder="Middle Name" value={data.middle_name}
            autoCapitalize="characters" autoCorrect="off" spellCheck={false}
            onChange={e => setField("middle_name", up(e.target.value))} />
        </Field>
      </div>
      <div style={g2}>
        <Field label="Last Name *" show={showLabels}>
          <input style={inp} placeholder="Last Name *" value={data.last_name}
            autoCapitalize="characters" autoCorrect="off" spellCheck={false}
            onChange={e => setField("last_name", up(e.target.value))} />
        </Field>
        <Field label="Nickname" show={showLabels}>
          <input style={inp} placeholder="Nickname" value={data.nickname}
            autoCapitalize="characters" autoCorrect="off" spellCheck={false}
            onChange={e => setField("nickname", up(e.target.value))} />
        </Field>
      </div>
      <div style={g2}>
        <Field label="Mobile" show={showLabels}>
          <input style={inp} type="tel" placeholder="10-digit mobile" value={data.mobile}
            onChange={e => setField("mobile", e.target.value)} />
        </Field>
        <Field label="Date of Birth" show={showLabels}>
          <input style={inp} type="date" value={data.dob}
            onChange={e => setField("dob", e.target.value)} />
        </Field>
      </div>
      <Field label="Gender" show={showLabels}>
        <select style={inp} value={data.gender} onChange={e => setField("gender", e.target.value)}>
          <option value="">— Select Gender —</option>
          {GENDERS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>
    </>
  );
}

function Field({ label, show, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {show && <label style={lbl}>{label}</label>}
      {children}
    </div>
  );
}

const s = {
  wrap:       { maxWidth: 560, margin: "0 auto", padding: "72px 1rem 3rem", display: "flex", flexDirection: "column", gap: "1rem" },
  header:     { marginBottom: "0.25rem" },
  backBtn:    { background: "none", border: "none", color: "#2e7d32", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", padding: "0 0 6px 0" },
  title:      { fontSize: "1.2rem", fontWeight: 800, color: "#1b5e20", margin: "4px 0 2px" },
  titleSub:   { fontSize: "0.78rem", color: "#888" },
  infoBanner: { background: "#f1f8e9", border: "1px solid #dcedc8", borderRadius: 12, padding: "0.9rem", display: "flex", gap: 10, alignItems: "flex-start" },
  addBtn:     { background: "linear-gradient(135deg,#1b5e20,#4caf50)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 16px", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", textAlign: "left" },
  sectionLabel:{ fontSize: "0.7rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", paddingTop: 4 },
  emptyMsg:   { textAlign: "center", padding: "2rem 0", color: "#bbb", fontSize: "0.85rem" },
  requestCard:{ background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 12, padding: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  card:       { background: "#fff", border: "1.5px solid #f0f0f0", borderRadius: 12, padding: "1rem", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" },
  cardHeader: { fontWeight: 800, fontSize: "0.85rem", color: "#1b5e20", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid #f5f5f5" },
  relCard:    { background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 10, padding: "0.75rem", marginBottom: "0.75rem" },
  addRelBtnSm:{ background: "#e8f5e9", color: "#2e7d32", border: "none", borderRadius: 8, padding: "5px 12px", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" },
  backLink:   { background: "none", border: "none", color: "#2e7d32", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", padding: 0, textAlign: "left" },
  errorMsg:   { background: "#fdecea", border: "1px solid #ffcdd2", color: "#c62828", borderRadius: 8, padding: "10px 14px", fontSize: "0.83rem", fontWeight: 600 },
  successMsg: { background: "#e8f5e9", border: "1px solid #c8e6c9", color: "#2e7d32", borderRadius: 8, padding: "10px 14px", fontSize: "0.83rem", fontWeight: 600 },
  submitBtn:  { background: "linear-gradient(135deg,#1b5e20,#4caf50)", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontWeight: 700, fontSize: "0.92rem", cursor: "pointer" },
  myPersonCard:{ background: "#fff", border: "1.5px solid #c8e6c9", borderRadius: 12, padding: "0.85rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, boxShadow: "0 1px 6px rgba(76,175,80,0.08)" },
  personInitial:{ width: 44, height: 44, borderRadius: "50%", background: "#e8f5e9", color: "#2e7d32", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.1rem", flexShrink: 0 },
  editBtn:    { background: "#fff3e0", color: "#e65100", border: "none", borderRadius: 8, padding: "6px 10px", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", whiteSpace: "nowrap" },
  addRelBtn2: { background: "#e8f5e9", color: "#2e7d32", border: "none", borderRadius: 8, padding: "6px 10px", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", whiteSpace: "nowrap" },
};

const lbl = { fontSize: "0.73rem", fontWeight: 700, color: "#555", display: "block", marginBottom: 4 };
const inp = { width: "100%", height: 38, border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "0 10px", fontSize: "0.85rem", outline: "none", background: "#fafafa", boxSizing: "border-box", textTransform: "uppercase" };
const g2  = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 };
