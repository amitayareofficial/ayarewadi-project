import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import PulsatingLoader from "@/components/ui/pulsating-loader";

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
  add_person:    { text: "New Person",      color: "#1565c0", bg: "#e3f2fd" },
  add_relation:  { text: "Add Relation",    color: "#6a1b9a", bg: "#f3e5f5" },
  add_relations: { text: "Add Relations",   color: "#6a1b9a", bg: "#f3e5f5" },
  edit_person:   { text: "Edit Info",       color: "#e65100", bg: "#fff3e0" },
  edit_relation: { text: "Change Relation", color: "#c62828", bg: "#fce4ec" },
};

// Inverse options presented to the user when changing relation
const INVERSE_OPTIONS = {
  father:   ["son", "daughter"],
  mother:   ["son", "daughter"],
  son:      ["father", "mother"],
  daughter: ["father", "mother"],
  spouse:   ["spouse"],
  brother:  ["brother"],
};

const emptyPerson = { first_name: "", middle_name: "", last_name: "", nickname: "", mobile: "", dob: "", gender: "", is_deceased: false, notes: "" };
const emptyRel    = { relation_type: "father", first_name: "", middle_name: "", last_name: "", nickname: "", mobile: "", dob: "", gender: "", is_deceased: false, notes: "", existing_person_id: null, existing_person_name: "", existing_person_photo: null };

const pName = p => [p?.first_name, p?.middle_name, p?.last_name].filter(Boolean).join(" ");

export default function MyFamilyInfo({ member, onBack }) {
  const { getToken } = useAuth();

  const [requests,     setRequests]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [myPeople,     setMyPeople]     = useState([]);
  const [myLoading,    setMyLoading]    = useState(true);

  // view: list | claimSearch | addPerson | addRel | editInfo | editPersonDetail
  const [view,         setView]         = useState("list");
  const [targetPerson, setTargetPerson] = useState(null);
  const [editTarget,   setEditTarget]   = useState(null);
  const [claimMode,    setClaimMode]    = useState(false); // editPersonDetail opened via claim flow

  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");
  const [dupeResults,  setDupeResults]  = useState([]);
  const dupeTimerRef = useRef(null);

  // addPerson form
  const [person,      setPerson]      = useState({ ...emptyPerson });
  const [personPhoto, setPersonPhoto] = useState(null);
  const [relations,   setRelations]   = useState([]);
  const [relPhotos,   setRelPhotos]   = useState([]);
  const [relSearches, setRelSearches] = useState([]);   // per-relation search text
  const [relMatches,  setRelMatches]  = useState([]);   // per-relation search results
  const relTimers = useRef([]);

  // addRel form search
  const [relFormSearch,  setRelFormSearch]  = useState("");
  const [relFormMatches, setRelFormMatches] = useState([]);
  const relFormTimer = useRef(null);

  // claimSearch view
  const [claimQuery,    setClaimQuery]    = useState("");
  const [claimResults,  setClaimResults]  = useState([]);
  const [claimLoading,  setClaimLoading]  = useState(false);
  const claimTimer = useRef(null);

  // addRel form
  const [relForm,     setRelForm]     = useState({ ...emptyRel });
  const [relPhoto,    setRelPhoto]    = useState(null);

  // myProfile view
  const [profilePerson,       setProfilePerson]       = useState(null);
  const [profileRels,         setProfileRels]         = useState([]);
  const [profileRelPhotos,    setProfileRelPhotos]    = useState([]);
  const [profileRelSearches,  setProfileRelSearches]  = useState([]);
  const [profileRelMatches,   setProfileRelMatches]   = useState([]);
  const profileRelTimers = useRef([]);

  // change-relation inline editor (inside myProfile)
  const [changeRelIdx,  setChangeRelIdx]  = useState(null); // index in profilePerson.relations
  const [changeRelFwd,  setChangeRelFwd]  = useState("");   // new forward type
  const [changeRelInv,  setChangeRelInv]  = useState("");   // new inverse type

  // editPersonDetail form
  const [editData, setEditData] = useState({ ...emptyPerson });
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

  // Duplicate detection when adding a person
  useEffect(() => {
    if (view !== "addPerson") return;
    if (dupeTimerRef.current) clearTimeout(dupeTimerRef.current);
    const fn = person.first_name.trim();
    const ln = person.last_name.trim();
    if (fn.length >= 2 && ln.length >= 1) {
      dupeTimerRef.current = setTimeout(async () => {
        try {
          const r = await axios.get(`${API}/api/members/family-search?q=${encodeURIComponent(fn + " " + ln)}`);
          setDupeResults(r.data.slice(0, 4));
        } catch { setDupeResults([]); }
      }, 600);
    } else {
      setDupeResults([]);
    }
  }, [person.first_name, person.last_name, view]);

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

  const goBack = () => {
    setView("list"); setError(""); setSuccess("");
    setRelFormSearch(""); setRelFormMatches([]);
    setClaimMode(false); setClaimQuery(""); setClaimResults([]);
    setProfileRels([]); setProfileRelPhotos([]); setProfileRelSearches([]); setProfileRelMatches([]);
  };

  // ── addPerson relation row helpers ──
  const addRelRow = () => {
    setRelations(p => [...p, { ...emptyRel }]);
    setRelPhotos(p => [...p, null]);
    setRelSearches(p => [...p, ""]);
    setRelMatches(p => [...p, []]);
  };
  const removeRelRow = i => {
    setRelations(p => p.filter((_, j) => j !== i));
    setRelPhotos(p => p.filter((_, j) => j !== i));
    setRelSearches(p => p.filter((_, j) => j !== i));
    setRelMatches(p => p.filter((_, j) => j !== i));
    if (relTimers.current[i]) clearTimeout(relTimers.current[i]);
  };
  const updateRelRow   = (i, k, v) => setRelations(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const updateRelPhoto = (i, f)    => setRelPhotos(p => p.map((x, j) => j === i ? f : x));

  // Search existing tree persons for a relation row
  const searchRel = (idx, q) => {
    setRelSearches(p => p.map((s, j) => j === idx ? q : s));
    if (relTimers.current[idx]) clearTimeout(relTimers.current[idx]);
    if (!q.trim()) { setRelMatches(p => p.map((m, j) => j === idx ? [] : m)); return; }
    relTimers.current[idx] = setTimeout(async () => {
      try {
        const r = await axios.get(`${API}/api/members/family-search?q=${encodeURIComponent(q)}`);
        setRelMatches(p => p.map((m, j) => j === idx ? r.data.slice(0, 5) : m));
      } catch { /* silent */ }
    }, 400);
  };
  const pickExistingRel = (idx, p) => {
    updateRelRow(idx, "existing_person_id", p.id);
    updateRelRow(idx, "existing_person_name", pName(p));
    updateRelRow(idx, "existing_person_photo", p.photo_url || null);
    setRelSearches(s => s.map((v, j) => j === idx ? "" : v));
    setRelMatches(s => s.map((v, j) => j === idx ? [] : v));
  };
  const clearExistingRel = idx => {
    updateRelRow(idx, "existing_person_id", null);
    updateRelRow(idx, "existing_person_name", "");
    updateRelRow(idx, "existing_person_photo", null);
  };

  // Search for addRel form (add relation to existing person)
  const searchRelForm = q => {
    setRelFormSearch(q);
    if (relFormTimer.current) clearTimeout(relFormTimer.current);
    if (!q.trim()) { setRelFormMatches([]); return; }
    relFormTimer.current = setTimeout(async () => {
      try {
        const r = await axios.get(`${API}/api/members/family-search?q=${encodeURIComponent(q)}`);
        setRelFormMatches(r.data.slice(0, 5));
      } catch { /* silent */ }
    }, 400);
  };
  const pickExistingRelForm = p => {
    setRelForm(f => ({ ...f, existing_person_id: p.id, existing_person_name: pName(p), existing_person_photo: p.photo_url || null }));
    setRelFormSearch(""); setRelFormMatches([]);
  };
  const clearExistingRelForm = () => {
    setRelForm(f => ({ ...f, existing_person_id: null, existing_person_name: "", existing_person_photo: null }));
  };

  // ── Submit: add_person ──
  const submitAddPerson = async e => {
    e.preventDefault();
    if (!person.first_name.trim() || !person.last_name.trim()) { setError("First name and last name are required."); return; }
    setSubmitting(true); setError("");
    try {
      const personPhotoUrl = await uploadPhoto(personPhoto);
      const relsWithPhotos = await Promise.all(
        relations.map(async (rel, i) => {
          if (rel.existing_person_id) return rel; // existing person — no new upload
          return { ...rel, photo_url: await uploadPhoto(relPhotos[i]) };
        })
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
    if (!relForm.existing_person_id) {
      if (!relForm.first_name.trim() || !relForm.last_name.trim()) { setError("First name and last name are required."); return; }
    }
    setSubmitting(true); setError("");
    try {
      let relation;
      if (relForm.existing_person_id) {
        relation = { relation_type: relForm.relation_type, existing_person_id: relForm.existing_person_id };
      } else {
        const photoUrl = await uploadPhoto(relPhoto);
        relation = { ...relForm, photo_url: photoUrl };
      }
      await axios.post(`${API}/api/members/family-requests`,
        { request_type: "add_relation", request_data: { person_id: targetPerson.id, person_name: pName(targetPerson), relation } },
        { headers: authHeader() }
      );
      setSuccess("Relation request submitted! Admin will review it.");
      setRelForm({ ...emptyRel }); setRelPhoto(null); setRelFormSearch(""); setRelFormMatches([]);
      setView("list"); loadRequests();
    } catch (e) {
      setError(e.response?.data?.error || "Submission failed.");
    } finally { setSubmitting(false); }
  };

  // ── Submit: edit_person (also handles claim) ──
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
          request_data: { person_id: editTarget.id, person_name: pName(editTarget), changes, ...(claimMode ? { claim: true } : {}) },
        },
        { headers: authHeader() }
      );
      const msg = claimMode
        ? `Claim request for "${pName(editTarget)}" submitted! Admin will link and update your profile.`
        : `Edit request for "${pName(editTarget)}" submitted! Admin will review it.`;
      setSuccess(msg);
      setClaimMode(false);
      if (claimMode) { setView("list"); loadRequests(); loadMyPeople(); }
      else { setView(editReturnView); loadRequests(); if (editReturnView === "myProfile" && profilePerson) { const r = await axios.get(`${API}/api/members/family-people/${profilePerson.id}`); setProfilePerson(r.data); } }
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

  const [editReturnView, setEditReturnView] = useState("editInfo");

  const openEditPersonDetail = (personRow, claim = false, returnTo = "editInfo") => {
    setEditReturnView(returnTo);
    setEditTarget(personRow);
    setEditData({
      first_name:  personRow.first_name  || "",
      middle_name: personRow.middle_name || "",
      last_name:   personRow.last_name   || "",
      nickname:    personRow.nickname    || "",
      mobile:      personRow.mobile      || "",
      dob:         personRow.dob ? personRow.dob.split("T")[0] : "",
      gender:      personRow.gender      || "",
      is_deceased: personRow.is_deceased || false,
      notes:       personRow.notes       || "",
    });
    setClaimMode(claim);
    setEditPhoto(null); setError(""); setSuccess(""); setView("editPersonDetail");
  };

  // ── Claim search helpers ──
  const searchClaim = q => {
    setClaimQuery(q);
    if (claimTimer.current) clearTimeout(claimTimer.current);
    if (!q.trim()) { setClaimResults([]); return; }
    claimTimer.current = setTimeout(async () => {
      setClaimLoading(true);
      try {
        const r = await axios.get(`${API}/api/members/family-search?q=${encodeURIComponent(q)}`);
        setClaimResults(r.data);
      } catch { /* silent */ }
      finally { setClaimLoading(false); }
    }, 350);
  };

  const claimPerson = async person => {
    setClaimLoading(true);
    try {
      const r = await axios.get(`${API}/api/members/family-people/${person.id}`);
      openEditPersonDetail(r.data, true);
    } catch { setError("Could not load person details."); }
    finally { setClaimLoading(false); }
  };

  // ── Change-relation helpers ──
  const openChangeRel = idx => {
    const rel = profilePerson.relations[idx];
    setChangeRelIdx(idx);
    setChangeRelFwd(rel.relation_type);
    // Auto-suggest inverse based on profile person's gender
    const g = profilePerson.gender?.toLowerCase();
    const opts = INVERSE_OPTIONS[rel.relation_type] || [];
    const suggested = opts.length === 1 ? opts[0]
      : g === "male" ? (opts.includes("son") ? "son" : opts.includes("father") ? "father" : opts[0])
      : g === "female" ? (opts.includes("daughter") ? "daughter" : opts.includes("mother") ? "mother" : opts[0])
      : opts[0];
    setChangeRelInv(suggested || "");
    setError(""); setSuccess("");
  };

  const submitChangeRelation = async () => {
    const rel = profilePerson.relations[changeRelIdx];
    if (!changeRelFwd && !changeRelInv) { setError("Select at least one change."); return; }
    setSubmitting(true); setError("");
    try {
      const changes = {};
      if (changeRelFwd && changeRelFwd !== rel.relation_type) changes.new_relation_type = changeRelFwd;
      if (changeRelInv) changes.new_inverse_type = changeRelInv;
      if (!Object.keys(changes).length) { setError("No changes made."); setSubmitting(false); return; }
      await axios.post(`${API}/api/members/family-requests`,
        {
          request_type: "edit_relation",
          request_data: {
            relation_id: rel.id,
            person_name: `${pName(profilePerson)} ↔ ${[rel.first_name, rel.last_name].filter(Boolean).join(" ")}`,
            ...changes,
          },
        },
        { headers: authHeader() }
      );
      setSuccess("Relation change submitted for admin approval.");
      setChangeRelIdx(null);
      loadRequests();
    } catch (e) { setError(e.response?.data?.error || "Submission failed."); }
    finally { setSubmitting(false); }
  };

  // ── myProfile helpers ──
  const openMyProfile = async p => {
    setError(""); setSuccess("");
    setProfileRels([]); setProfileRelPhotos([]); setProfileRelSearches([]); setProfileRelMatches([]);
    // Load full person with relations from server
    try {
      const r = await axios.get(`${API}/api/members/family-people/${p.id}`);
      setProfilePerson(r.data);
    } catch { setProfilePerson(p); }
    setView("myProfile");
  };

  const addProfileRelRow = () => {
    setProfileRels(x => [...x, { ...emptyRel }]);
    setProfileRelPhotos(x => [...x, null]);
    setProfileRelSearches(x => [...x, ""]);
    setProfileRelMatches(x => [...x, []]);
  };
  const removeProfileRelRow = i => {
    setProfileRels(x => x.filter((_, j) => j !== i));
    setProfileRelPhotos(x => x.filter((_, j) => j !== i));
    setProfileRelSearches(x => x.filter((_, j) => j !== i));
    setProfileRelMatches(x => x.filter((_, j) => j !== i));
    if (profileRelTimers.current[i]) clearTimeout(profileRelTimers.current[i]);
  };
  const updateProfileRelRow = (i, k, v) =>
    setProfileRels(x => x.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const updateProfileRelPhoto = (i, f) =>
    setProfileRelPhotos(x => x.map((v, j) => j === i ? f : v));

  const searchProfileRel = (idx, q) => {
    setProfileRelSearches(x => x.map((s, j) => j === idx ? q : s));
    if (profileRelTimers.current[idx]) clearTimeout(profileRelTimers.current[idx]);
    if (!q.trim()) { setProfileRelMatches(x => x.map((m, j) => j === idx ? [] : m)); return; }
    profileRelTimers.current[idx] = setTimeout(async () => {
      try {
        const r = await axios.get(`${API}/api/members/family-search?q=${encodeURIComponent(q)}`);
        setProfileRelMatches(x => x.map((m, j) => j === idx ? r.data.slice(0, 5) : m));
      } catch { /* silent */ }
    }, 400);
  };
  const pickProfileExisting = (idx, p) => {
    updateProfileRelRow(idx, "existing_person_id", p.id);
    updateProfileRelRow(idx, "existing_person_name", pName(p));
    updateProfileRelRow(idx, "existing_person_photo", p.photo_url || null);
    setProfileRelSearches(x => x.map((s, j) => j === idx ? "" : s));
    setProfileRelMatches(x => x.map((m, j) => j === idx ? [] : m));
  };
  const clearProfileExisting = idx => {
    updateProfileRelRow(idx, "existing_person_id", null);
    updateProfileRelRow(idx, "existing_person_name", "");
    updateProfileRelRow(idx, "existing_person_photo", null);
  };

  const submitProfileRelations = async e => {
    e.preventDefault();
    if (profileRels.length === 0) return;
    setSubmitting(true); setError("");
    try {
      const relsWithPhotos = await Promise.all(
        profileRels.map(async (rel, i) => {
          if (rel.existing_person_id) return rel;
          if (!rel.first_name?.trim() || !rel.last_name?.trim()) return null;
          const photo_url = await uploadPhoto(profileRelPhotos[i]);
          return { ...rel, photo_url };
        })
      );
      const validRels = relsWithPhotos.filter(Boolean);
      if (validRels.length === 0) { setError("Please fill in at least one complete relation."); setSubmitting(false); return; }
      await axios.post(`${API}/api/members/family-requests`,
        {
          request_type: "add_relations",
          request_data: { person_id: profilePerson.id, person_name: pName(profilePerson), relations: validRels },
        },
        { headers: authHeader() }
      );
      setSuccess(`${validRels.length} relation(s) submitted for admin approval!`);
      setProfileRels([]); setProfileRelPhotos([]); setProfileRelSearches([]); setProfileRelMatches([]);
      loadRequests();
      // Refresh profile relations from server
      const r = await axios.get(`${API}/api/members/family-people/${profilePerson.id}`);
      setProfilePerson(r.data);
    } catch (e) { setError(e.response?.data?.error || "Submission failed."); }
    finally { setSubmitting(false); }
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

      {/* Claim banner — shown when member has no people yet */}
      {!myLoading && myPeople.length === 0 && (
        <button style={s.claimBtn} onClick={() => { setView("claimSearch"); setClaimQuery(""); setClaimResults([]); setError(""); setSuccess(""); }}>
          <span style={{ fontSize: "1.3rem" }}>🔍</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 800, fontSize: "0.88rem" }}>I'm already in the village tree</div>
            <div style={{ fontWeight: 700, fontSize: "0.78rem", opacity: 0.85 }}>मी आधीच कुटुंब वृक्षात आहे — माझे नाव शोधा</div>
            <div style={{ fontSize: "0.7rem", opacity: 0.7, marginTop: 2 }}>Search, find your name, review & submit for approval</div>
          </div>
          <span style={{ fontSize: "1.1rem", opacity: 0.6 }}>→</span>
        </button>
      )}

      <div style={s.infoBanner}>
        <span style={{ fontSize: "1.2rem" }}>ℹ️</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 2 }}>How it works / कसे काम करते</div>
          <div style={{ fontSize: "0.75rem", color: "#555", lineHeight: 1.5 }}>
            If your name is already in the village tree (added by a family member), use <strong>🔍 above</strong> to find and link your profile instead of creating a duplicate.
            Otherwise use "➕ Add New" below.
          </div>
        </div>
      </div>

      {success && <div style={s.successMsg}>✅ {success}</div>}

      {!myLoading && myPeople.length > 0 && (
        <div>
          <div style={s.sectionLabel}>My People in Family Tree · माझे सदस्य</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {myPeople.map(p => (
              <button key={p.id} style={{ ...s.myPersonCard, cursor: "pointer", textAlign: "left", width: "100%" }}
                onClick={() => openMyProfile(p)}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                  {p.photo_url
                    ? <img src={p.photo_url} alt="" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #4caf50" }} />
                    : <div style={{ ...s.personInitial, width: 48, height: 48 }}>{p.first_name?.charAt(0)}</div>
                  }
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1b5e20", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pName(p)}</div>
                    {p.nickname && <div style={{ fontSize: "0.72rem", color: "#888" }}>"{p.nickname}"</div>}
                    <div style={{ fontSize: "0.7rem", color: "#aaa" }}>{(p.relations || []).length} relation(s) · #{p.id}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                  <span style={{ fontSize: "0.65rem", background: "#e8f5e9", color: "#2e7d32", borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>✏️ Edit · ➕ Relatives</span>
                  <span style={{ fontSize: "1rem", color: "#ccc" }}>→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ ...s.addBtn, flex: 1 }} onClick={() => { setView("addPerson"); setError(""); setSuccess(""); }}>
          ➕ Add New Member
        </button>
        <button style={s.findBtn} onClick={() => { setView("claimSearch"); setClaimQuery(""); setClaimResults([]); setError(""); setSuccess(""); }}>
          🔍 Find My Profile
        </button>
      </div>

      <div style={s.sectionLabel}>My Requests · माझ्या विनंत्या</div>
      {loading ? (
        <PulsatingLoader message="Loading requests…" />
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
              sub   = data.claim ? "🔗 Claim & link profile" : "Info edit request";
            } else if (type === "edit_relation" || type === "add_relations") {
              title = data.person_name || "Family Member";
              sub   = type === "edit_relation"
                ? `Change: ${data.new_relation_type || ""}${data.new_inverse_type ? " / inverse → " + data.new_inverse_type : ""}`
                : `Add ${data.relations?.length || 0} relation(s)`;
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
  //  MY PROFILE VIEW
  // ════════════════════════════════════════════════
  if (view === "myProfile" && profilePerson) return (
    <div style={s.wrap}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>← Back</button>
        <h2 style={s.title}>👤 My Profile</h2>
        <div style={s.titleSub}>माझा प्रोफाइल</div>
      </div>
      <button type="button" style={s.backLink} onClick={goBack}>← Back to list</button>

      {success && <div style={s.successMsg}>✅ {success}</div>}

      {/* Profile card */}
      <div style={s.card}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {profilePerson.photo_url
            ? <img src={profilePerson.photo_url} alt="" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", border: "2.5px solid #4caf50", flexShrink: 0 }} />
            : <div style={{ ...s.personInitial, width: 60, height: 60, fontSize: "1.4rem", flexShrink: 0 }}>{profilePerson.first_name?.charAt(0)}</div>
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: "1rem", color: "#1b5e20" }}>{pName(profilePerson)}</div>
            {profilePerson.nickname && <div style={{ fontSize: "0.78rem", color: "#888", fontStyle: "italic" }}>"{profilePerson.nickname}"</div>}
            <div style={{ fontSize: "0.72rem", color: "#aaa", marginTop: 3, display: "flex", flexWrap: "wrap", gap: "0 8px" }}>
              {profilePerson.gender && <span style={{ textTransform: "capitalize" }}>{profilePerson.gender}</span>}
              {profilePerson.dob && <span>📅 {new Date(profilePerson.dob).toLocaleDateString("en-IN")}</span>}
              {profilePerson.mobile && <span>📞 {profilePerson.mobile}</span>}
              {profilePerson.is_deceased && <span style={{ color: "#9e9e9e" }}>✝ Deceased</span>}
            </div>
          </div>
          <button style={s.editBtn} onClick={() => openEditPersonDetail(profilePerson, false, "myProfile")}>✏️ Edit</button>
        </div>
        {profilePerson.notes && (
          <div style={{ marginTop: 8, fontSize: "0.74rem", color: "#777", fontStyle: "italic", borderTop: "1px solid #f5f5f5", paddingTop: 8 }}>{profilePerson.notes}</div>
        )}
      </div>

      {/* Existing relations */}
      {(profilePerson.relations || []).length > 0 && (
        <div style={s.card}>
          <div style={s.cardHeader}>🔗 My Relations · माझे नातेसंबंध</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {(profilePerson.relations || []).map((rel, i) => {
              const rl   = RELATIONS.find(r => r.value === rel.relation_type) || { label: rel.relation_type };
              const nm   = [rel.first_name, rel.middle_name, rel.last_name].filter(Boolean).join(" ");
              const isEditing = changeRelIdx === i;
              const invOpts = INVERSE_OPTIONS[rel.relation_type] || [];
              return (
                <div key={i} style={{ borderBottom: i < profilePerson.relations.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                  {/* Relation row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                    {rel.photo_url
                      ? <img src={rel.photo_url} alt="" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                      : <div style={{ ...s.personInitial, width: 38, height: 38, fontSize: "0.9rem", flexShrink: 0 }}>{rel.first_name?.charAt(0)}</div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nm}</div>
                      {rel.nickname && <div style={{ fontSize: "0.68rem", color: "#888" }}>"{rel.nickname}"</div>}
                    </div>
                    <span style={{ fontSize: "0.65rem", background: "#f0f4f8", color: "#555", borderRadius: 20, padding: "2px 8px", fontWeight: 700, flexShrink: 0 }}>
                      {rl.label.split(" / ")[0]}
                    </span>
                    <button type="button"
                      style={{ background: isEditing ? "#fdecea" : "#fff3e0", color: isEditing ? "#c62828" : "#e65100", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
                      onClick={() => isEditing ? setChangeRelIdx(null) : openChangeRel(i)}>
                      {isEditing ? "✕ Cancel" : "🔄 Change"}
                    </button>
                  </div>

                  {/* Inline change-relation form */}
                  {isEditing && (
                    <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#e65100", marginBottom: 8 }}>
                        Change relation type — requires admin approval
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                        <div>
                          <label style={lbl}>Your relation to them</label>
                          <select style={inp} value={changeRelFwd} onChange={e => setChangeRelFwd(e.target.value)}>
                            {RELATIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={lbl}>How they see you</label>
                          <select style={inp} value={changeRelInv} onChange={e => setChangeRelInv(e.target.value)}>
                            {invOpts.length > 0
                              ? invOpts.map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)
                              : RELATIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)
                            }
                          </select>
                        </div>
                      </div>
                      <button type="button" disabled={submitting} style={{ ...s.submitBtn, padding: "9px 14px", fontSize: "0.82rem" }}
                        onClick={submitChangeRelation}>
                        {submitting ? "⏳ Submitting…" : "📤 Submit Change for Approval"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add new relations */}
      <form onSubmit={submitProfileRelations} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <div style={s.cardHeader}>➕ Add Relations · नातेसंबंध जोडा</div>
            <button type="button" style={s.addRelBtnSm} onClick={addProfileRelRow}>+ Add</button>
          </div>

          {profileRels.length === 0 ? (
            <div style={{ fontSize: "0.78rem", color: "#bbb", textAlign: "center", padding: "0.5rem 0" }}>
              Tap "+ Add" to add family relations (father, mother, spouse, children…)
            </div>
          ) : (
            profileRels.map((rel, idx) => (
              <RelationRow key={idx} idx={idx} rel={rel}
                photo={profileRelPhotos[idx]}
                searchQuery={profileRelSearches[idx]}
                searchResults={profileRelMatches[idx]}
                onRelChange={(k, v) => updateProfileRelRow(idx, k, v)}
                onPhotoChange={f => updateProfileRelPhoto(idx, f)}
                onRemove={() => removeProfileRelRow(idx)}
                onSearch={q => searchProfileRel(idx, q)}
                onPickExisting={p => pickProfileExisting(idx, p)}
                onClearExisting={() => clearProfileExisting(idx)}
              />
            ))
          )}
        </div>

        {profileRels.length > 0 && (
          <>
            {error && <div style={s.errorMsg}>⚠️ {error}</div>}
            <button type="submit" disabled={submitting} style={s.submitBtn}>
              {submitting ? "⏳ Submitting…" : `📤 Submit ${profileRels.length} Relation(s) for Approval`}
            </button>
          </>
        )}
      </form>
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
              <RelationRow key={idx} idx={idx} rel={rel}
                photo={relPhotos[idx]}
                searchQuery={relSearches[idx]}
                searchResults={relMatches[idx]}
                onRelChange={(k, v) => updateRelRow(idx, k, v)}
                onPhotoChange={f => updateRelPhoto(idx, f)}
                onRemove={() => removeRelRow(idx)}
                onSearch={q => searchRel(idx, q)}
                onPickExisting={p => pickExistingRel(idx, p)}
                onClearExisting={() => clearExistingRel(idx)}
              />
            ))
          )}
        </div>

        {dupeResults.length > 0 && (
          <div style={s.dupeWarn}>
            <div style={{ fontWeight: 800, fontSize: "0.82rem", color: "#7b1fa2", marginBottom: 8 }}>
              ⚠️ Similar person(s) already in village tree — review before submitting
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {dupeResults.map(dp => (
                <div key={dp.id} style={s.dupeRow}>
                  {dp.photo_url
                    ? <img src={dp.photo_url} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    : <div style={{ ...s.personInitial, width: 36, height: 36, fontSize: "0.9rem", flexShrink: 0 }}>{dp.first_name?.charAt(0)}</div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#222" }}>{[dp.first_name, dp.middle_name, dp.last_name].filter(Boolean).join(" ")}</div>
                    {dp.nickname && <div style={{ fontSize: "0.68rem", color: "#888" }}>"{dp.nickname}"</div>}
                    <div style={{ fontSize: "0.65rem", color: "#aaa" }}>
                      {dp.gender && <span>{dp.gender} · </span>}
                      {dp.dob && new Date(dp.dob).getFullYear()}
                      {dp.mobile && ` · ${dp.mobile}`}
                    </div>
                  </div>
                  <span style={{ fontSize: "0.62rem", background: "#f3e5f5", color: "#7b1fa2", borderRadius: 20, padding: "2px 8px", fontWeight: 700, flexShrink: 0 }}>#{dp.id}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#7b1fa2", marginTop: 8 }}>
              If this is the same person, do not create a duplicate. If it is a different person, continue and add a nickname to distinguish them.
            </div>
          </div>
        )}

        {error && <div style={s.errorMsg}>⚠️ {error}</div>}
        <button type="submit" disabled={submitting} style={s.submitBtn}>
          {submitting ? "⏳ Submitting…" : "📤 Submit · माहिती सादर करा"}
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

        {/* Existing person search */}
        <div style={s.card}>
          <div style={s.cardHeader}>🔍 Link Existing Person · आधीच्या व्यक्तीशी जोडा</div>
          {relForm.existing_person_id ? (
            <div style={s.existingPickCard}>
              {relForm.existing_person_photo
                ? <img src={relForm.existing_person_photo} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                : <div style={{ ...s.personInitial, width: 44, height: 44, flexShrink: 0 }}>{relForm.existing_person_name?.charAt(0)}</div>}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{relForm.existing_person_name}</div>
                <div style={{ fontSize: "0.68rem", color: "#2e7d32", fontWeight: 700 }}>✓ Existing person · #{relForm.existing_person_id}</div>
              </div>
              <button type="button" style={s.changePick} onClick={clearExistingRelForm}>× Change</button>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <input style={{ ...inp, textTransform: "none" }}
                placeholder="Search by name or nickname..."
                value={relFormSearch}
                onChange={e => searchRelForm(e.target.value)} />
              {relFormMatches.length > 0 && (
                <div style={s.relMatchDrop}>
                  {relFormMatches.map(m => (
                    <button key={m.id} type="button" style={s.relMatchItem} onClick={() => pickExistingRelForm(m)}>
                      {m.photo_url
                        ? <img src={m.photo_url} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                        : <div style={{ ...s.personInitial, width: 32, height: 32, fontSize: "0.75rem", flexShrink: 0 }}>{m.first_name?.charAt(0)}</div>}
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.82rem" }}>{pName(m)}</div>
                        {m.nickname && <div style={{ fontSize: "0.65rem", color: "#888" }}>"{m.nickname}"</div>}
                        <div style={{ fontSize: "0.62rem", color: "#aaa" }}>#{m.id}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div style={{ fontSize: "0.68rem", color: "#bbb", marginTop: 6 }}>If the person already exists in the village tree, select them above instead of creating a duplicate.</div>
            </div>
          )}
        </div>

        {!relForm.existing_person_id && (
          <div style={s.card}>
            <div style={s.cardHeader}>👤 New Person Details · नवीन व्यक्तीची माहिती</div>
            <PhotoPicker current={null} file={relPhoto} onChange={setRelPhoto} />
            <PersonFields data={relForm} setField={(k, v) => setRelForm(f => ({ ...f, [k]: v }))} showLabels />
          </div>
        )}

        {error && <div style={s.errorMsg}>⚠️ {error}</div>}
        <button type="submit" disabled={submitting} style={s.submitBtn}>
          {submitting ? "⏳ Submitting…" : "📤 Submit Relation Request"}
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
  //  CLAIM SEARCH VIEW
  // ════════════════════════════════════════════════
  if (view === "claimSearch") return (
    <div style={s.wrap}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>← Back</button>
        <h2 style={s.title}>🔍 Find My Profile</h2>
        <div style={s.titleSub}>माझे नाव शोधा · village family tree</div>
      </div>
      <button type="button" style={s.backLink} onClick={goBack}>← Back to list</button>

      <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 12, padding: "0.9rem 1rem", fontSize: "0.78rem", color: "#1b5e20", lineHeight: 1.6 }}>
        <strong>How this works:</strong> Search your name below. If you were already added to the village tree by a family member, tap <strong>"This is Me"</strong> on your card. Review your details, make corrections, and submit — admin will link your account to that profile. No duplicate will be created.
      </div>

      {error && <div style={s.errorMsg}>⚠️ {error}</div>}

      {/* Search box */}
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", background: "#fff", border: "2px solid #c8e6c9", borderRadius: 12, padding: "0 12px", gap: 8 }}>
          <span style={{ fontSize: "1.1rem", color: "#bbb" }}>🔍</span>
          <input
            autoFocus
            style={{ flex: 1, border: "none", outline: "none", padding: "12px 0", fontSize: "0.92rem", background: "transparent" }}
            placeholder="Type your name or nickname..."
            value={claimQuery}
            onChange={e => searchClaim(e.target.value)}
          />
          {claimQuery && (
            <button style={{ background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: "1rem" }}
              onClick={() => { setClaimQuery(""); setClaimResults([]); }}>✕</button>
          )}
        </div>
      </div>

      {claimLoading && <PulsatingLoader message="Searching village tree…" />}

      {!claimLoading && claimQuery && claimResults.length === 0 && (
        <div style={s.emptyMsg}>
          <div>No matching name found in the village tree.</div>
          <div style={{ fontSize: "0.78rem", color: "#aaa", marginTop: 6 }}>Use "➕ Add New Member" if you've never been added.</div>
        </div>
      )}

      {claimResults.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={s.sectionLabel}>Results · परिणाम ({claimResults.length})</div>
          {claimResults.map(p => (
            <div key={p.id} style={s.claimCard}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                {p.photo_url
                  ? <img src={p.photo_url} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #e0e0e0" }} />
                  : <div style={{ ...s.personInitial, width: 52, height: 52, fontSize: "1.3rem", flexShrink: 0 }}>{p.first_name?.charAt(0)}</div>
                }
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#1b5e20" }}>{pName(p)}</div>
                  {p.nickname && <div style={{ fontSize: "0.75rem", color: "#888", fontStyle: "italic" }}>"{p.nickname}"</div>}
                  <div style={{ fontSize: "0.7rem", color: "#aaa", marginTop: 2 }}>
                    {p.gender && <span style={{ textTransform: "capitalize" }}>{p.gender}</span>}
                    {p.dob && <span> · Born {new Date(p.dob).getFullYear()}</span>}
                    {p.mobile && <span> · {p.mobile}</span>}
                    <span> · #{p.id}</span>
                  </div>
                </div>
              </div>
              <button
                style={s.thisIsMeBtn}
                onClick={() => claimPerson(p)}
                disabled={claimLoading}
              >
                ✓ This is Me
              </button>
            </div>
          ))}
        </div>
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
        <h2 style={s.title}>{claimMode ? "🔗 Link & Update My Profile" : "✏️ Edit Details"}</h2>
        <div style={s.titleSub}>{claimMode ? "माझा प्रोफाइल जोडा · Requires approval" : "माहिती बदला · Requires approval"}</div>
      </div>
      <form onSubmit={submitEditPerson} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <button type="button" style={s.backLink} onClick={claimMode ? () => setView("claimSearch") : () => setView(editReturnView)}>← Back</button>

        {claimMode ? (
          <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 10, padding: "10px 14px", fontSize: "0.78rem", color: "#1b5e20", fontWeight: 600 }}>
            🔗 Claiming: <strong>{pName(editTarget)}</strong> — review your details, make any corrections, then submit. Admin will link this profile to your account.
          </div>
        ) : (
          <div style={{ background: "#fff3e0", border: "1px solid #ffcc80", borderRadius: 10, padding: "10px 14px", fontSize: "0.78rem", color: "#e65100", fontWeight: 600 }}>
            ✏️ Editing: <strong>{pName(editTarget)}</strong> — changes go live only after admin approval.
          </div>
        )}

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
          {submitting ? "⏳ Submitting…" : "📤 Submit Edit Request · बदल सादर करा"}
        </button>
      </form>
    </div>
  );

  return null;
}

/* ── Reusable relation row (used in addPerson and myProfile) ── */
function RelationRow({ idx, rel, photo, searchQuery, searchResults,
                       onRelChange, onPhotoChange, onRemove,
                       onSearch, onPickExisting, onClearExisting }) {
  return (
    <div style={s.relCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <select style={{ ...inp, flex: 1, marginRight: 8 }} value={rel.relation_type}
          onChange={e => onRelChange("relation_type", e.target.value)}>
          {RELATIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <button type="button" onClick={onRemove}
          style={{ background: "#fdecea", border: "none", color: "#c62828", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: "0.8rem" }}>✕</button>
      </div>

      {rel.existing_person_id ? (
        <div style={s.existingPickCard}>
          {rel.existing_person_photo
            ? <img src={rel.existing_person_photo} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            : <div style={{ ...s.personInitial, width: 40, height: 40, flexShrink: 0 }}>{rel.existing_person_name?.charAt(0)}</div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rel.existing_person_name}</div>
            <div style={{ fontSize: "0.65rem", color: "#2e7d32", fontWeight: 700 }}>✓ Existing person · #{rel.existing_person_id}</div>
          </div>
          <button type="button" style={s.changePick} onClick={onClearExisting}>× Change</button>
        </div>
      ) : (
        <>
          <div style={{ position: "relative", marginBottom: 6 }}>
            <input style={{ ...inp, textTransform: "none" }}
              placeholder="🔍 Search existing person in village tree..."
              value={searchQuery || ""}
              onChange={e => onSearch(e.target.value)}
            />
            {(searchResults || []).length > 0 && (
              <div style={s.relMatchDrop}>
                {searchResults.map(m => (
                  <button key={m.id} type="button" style={s.relMatchItem}
                    onClick={() => onPickExisting(m)}>
                    {m.photo_url
                      ? <img src={m.photo_url} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                      : <div style={{ ...s.personInitial, width: 32, height: 32, fontSize: "0.75rem", flexShrink: 0 }}>{m.first_name?.charAt(0)}</div>}
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.8rem" }}>{[m.first_name, m.middle_name, m.last_name].filter(Boolean).join(" ")}</div>
                      {m.nickname && <div style={{ fontSize: "0.65rem", color: "#888" }}>"{m.nickname}"</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ fontSize: "0.67rem", color: "#bbb", textAlign: "center", marginBottom: 8 }}>— or enter new person details —</div>
          <PhotoPicker current={null} file={photo} onChange={onPhotoChange} />
          <PersonFields data={rel} setField={onRelChange} />
        </>
      )}
    </div>
  );
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
      <div style={g2}>
        <Field label="Gender" show={showLabels}>
          <select style={inp} value={data.gender} onChange={e => setField("gender", e.target.value)}>
            <option value="">— Select Gender —</option>
            {GENDERS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Status" show={showLabels}>
          <select style={inp} value={data.is_deceased ? "deceased" : "alive"}
            onChange={e => setField("is_deceased", e.target.value === "deceased")}>
            <option value="alive">✅ Alive / जिवंत</option>
            <option value="deceased">✝ Deceased / दिवंगत</option>
          </select>
        </Field>
      </div>
      <Field label="Notes (Optional)" show={showLabels}>
        <textarea style={ta} rows={2} placeholder="Additional notes about this person (optional)..."
          value={data.notes || ""}
          onChange={e => setField("notes", e.target.value)} />
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
  dupeWarn:        { background: "#f3e5f5", border: "1.5px solid #ce93d8", borderRadius: 12, padding: "0.9rem", marginBottom: 4 },
  dupeRow:         { display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #e1bee7", borderRadius: 8, padding: "7px 10px" },
  existingPickCard:{ display: "flex", alignItems: "center", gap: 10, background: "#e8f5e9", border: "1.5px solid #a5d6a7", borderRadius: 10, padding: "10px 12px" },
  changePick:      { background: "none", border: "1px solid #bdbdbd", color: "#757575", borderRadius: 6, padding: "4px 8px", fontSize: "0.72rem", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" },
  relMatchDrop:    { position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1.5px solid #c8e6c9", borderRadius: 10, zIndex: 100, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", overflow: "hidden", marginTop: 2 },
  relMatchItem:    { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", border: "none", background: "none", cursor: "pointer", borderBottom: "1px solid #f5f5f5", textAlign: "left" },
  claimBtn:        { display: "flex", alignItems: "center", gap: 12, background: "linear-gradient(135deg,#1565c0,#42a5f5)", color: "#fff", border: "none", borderRadius: 14, padding: "1rem 1.1rem", cursor: "pointer", textAlign: "left", boxShadow: "0 3px 12px rgba(21,101,192,0.25)" },
  findBtn:         { background: "#e3f2fd", color: "#1565c0", border: "none", borderRadius: 10, padding: "12px 14px", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", whiteSpace: "nowrap" },
  claimCard:       { background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 14, padding: "1rem", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" },
  thisIsMeBtn:     { background: "linear-gradient(135deg,#1b5e20,#4caf50)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 14px", fontWeight: 800, fontSize: "0.8rem", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(76,175,80,0.3)" },
};

const lbl = { fontSize: "0.73rem", fontWeight: 700, color: "#555", display: "block", marginBottom: 4 };
const inp = { width: "100%", height: 38, border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "0 10px", fontSize: "0.85rem", outline: "none", background: "#fafafa", boxSizing: "border-box", textTransform: "uppercase" };
const ta  = { width: "100%", border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "8px 10px", fontSize: "0.82rem", outline: "none", background: "#fafafa", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit", lineHeight: 1.4 };
const g2  = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 };
