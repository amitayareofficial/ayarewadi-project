import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const API = "https://ayarewadi-project.onrender.com";

const EVENT_CATEGORIES  = ["General", "Festival", "Meeting", "Sports", "Cultural", "Health"];
const GALLERY_CATS      = ["Sports","Ravalnath Temple","Meetings","Village Festivals","Mumbai Meeting","Ganesh Chaturthi","Gudhi Padwa","Shimga (Holi)"];
const EMERGENCY_TYPES   = ["Hospital", "Police", "School", "Government"];

// ── Helper: get stored token ──────────────────────────────
const getToken = () => localStorage.getItem("admin_token");
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [tab, setTab] = useState("events"); // events | gallery | budget | emergency | announcements | blog | members | marquee

  const logout = () => { localStorage.removeItem("admin_token"); setLoggedIn(false); };

  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;

  return (
    <div className="admin-wrap">
      {/* ADMIN SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand">⚙️ Admin Panel</div>
        {[
          { id: "events",        icon: "📅", label: "Events" },
          { id: "announcements", icon: "📢", label: "Announcements" },
          { id: "gallery",       icon: "🖼️", label: "Gallery" },
          { id: "budget",        icon: "💰", label: "Budget" },
          { id: "emergency",     icon: "🏘️", label: "Help & Services" },
          { id: "blog",          icon: "📝", label: "Blog" },
          { id: "medical",       icon: "💊", label: "Medical" },
          { id: "members",       icon: "👥", label: "Members" },
          { id: "marquee",       icon: "🎞️", label: "Marquee" },
          { id: "gram_members",  icon: "🏘️", label: "Members Page" },
        ].map(t => (
          <button key={t.id} className={`admin-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
        <button className="admin-logout" onClick={logout}>🚪 Logout</button>
      </aside>

      {/* ADMIN CONTENT */}
      <main className="admin-content">
        {tab === "events"        && <AdminEvents />}
        {tab === "announcements" && <AdminAnnouncements />}
        {tab === "gallery"       && <AdminGallery />}
        {tab === "budget"        && <AdminBudget />}
        {tab === "emergency"     && <AdminHelpServices />}
        {tab === "blog"          && <AdminBlog />}
        {tab === "medical"       && <AdminMedical />}
        {tab === "members"       && <AdminMembers />}
        {tab === "marquee"       && <AdminMarquee />}
        {tab === "gram_members"  && <AdminGramMembers />}
      </main>
    </div>
  );
}

/* ── LOGIN ───────────────────────────────────────────────── */
function AdminLogin({ onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  const login = async () => {
    try {
      const res = await axios.post(`${API}/admin/login`, { username: u, password: p });
      localStorage.setItem("admin_token", res.data.token);
      onLogin();
    } catch {
      setErr("Invalid username or password");
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-box">
        <h2>⚙️ Admin Login</h2>
        <p>Ayarewadi Village Portal</p>
        <input placeholder="Username" value={u} onChange={e => setU(e.target.value)} />
        <input type="password" placeholder="Password" value={p}
          onChange={e => setP(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
        {err && <p className="err">{err}</p>}
        <button onClick={login}>Login</button>
      </div>
    </div>
  );
}

/* ── EVENTS MANAGER ──────────────────────────────────────── */
function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [form, setForm]     = useState({ title: "", description: "", date: "", category: "General", is_marquee: false });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState("");
  const [confirmId, setConfirmId] = useState(null);

  const load = () => axios.get(`${API}/events`).then(r => setEvents(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const save = async () => {
    if (!form.title.trim()) return showToast("Title is required.");
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`${API}/events/${editing}`, form, { headers: authHeader() });
        setEditing(null);
        showToast("Event updated.");
      } else {
        await axios.post(`${API}/events`, form, { headers: authHeader() });
        showToast("Event added.");
      }
      setForm({ title: "", description: "", date: "", category: "General", is_marquee: false });
      load();
    } catch { showToast("Error saving event. Please try again."); }
    finally { setSaving(false); }
  };

  const del = async id => {
    try {
      await axios.delete(`${API}/events/${id}`, { headers: authHeader() });
      setConfirmId(null);
      showToast("Event deleted.");
      load();
    } catch { showToast("Error deleting event."); }
  };

  const edit = ev => {
    setEditing(ev.id);
    setForm({ title: ev.title, description: ev.description, date: ev.date?.split("T")[0], category: ev.category, is_marquee: ev.is_marquee });
  };

  return (
    <div className="admin-section">
      <h2>📅 Manage Events</h2>
      {toast && <div className="admin-toast">{toast}</div>}

      {/* FORM */}
      <div className="admin-form">
        <h3>{editing ? "✏️ Edit Event" : "➕ Add Event"}</h3>
        <input placeholder="Event title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
        <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
          {EVENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <label className="checkbox-label">
          <input type="checkbox" checked={form.is_marquee}
            onChange={e => setForm({...form, is_marquee: e.target.checked})} />
          Show in ticker/marquee
        </label>
        <div className="form-btns">
          <button className="btn-save" onClick={save} disabled={saving}>{saving ? "Saving…" : editing ? "Update" : "Add Event"}</button>
          {editing && <button className="btn-cancel" onClick={() => { setEditing(null); setForm({ title:"",description:"",date:"",category:"General",is_marquee:false }); }}>Cancel</button>}
        </div>
      </div>

      {/* LIST */}
      <div className="admin-list">
        {events.map(ev => (
          <div className="admin-item" key={ev.id}>
            <div>
              <strong>{ev.title}</strong>
              <span className="item-meta">{ev.date?.split("T")[0]} · {ev.category}</span>
              {ev.is_marquee && <span className="badge-ticker">📢 Ticker</span>}
              <p>{ev.description}</p>
            </div>
            <div className="item-btns">
              <button className="btn-edit" onClick={() => edit(ev)}>✏️ Edit</button>
              {confirmId === ev.id
                ? <span className="inline-confirm">
                    Sure?&nbsp;
                    <button className="btn-del" onClick={() => del(ev.id)}>Yes</button>&nbsp;
                    <button className="btn-cancel" onClick={() => setConfirmId(null)}>No</button>
                  </span>
                : <button className="btn-del" onClick={() => setConfirmId(ev.id)}>🗑️ Delete</button>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── ANNOUNCEMENTS (MARQUEE) ─────────────────────────────── */
function AdminAnnouncements() {
  const [list, setList] = useState([]);
  const [text, setText] = useState("");

  const load = () => axios.get(`${API}/announcements`).then(r => setList(r.data));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!text.trim()) return;
    try {
      await axios.post(`${API}/announcements`, { text }, { headers: authHeader() });
      setText(""); load();
    } catch { /* silent — list stays unchanged */ }
  };

  const del = async id => {
    try {
      await axios.delete(`${API}/announcements/${id}`, { headers: authHeader() });
      load();
    } catch { /* silent */ }
  };

  return (
    <div className="admin-section">
      <h2>📢 Manage Announcements (Marquee Ticker)</h2>
      <div className="admin-form">
        <h3>➕ Add Announcement</h3>
        <input placeholder="Announcement text (Marathi or English)" value={text}
          onChange={e => setText(e.target.value)} />
        <button className="btn-save" onClick={add}>Add</button>
      </div>
      <div className="admin-list">
        {list.map(a => (
          <div className="admin-item" key={a.id}>
            <p>📣 {a.text}</p>
            <button className="btn-del" onClick={() => del(a.id)}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── GALLERY MANAGER ─────────────────────────────────────── */
function AdminGallery() {
  const [photos, setPhotos]     = useState([]);
  const [file, setFile]         = useState(null);
  const [caption, setCaption]   = useState("");
  const [category, setCategory] = useState("Village Festivals");
  const [year, setYear]         = useState(String(new Date().getFullYear()));
  const [uploading, setUploading] = useState(false);
  const [filterCat, setFilterCat] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [toast, setToast]       = useState("");
  const [confirmId, setConfirmId] = useState(null);

  const YEARS = Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - i));

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = () => {
    const params = [];
    if (filterYear) params.push(`year=${filterYear}`);
    if (filterCat)  params.push(`category=${encodeURIComponent(filterCat)}`);
    const qs = params.length ? "?" + params.join("&") : "";
    axios.get(`${API}/gallery${qs}`).then(r => setPhotos(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, [filterCat, filterYear]);

  const upload = async () => {
    if (!file) return showToast("Please select a photo first.");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      fd.append("caption", caption);
      fd.append("category", category);
      fd.append("year", year);
      await axios.post(`${API}/gallery/upload`, fd, { headers: { ...authHeader(), "Content-Type": "multipart/form-data" } });
      setFile(null); setCaption("");
      showToast("Photo uploaded successfully.");
      load();
    } catch { showToast("Upload failed. Please try again."); }
    finally { setUploading(false); }
  };

  const del = async id => {
    try {
      await axios.delete(`${API}/gallery/${id}`, { headers: authHeader() });
      setConfirmId(null);
      showToast("Photo deleted.");
      load();
    } catch { showToast("Error deleting photo."); }
  };

  return (
    <div className="admin-section">
      <h2>🖼️ Manage Gallery</h2>
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-form">
        <h3>📷 Upload Photo</h3>
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
        <input placeholder="Caption (optional)" value={caption} onChange={e => setCaption(e.target.value)} />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {GALLERY_CATS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={year} onChange={e => setYear(e.target.value)}>
          {YEARS.map(y => <option key={y}>{y}</option>)}
        </select>
        <button className="btn-save" onClick={upload} disabled={uploading}>
          {uploading ? "Uploading…" : "Upload to Cloudinary"}
        </button>
      </div>

      {/* FILTER */}
      <div className="filter-row">
        <span>Year:</span>
        <button className={!filterYear ? "active" : ""} onClick={() => setFilterYear("")}>All</button>
        {YEARS.map(y => (
          <button key={y} className={filterYear === y ? "active" : ""} onClick={() => setFilterYear(y)}>{y}</button>
        ))}
      </div>
      <div className="filter-row" style={{ marginTop: 6 }}>
        <span>Category:</span>
        <button className={!filterCat ? "active" : ""} onClick={() => setFilterCat("")}>All</button>
        {GALLERY_CATS.map(c => (
          <button key={c} className={filterCat === c ? "active" : ""} onClick={() => setFilterCat(c)}>{c}</button>
        ))}
      </div>

      {/* PHOTO GRID */}
      <div className="admin-gallery-grid">
        {photos.map(p => (
          <div className="admin-photo" key={p.id}>
            <img src={p.thumbnail_url || p.url} alt={p.caption || p.category} loading="lazy" />
            <div className="photo-info">
              <small>{p.year ? `${p.year} · ` : ""}{p.category}</small>
              <p>{p.caption}</p>
              {confirmId === p.id
                ? <span className="inline-confirm">
                    Sure?&nbsp;
                    <button className="btn-del" onClick={() => del(p.id)}>Yes</button>&nbsp;
                    <button className="btn-cancel" onClick={() => setConfirmId(null)}>No</button>
                  </span>
                : <button className="btn-del" onClick={() => setConfirmId(p.id)}>🗑️ Delete</button>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── BUDGET MANAGER ──────────────────────────────────────── */
function AdminBudget() {
  const [entries, setEntries] = useState([]);
  const [form, setForm]       = useState({ description: "", type: "income", amount: "", month: "" });

  const load = () => axios.get(`${API}/budget`, { headers: authHeader() }).then(r => setEntries(r.data));
  useEffect(() => { load(); }, []);

  const add = async () => {
    try {
      await axios.post(`${API}/budget`, form, { headers: authHeader() });
      setForm({ description: "", type: "income", amount: "", month: "" });
      load();
    } catch { /* silent */ }
  };

  const del = async id => {
    try {
      await axios.delete(`${API}/budget/${id}`, { headers: authHeader() });
      load();
    } catch { /* silent */ }
  };

  // Calculate balance
  const balance = entries.reduce((acc, e) =>
    e.type === "income" ? acc + Number(e.amount) : acc - Number(e.amount), 0);

  return (
    <div className="admin-section">
      <h2>💰 Manage Budget</h2>

      {/* BALANCE */}
      <div className="balance-display">
        <span>Current Balance</span>
        <strong style={{color: balance >= 0 ? "#2e7d32" : "#c62828"}}>
          ₹{balance.toLocaleString()}
        </strong>
      </div>

      {/* FORM */}
      <div className="admin-form">
        <h3>➕ Add Entry</h3>
        <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input type="number" placeholder="Amount in ₹" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
        <input placeholder="Month (e.g. June 2025)" value={form.month} onChange={e => setForm({...form, month: e.target.value})} />
        <button className="btn-save" onClick={add}>Add Entry</button>
      </div>

      {/* LIST */}
      <div className="admin-list">
        {entries.map(e => (
          <div className="admin-item" key={e.id}>
            <div>
              <strong>{e.description}</strong>
              <span className="item-meta">{e.month}</span>
              <span className={`tag ${e.type}`}>{e.type}</span>
              <span style={{fontWeight:700, marginLeft:"8px"}}>₹{Number(e.amount).toLocaleString()}</span>
            </div>
            <button className="btn-del" onClick={() => del(e.id)}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── HELP & SERVICES MANAGER ─────────────────────────────── */
const SRV_CATS = [
  { id: "emergency",  label: "🚨 Emergency Contacts" },
  { id: "government", label: "🏛️ Government Offices",  subs: ["Talathi", "Gram Panchayat", "Police", "Revenue Office", "Forest Office", "Other"] },
  { id: "education",  label: "🎓 Schools & Education", subs: ["Primary School", "High School", "College", "Coaching", "Other"] },
  { id: "business",   label: "🏪 Local Businesses",    subs: ["Shop", "Restaurant", "Transport", "Agriculture", "Contractor", "Other"] },
  { id: "important",  label: "📌 Important Contacts",  subs: [] },
];
const EMPTY_SRV = {
  category: "government", subcategory: "", name: "", phone: "",
  address: "", maps_url: "", website: "", description: "", timing: "", image_url: "", display_order: "0",
};

function AdminHelpServices() {
  const [items, setItems]         = useState([]);
  const [catFilter, setCatFilter] = useState("government");
  const [form, setForm]           = useState(EMPTY_SRV);
  const [editing, setEditing]     = useState(null);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast]         = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [imgFile, setImgFile]     = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const imgInputRef = useRef(null);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const load = (cat = catFilter) =>
    axios.get(`${API}/services?category=${cat}`, { headers: authHeader() })
      .then(r => setItems(r.data)).catch(() => {});

  useEffect(() => { load(catFilter); }, [catFilter]);

  const activeCat = SRV_CATS.find(c => c.id === catFilter);

  const handleImgSelect = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const handleImgRemove = e => {
    e.stopPropagation();
    setImgFile(null);
    setImgPreview("");
    f("image_url", "");
    if (imgInputRef.current) imgInputRef.current.value = "";
  };

  const save = async () => {
    if (!form.name.trim()) return showToast("Name is required.");
    setSaving(true);
    try {
      let imageUrl = form.image_url;
      if (imgFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("image", imgFile);
        const r = await axios.post(`${API}/services/upload-image`, fd, {
          headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
        });
        imageUrl = r.data.url;
        setUploading(false);
      }
      const payload = { ...form, image_url: imageUrl, display_order: Number(form.display_order) || 0 };
      if (editing) {
        await axios.put(`${API}/services/${editing}`, payload, { headers: authHeader() });
        setEditing(null); showToast("Updated.");
      } else {
        await axios.post(`${API}/services`, payload, { headers: authHeader() });
        showToast("Entry added.");
      }
      setForm({ ...EMPTY_SRV, category: catFilter });
      setImgFile(null); setImgPreview("");
      load(catFilter);
    } catch { showToast("Error saving."); }
    finally { setSaving(false); setUploading(false); }
  };

  const del = async id => {
    try {
      await axios.delete(`${API}/services/${id}`, { headers: authHeader() });
      setConfirmId(null); showToast("Deleted."); load(catFilter);
    } catch { showToast("Delete failed."); }
  };

  const edit = item => {
    setEditing(item.id);
    setForm({
      category: item.category, subcategory: item.subcategory || "",
      name: item.name, phone: item.phone || "", address: item.address || "",
      maps_url: item.maps_url || "", website: item.website || "",
      description: item.description || "", timing: item.timing || "",
      image_url: item.image_url || "", display_order: String(item.display_order ?? 0),
    });
    setImgFile(null);
    setImgPreview(item.image_url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="admin-section">
      <h2>🏘️ Help &amp; Services</h2>
      {toast && <div className="admin-toast">{toast}</div>}

      {/* Category selector */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {SRV_CATS.map(c => (
          <button key={c.id}
            onClick={() => { setCatFilter(c.id); setEditing(null); setForm({ ...EMPTY_SRV, category: c.id }); }}
            style={{
              padding: "7px 16px", borderRadius: 99, fontSize: "0.82rem", fontWeight: 600,
              cursor: "pointer", border: "1.5px solid",
              background: catFilter === c.id ? "#2e7d32" : "#f4f3f1",
              color: catFilter === c.id ? "#fff" : "#555",
              borderColor: catFilter === c.id ? "#2e7d32" : "#ddd",
            }}
          >{c.label}</button>
        ))}
      </div>

      {/* Form */}
      <div className="admin-form">
        <h3>{editing ? "✏️ Edit Entry" : `➕ Add to ${activeCat?.label || catFilter}`}</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>Name *</label>
            <input placeholder="Office / school / business name" value={form.name} onChange={e => f("name", e.target.value)} />
          </div>
          {activeCat?.subs?.length > 0 ? (
            <div>
              <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>Sub-category</label>
              <select value={form.subcategory} onChange={e => f("subcategory", e.target.value)}>
                <option value="">— Select —</option>
                {activeCat.subs.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>Sub-category (optional)</label>
              <input placeholder="e.g. Ward Office, Sub-branch" value={form.subcategory} onChange={e => f("subcategory", e.target.value)} />
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>Phone</label>
            <input placeholder="Phone number" value={form.phone} onChange={e => f("phone", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>Timing / Hours</label>
            <input placeholder="e.g. Mon–Fri 10am–5pm" value={form.timing} onChange={e => f("timing", e.target.value)} />
          </div>
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>Address</label>
          <input placeholder="Full address" value={form.address} onChange={e => f("address", e.target.value)} />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>Description (optional)</label>
          <textarea placeholder="Brief description of services offered" value={form.description}
            onChange={e => f("description", e.target.value)} style={{ minHeight: 60, resize: "vertical" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>Google Maps URL</label>
            <input placeholder="https://maps.google.com/?q=..." value={form.maps_url} onChange={e => f("maps_url", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>Website URL (optional)</label>
            <input placeholder="https://..." value={form.website} onChange={e => f("website", e.target.value)} />
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 6 }}>
            Photo (optional)
          </label>
          <div
            className={`blog-img-upload-box${(imgPreview || form.image_url) ? " has-image" : ""}`}
            style={{ minHeight: 110 }}
            onClick={() => !(imgPreview || form.image_url) && imgInputRef.current?.click()}
          >
            {(imgPreview || form.image_url) ? (
              <>
                <img
                  src={imgPreview || form.image_url}
                  alt="Preview"
                  className="blog-img-upload-preview"
                  style={{ height: 110, objectFit: "cover" }}
                />
                <div className="blog-img-upload-overlay">
                  <button className="blog-img-change" type="button"
                    onClick={e => { e.stopPropagation(); imgInputRef.current?.click(); }}>
                    🔄 Change
                  </button>
                  <button className="blog-img-remove" type="button" onClick={handleImgRemove}>
                    ✕ Remove
                  </button>
                </div>
                {uploading && <div className="blog-img-uploading">Uploading…</div>}
              </>
            ) : (
              <div className="blog-img-placeholder">
                <span className="blog-img-icon">🖼️</span>
                <span className="blog-img-label">Click to upload photo</span>
                <span className="blog-img-hint">JPG, PNG, WebP</span>
              </div>
            )}
            <input
              ref={imgInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImgSelect}
            />
          </div>
          {/* Fallback: paste URL directly */}
          <input
            placeholder="Or paste image URL directly"
            value={imgPreview ? "" : form.image_url}
            onChange={e => { f("image_url", e.target.value); setImgPreview(""); setImgFile(null); }}
            style={{ marginTop: 6, fontSize: "0.8rem" }}
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>Display Order</label>
          <input type="number" min={0} value={form.display_order} onChange={e => f("display_order", e.target.value)} style={{ width: 100 }} />
        </div>

        <div className="form-btns">
          <button className="btn-save" onClick={save} disabled={saving || uploading}>
            {uploading ? "Uploading image…" : saving ? "Saving…" : editing ? "Update" : "Add Entry"}
          </button>
          {editing && (
            <button className="btn-cancel" onClick={() => {
              setEditing(null);
              setForm({ ...EMPTY_SRV, category: catFilter });
              setImgFile(null); setImgPreview("");
            }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>
          {items.length} entr{items.length !== 1 ? "ies" : "y"} in {activeCat?.label}
        </h3>
      </div>

      <div className="admin-list">
        {items.length === 0 && (
          <p style={{ color: "#aaa", textAlign: "center", padding: "20px 0" }}>
            No entries yet. Add one above.
          </p>
        )}
        {items.map(item => (
          <div className="admin-item" key={item.id} style={{ alignItems: "flex-start", gap: 14 }}>
            {item.image_url && (
              <img src={item.image_url} alt={item.name}
                style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", border: "1px solid #e0e0e0", flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <strong>{item.name}</strong>
                {item.subcategory && (
                  <span style={{ background: "#e8f5e9", color: "#2e7d32", border: "1px solid #c8e6c9", borderRadius: 20, padding: "1px 10px", fontSize: "0.7rem", fontWeight: 700 }}>
                    {item.subcategory}
                  </span>
                )}
                <span style={{ fontSize: "0.72rem", color: "#999" }}>Order: {item.display_order ?? 0}</span>
              </div>
              {item.description   && <div className="item-meta">📝 {item.description}</div>}
              {item.phone         && <div className="item-meta">📞 {item.phone}</div>}
              {item.timing        && <div className="item-meta">🕐 {item.timing}</div>}
              {item.address       && <div className="item-meta">📍 {item.address}</div>}
              {item.maps_url      && <a href={item.maps_url} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem", color: "#1565c0", marginTop: 4, display: "inline-block" }}>🗺️ Maps</a>}
            </div>
            <div className="item-btns">
              <button className="btn-edit" onClick={() => edit(item)}>✏️ Edit</button>
              {confirmId === item.id
                ? <span className="inline-confirm">
                    Sure?&nbsp;
                    <button className="btn-del" onClick={() => del(item.id)}>Yes</button>&nbsp;
                    <button className="btn-cancel" onClick={() => setConfirmId(null)}>No</button>
                  </span>
                : <button className="btn-del" onClick={() => setConfirmId(item.id)}>🗑️</button>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── EMERGENCY MANAGER (kept for reference) ──────────────── */
function AdminEmergency() {
  const [list, setList]   = useState([]);
  const [form, setForm]   = useState({ name: "", type: "Hospital", phone: "", address: "", maps_url: "", emergency_contact: "" });
  const [editing, setEditing] = useState(null);


  const load = () => axios.get(`${API}/emergency`).then(r => setList(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editing) {
        await axios.put(`${API}/emergency/${editing}`, form, { headers: authHeader() });
        setEditing(null);
      } else {
        await axios.post(`${API}/emergency`, form, { headers: authHeader() });
      }
      setForm({ name: "", type: "Hospital", phone: "", address: "", maps_url: "", emergency_contact: "" });
      load();
    } catch { /* silent */ }
  };

  const del = async id => {
    try {
      await axios.delete(`${API}/emergency/${id}`, { headers: authHeader() });
      load();
    } catch { /* silent */ }
  };

  const edit = item => {
    setEditing(item.id);
    setForm({ name: item.name, type: item.type, phone: item.phone||"", address: item.address||"", maps_url: item.maps_url||"", emergency_contact: item.emergency_contact||"" });
  };

  return (
    <div className="admin-section">
      <h2>🚨 Manage Emergency Contacts</h2>

      <div className="admin-form">
        <h3>{editing ? "✏️ Edit Contact" : "➕ Add Contact"}</h3>
        <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
          {EMERGENCY_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        <input placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
        <input placeholder="Google Maps URL" value={form.maps_url} onChange={e => setForm({...form, maps_url: e.target.value})} />
        <input placeholder="Emergency contact name" value={form.emergency_contact} onChange={e => setForm({...form, emergency_contact: e.target.value})} />
        <div className="form-btns">
          <button className="btn-save" onClick={save}>{editing ? "Update" : "Add"}</button>
          {editing && <button className="btn-cancel" onClick={() => setEditing(null)}>Cancel</button>}
        </div>
      </div>

      <div className="admin-list">
        {list.map(item => (
          <div className="admin-item" key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <span className="item-meta">{item.type} · {item.phone}</span>
              <p>{item.address}</p>
            </div>
            <div className="item-btns">
              <button className="btn-edit" onClick={() => edit(item)}>✏️</button>
              <button className="btn-del"  onClick={() => del(item.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
/* ── MEMBERS MANAGER ─────────────────────────────────── */
const STATUS_STYLE = {
  pending:  { bg:"#fff8e1", color:"#e65100", border:"#ffe082",  label:"⏳ Pending"  },
  approved: { bg:"#e8f5e9", color:"#2e7d32", border:"#c8e6c9",  label:"✅ Approved" },
  rejected: { bg:"#ffebee", color:"#c62828", border:"#ffcdd2",  label:"❌ Rejected" },
};

function AdminMembers() {
  const [members,   setMembers]   = useState([]);
  const [filter,    setFilter]    = useState("pending");
  const [toast,     setToast]     = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [actionId,  setActionId]  = useState(null);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = () => {
    axios.get(`${API}/api/members/admin/all`, { headers: authHeader() })
      .then(r => setMembers(r.data))
      .catch(() => showToast("Failed to load members."));
  };
  useEffect(() => { load(); }, []);

  const approve = async id => {
    setActionId(id);
    try {
      await axios.put(`${API}/api/members/admin/${id}/approve`, {}, { headers: authHeader() });
      showToast("✅ Member approved. They can now login.");
      load();
    } catch { showToast("Failed to approve member."); }
    finally { setActionId(null); }
  };

  const reject = async id => {
    setActionId(id);
    try {
      await axios.put(`${API}/api/members/admin/${id}/reject`, {}, { headers: authHeader() });
      showToast("Member rejected.");
      load();
    } catch { showToast("Failed to reject member."); }
    finally { setActionId(null); setConfirmId(null); }
  };

  const remove = async id => {
    try {
      await axios.delete(`${API}/api/members/admin/${id}`, { headers: authHeader() });
      setConfirmId(null);
      showToast("Member deleted.");
      load();
    } catch { showToast("Failed to delete member."); }
  };

  const counts = {
    pending:  members.filter(m => m.status === "pending").length,
    approved: members.filter(m => m.status === "approved").length,
    rejected: members.filter(m => m.status === "rejected").length,
    all:      members.length,
  };

  const displayed = filter === "all" ? members : members.filter(m => m.status === filter);

  const tabs = [
    { id:"pending",  label:"⏳ Pending",  count: counts.pending  },
    { id:"approved", label:"✅ Approved", count: counts.approved },
    { id:"rejected", label:"❌ Rejected", count: counts.rejected },
    { id:"all",      label:"👥 All",      count: counts.all      },
  ];

  return (
    <div className="admin-section">
      <h2>👥 Member Management</h2>
      {toast && <div className="admin-toast">{toast}</div>}

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))", gap:10, marginBottom:"1.25rem" }}>
        {tabs.map(t => (
          <button key={t.id}
            onClick={() => setFilter(t.id)}
            style={{ background: filter===t.id?"#1b5e20":"#f9f9f9", color:filter===t.id?"#fff":"#333", border:`2px solid ${filter===t.id?"#1b5e20":"#e8e8e8"}`, borderRadius:10, padding:"10px 8px", cursor:"pointer", textAlign:"center", transition:"all 0.2s" }}
          >
            <div style={{ fontWeight:800, fontSize:"1.4rem" }}>{t.count}</div>
            <div style={{ fontSize:"0.72rem", marginTop:2 }}>{t.label}</div>
          </button>
        ))}
      </div>

      {displayed.length === 0 && (
        <p style={{ color:"#aaa", padding:"24px 0", textAlign:"center" }}>
          No {filter === "all" ? "" : filter} members found.
        </p>
      )}

      <div className="admin-list">
        {displayed.map(m => {
          const st = STATUS_STYLE[m.status] || STATUS_STYLE.pending;
          return (
            <div className="admin-item" key={m.id} style={{ alignItems:"flex-start", gap:14 }}>

              {/* Photo */}
              <div style={{ flexShrink:0 }}>
                {m.photo_url
                  ? <img src={m.photo_url} alt={m.full_name} style={{ width:56, height:56, borderRadius:"50%", objectFit:"cover", border:"2px solid #e0e0e0" }} />
                  : <div style={{ width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,#2e7d32,#81c784)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:"1.3rem" }}>
                      {m.full_name?.charAt(0)}
                    </div>
                }
              </div>

              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <strong style={{ fontSize:"0.98rem" }}>{m.full_name}</strong>
                  <span style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}`, borderRadius:20, padding:"1px 10px", fontSize:"0.7rem", fontWeight:700 }}>
                    {st.label}
                  </span>
                </div>
                <div className="item-meta" style={{ marginTop:2 }}>
                  📞 {m.mobile}{m.email ? ` · ${m.email}` : ""}
                </div>
                {m.address && (
                  <div style={{ fontSize:"0.78rem", color:"#888", marginTop:2 }}>📍 {m.address}</div>
                )}
                <div style={{ fontSize:"0.76rem", color:"#aaa", marginTop:3 }}>
                  DOB: {m.dob ? new Date(m.dob).toLocaleDateString("en-IN") : "—"} &nbsp;·&nbsp;
                  Registered: {new Date(m.created_at).toLocaleDateString("en-IN")}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
                {m.status === "pending" && (
                  <>
                    <button className="btn-save" disabled={actionId===m.id}
                      onClick={() => approve(m.id)}
                      style={{ fontSize:"0.8rem", padding:"6px 12px" }}>
                      ✅ Approve
                    </button>
                    {confirmId === m.id
                      ? <span className="inline-confirm" style={{ display:"flex", gap:4 }}>
                          Reject?&nbsp;
                          <button className="btn-del" onClick={() => reject(m.id)}>Yes</button>&nbsp;
                          <button className="btn-cancel" onClick={() => setConfirmId(null)}>No</button>
                        </span>
                      : <button className="btn-del" style={{ fontSize:"0.8rem", padding:"6px 12px" }}
                          onClick={() => setConfirmId(m.id)}>
                          ❌ Reject
                        </button>
                    }
                  </>
                )}
                {m.status === "approved" && (
                  <button className="btn-del" style={{ fontSize:"0.78rem", padding:"5px 10px" }}
                    onClick={() => reject(m.id)}>
                    Revoke
                  </button>
                )}
                {m.status === "rejected" && (
                  <button className="btn-save" style={{ fontSize:"0.78rem", padding:"5px 10px" }}
                    onClick={() => approve(m.id)}>
                    Re-approve
                  </button>
                )}
                <button style={{ background:"none", border:"none", color:"#bbb", fontSize:"0.72rem", cursor:"pointer", textAlign:"center" }}
                  onClick={() => remove(m.id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── MEDICAL MANAGER ─────────────────────────────────── */
const MEDICAL_TYPES = ["Hospital", "Clinic", "Pharmacy", "Laboratory", "Dental", "Eye Care", "Other"];
const EMPTY_MED = { name: "", type: "Hospital", phone: "", address: "", maps_url: "", specialist: "", working_hours: "", image_url: "" };

function AdminMedical() {
  const [list, setList]           = useState([]);
  const [form, setForm]           = useState(EMPTY_MED);
  const [editing, setEditing]     = useState(null);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast]         = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [imgFile, setImgFile]     = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const medImgRef = useRef(null);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = () =>
    axios.get(`${API}/medical`, { headers: authHeader() })
      .then(r => setList(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleImgSelect = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const handleImgRemove = e => {
    e.stopPropagation();
    setImgFile(null); setImgPreview("");
    f("image_url", "");
    if (medImgRef.current) medImgRef.current.value = "";
  };

  const save = async () => {
    if (!form.name.trim()) return showToast("Name is required.");
    setSaving(true);
    try {
      let imageUrl = form.image_url;
      if (imgFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("image", imgFile);
        const r = await axios.post(`${API}/services/upload-image`, fd, {
          headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
        });
        imageUrl = r.data.url;
        setUploading(false);
      }
      const payload = { ...form, image_url: imageUrl };
      if (editing) {
        await axios.put(`${API}/medical/${editing}`, payload, { headers: authHeader() });
        setEditing(null); showToast("Updated.");
      } else {
        await axios.post(`${API}/medical`, payload, { headers: authHeader() });
        showToast("Medical contact added.");
      }
      setForm(EMPTY_MED); setImgFile(null); setImgPreview(""); load();
    } catch { showToast("Error saving. Please try again."); }
    finally { setSaving(false); setUploading(false); }
  };

  const del = async id => {
    try {
      await axios.delete(`${API}/medical/${id}`, { headers: authHeader() });
      setConfirmId(null); showToast("Deleted."); load();
    } catch { showToast("Delete failed."); }
  };

  const edit = item => {
    setEditing(item.id);
    setForm({
      name: item.name, type: item.type || "Hospital",
      phone: item.phone || "", address: item.address || "",
      maps_url: item.maps_url || "", specialist: item.specialist || "",
      working_hours: item.working_hours || "", image_url: item.image_url || "",
    });
    setImgFile(null);
    setImgPreview(item.image_url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const TYPE_COLOR = {
    Hospital: "#e8f5e9", Clinic: "#e3f2fd", Pharmacy: "#fff8e1",
    Laboratory: "#f3e5f5", Dental: "#fce4ec", "Eye Care": "#e0f2f1", Other: "#f5f5f5",
  };

  return (
    <div className="admin-section">
      <h2>💊 Medical Contacts</h2>
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-form">
        <h3>{editing ? "✏️ Edit Contact" : "➕ Add Medical Contact"}</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>Name *</label>
            <input placeholder="Hospital / Clinic / Doctor name" value={form.name} onChange={e => f("name", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>Type</label>
            <select value={form.type} onChange={e => f("type", e.target.value)}>
              {MEDICAL_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>Phone</label>
            <input placeholder="Phone number" value={form.phone} onChange={e => f("phone", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>Specialist / Department</label>
            <input placeholder="e.g. General, Orthopedic" value={form.specialist} onChange={e => f("specialist", e.target.value)} />
          </div>
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>Address</label>
          <input placeholder="Full address" value={form.address} onChange={e => f("address", e.target.value)} />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>Working Hours</label>
          <input placeholder="e.g. Mon–Sat 9am–6pm" value={form.working_hours} onChange={e => f("working_hours", e.target.value)} />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>Google Maps URL</label>
          <input placeholder="https://maps.google.com/?q=..." value={form.maps_url} onChange={e => f("maps_url", e.target.value)} />
        </div>

        {/* Image upload */}
        <div>
          <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 6 }}>Photo (optional)</label>
          <div
            className={`blog-img-upload-box${(imgPreview || form.image_url) ? " has-image" : ""}`}
            style={{ minHeight: 110 }}
            onClick={() => !(imgPreview || form.image_url) && medImgRef.current?.click()}
          >
            {(imgPreview || form.image_url) ? (
              <>
                <img
                  src={imgPreview || form.image_url}
                  alt="Preview"
                  className="blog-img-upload-preview"
                  style={{ height: 110, objectFit: "cover" }}
                />
                <div className="blog-img-upload-overlay">
                  <button className="blog-img-change" type="button"
                    onClick={e => { e.stopPropagation(); medImgRef.current?.click(); }}>
                    🔄 Change
                  </button>
                  <button className="blog-img-remove" type="button" onClick={handleImgRemove}>
                    ✕ Remove
                  </button>
                </div>
                {uploading && <div className="blog-img-uploading">Uploading…</div>}
              </>
            ) : (
              <div className="blog-img-placeholder">
                <span className="blog-img-icon">🏥</span>
                <span className="blog-img-label">Click to upload photo</span>
                <span className="blog-img-hint">JPG, PNG, WebP</span>
              </div>
            )}
            <input
              ref={medImgRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImgSelect}
            />
          </div>
          <input
            placeholder="Or paste image URL directly"
            value={imgPreview ? "" : form.image_url}
            onChange={e => { f("image_url", e.target.value); setImgPreview(""); setImgFile(null); }}
            style={{ marginTop: 6, fontSize: "0.8rem" }}
          />
        </div>

        <div className="form-btns">
          <button className="btn-save" onClick={save} disabled={saving || uploading}>
            {uploading ? "Uploading image…" : saving ? "Saving…" : editing ? "Update" : "Add Contact"}
          </button>
          {editing && (
            <button className="btn-cancel" onClick={() => {
              setEditing(null); setForm(EMPTY_MED);
              setImgFile(null); setImgPreview("");
            }}>Cancel</button>
          )}
        </div>
      </div>

      <div className="admin-list">
        {list.length === 0 && <p style={{ color: "#aaa", textAlign: "center", padding: "20px 0" }}>No medical contacts yet.</p>}
        {list.map(item => (
          <div className="admin-item" key={item.id} style={{ alignItems: "flex-start", gap: 14 }}>

            {/* Photo */}
            {item.image_url && (
              <img src={item.image_url} alt={item.name}
                style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", border: "1px solid #e0e0e0", flexShrink: 0 }} />
            )}

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <strong style={{ fontSize: "0.95rem" }}>{item.name}</strong>
                <span style={{ background: TYPE_COLOR[item.type] || "#f5f5f5", border: "1px solid #ddd", borderRadius: 20, padding: "1px 10px", fontSize: "0.7rem", fontWeight: 700 }}>
                  {item.type}
                </span>
              </div>
              {item.specialist && <div className="item-meta">🩺 {item.specialist}</div>}
              {item.phone && <div className="item-meta">📞 {item.phone}</div>}
              {item.address && <div className="item-meta">📍 {item.address}</div>}
              {item.working_hours && <div className="item-meta">🕐 {item.working_hours}</div>}
              {item.maps_url && (
                <a href={item.maps_url} target="_blank" rel="noreferrer"
                  style={{ fontSize: "0.75rem", color: "#1565c0", marginTop: 4, display: "inline-block" }}>
                  🗺️ View on Maps
                </a>
              )}
            </div>

            {/* Actions */}
            <div className="item-btns">
              <button className="btn-edit" onClick={() => edit(item)}>✏️ Edit</button>
              {confirmId === item.id
                ? <span className="inline-confirm">
                    Sure?&nbsp;
                    <button className="btn-del" onClick={() => del(item.id)}>Yes</button>&nbsp;
                    <button className="btn-cancel" onClick={() => setConfirmId(null)}>No</button>
                  </span>
                : <button className="btn-del" onClick={() => setConfirmId(item.id)}>🗑️</button>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── BLOG MANAGER ────────────────────────────────────── */
const BLOG_CATS  = ["Village News", "Announcement", "Development", "Culture", "Health", "Education"];
const EMPTY_BLOG = { title: "", category: "Village News", content: "", cover_image: "", published: false };

function calcReadTime(content = "") {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
function stripMd(text = "") {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "").replace(/\[.*?\]\(.*?\)/g, "")
    .replace(/#{1,6}\s/g, "").replace(/[*_`>~]/g, "")
    .replace(/\n+/g, " ").trim();
}

function AdminBlog() {
  const [posts, setPosts]           = useState([]);
  const [form, setForm]             = useState(EMPTY_BLOG);
  const [editing, setEditing]       = useState(null);
  const [mdPreview, setMdPreview]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [toast, setToast]           = useState("");
  const [confirmId, setConfirmId]   = useState(null);
  const [search, setSearch]         = useState("");
  const [imgFile, setImgFile]       = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const imgInputRef = useRef(null);

  const readTime = useMemo(() => calcReadTime(form.content), [form.content]);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const load = () =>
    axios.get(`${API}/blog/all`, { headers: authHeader() })
      .then(r => setPosts(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  /* ── image handlers ── */
  const handleImgSelect = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };
  const handleImgRemove = e => {
    e.stopPropagation();
    setImgFile(null);
    setImgPreview("");
    setForm(f => ({ ...f, cover_image: "" }));
    if (imgInputRef.current) imgInputRef.current.value = "";
  };

  /* ── auto excerpt preview ── */
  const genExcerpt = () => {
    const plain = stripMd(form.content).slice(0, 150);
    if (!plain) return showToast("Write some content first.");
    showToast(`Excerpt: "${plain}"`);
  };

  /* ── save / update ── */
  const save = async () => {
    if (!form.title.trim() || !form.content.trim())
      return showToast("Title and content are required.");
    setSaving(true);
    try {
      let coverUrl = form.cover_image;
      if (imgFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("image", imgFile);
        const r = await axios.post(`${API}/blog/upload-image`, fd, {
          headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
        });
        coverUrl = r.data.url;
        setUploading(false);
      }
      const payload = { ...form, cover_image: coverUrl };
      if (editing) {
        await axios.put(`${API}/blog/${editing}`, payload, { headers: authHeader() });
        setEditing(null);
        showToast("Post updated.");
      } else {
        await axios.post(`${API}/blog`, payload, { headers: authHeader() });
        showToast("Post saved.");
      }
      setForm(EMPTY_BLOG);
      setImgFile(null); setImgPreview("");
      load();
    } catch { showToast("Error saving post. Please try again."); }
    finally { setSaving(false); setUploading(false); }
  };

  const del = async id => {
    try {
      await axios.delete(`${API}/blog/${id}`, { headers: authHeader() });
      setConfirmId(null); showToast("Post deleted."); load();
    } catch { showToast("Error deleting post."); }
  };

  const edit = post => {
    setEditing(post.id);
    setForm({ title: post.title, category: post.category, content: post.content, cover_image: post.cover_image || "", published: post.published });
    setImgFile(null);
    setImgPreview(post.cover_image || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditing(null); setForm(EMPTY_BLOG);
    setImgFile(null); setImgPreview("");
  };

  const toggleFeatured = async (id, cur) => {
    try {
      await axios.put(`${API}/blog/${id}/feature`, { is_featured: !cur }, { headers: authHeader() });
      showToast(cur ? "Removed from featured." : "⭐ Marked as featured.");
      load();
    } catch { showToast("Failed to update featured."); }
  };

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const imgDisplaySrc = imgPreview || form.cover_image;

  return (
    <div className="admin-section">
      <h2>📝 Manage Blog</h2>
      {toast && <div className="admin-toast">{toast}</div>}

      {/* ── FORM ─────────────────────────────────────── */}
      <div className="admin-form">
        <h3>{editing ? "✏️ Edit Post" : "➕ New Post"}</h3>

        <input
          placeholder="Post title *"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        />

        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
          {BLOG_CATS.map(c => <option key={c}>{c}</option>)}
        </select>

        {/* Cover image upload */}
        <div
          className={`blog-img-upload-box${imgDisplaySrc ? " has-image" : ""}`}
          onClick={() => !imgDisplaySrc && imgInputRef.current?.click()}
        >
          {imgDisplaySrc ? (
            <>
              <img src={imgDisplaySrc} alt="Cover" className="blog-img-upload-preview" />
              <div className="blog-img-upload-overlay">
                <button className="blog-img-change" type="button" onClick={e => { e.stopPropagation(); imgInputRef.current?.click(); }}>
                  🔄 Change
                </button>
                <button className="blog-img-remove" type="button" onClick={handleImgRemove}>
                  ✕ Remove
                </button>
              </div>
              {uploading && <div className="blog-img-uploading">Uploading to Cloudinary…</div>}
            </>
          ) : (
            <div className="blog-img-placeholder">
              <span className="blog-img-icon">🖼️</span>
              <span className="blog-img-label">Click to upload cover image</span>
              <span className="blog-img-hint">JPG, PNG, WebP · recommended 1200 × 630</span>
            </div>
          )}
          <input ref={imgInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImgSelect} />
        </div>

        {/* Markdown editor */}
        <div className="blog-editor-header">
          <span className="blog-editor-label">
            Content (Markdown)&nbsp;
            <span className="blog-readtime-badge">~{readTime} min read</span>
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="blog-btn-sm" type="button" onClick={genExcerpt}>✂️ Excerpt</button>
            <button className={`blog-btn-sm${mdPreview ? " active" : ""}`} type="button" onClick={() => setMdPreview(p => !p)}>
              {mdPreview ? "✏️ Edit" : "👁 Preview"}
            </button>
          </div>
        </div>

        {mdPreview ? (
          <div className="blog-preview-box">
            <ReactMarkdown>{form.content || "_Nothing to preview yet_"}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            className="blog-md-editor"
            placeholder={`Write in Markdown…\n\n## Heading\n\nParagraph text.\n\n- List item\n\n**Bold** and _italic_ supported.`}
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          />
        )}

        {/* Footer: toggle + save */}
        <div className="blog-form-footer">
          <label className="blog-toggle-label">
            <span className="blog-toggle-wrap">
              <input
                type="checkbox"
                className="blog-toggle-input"
                checked={form.published}
                onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
              />
              <span className="blog-toggle-track"><span className="blog-toggle-thumb" /></span>
            </span>
            <span className={`blog-toggle-text${form.published ? " published" : ""}`}>
              {form.published ? "Published" : "Draft"}
            </span>
          </label>

          <div className="form-btns" style={{ margin: 0 }}>
            <button className="btn-save" onClick={save} disabled={saving || uploading}>
              {uploading ? "Uploading image…" : saving ? "Saving…" : editing ? "Update Post" : "Save Post"}
            </button>
            {editing && <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>}
          </div>
        </div>
      </div>

      {/* ── SEARCH ─────────────────────────────────────── */}
      <div className="blog-search-row">
        <div className="blog-search-wrap">
          <span className="blog-search-icon">🔍</span>
          <input
            className="blog-search-input"
            placeholder="Search posts by title…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="blog-search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>
        <span className="blog-post-count">{filtered.length} post{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* ── POST LIST ──────────────────────────────────── */}
      <div className="blog-post-list">
        {filtered.length === 0 && (
          <p style={{ color: "#aaa", textAlign: "center", padding: "24px 0" }}>
            {search ? `No posts matching "${search}"` : "No blog posts yet."}
          </p>
        )}
        {filtered.map(post => (
          <div className="blog-post-row" key={post.id}>

            {/* Thumbnail */}
            <div className="blog-post-thumb-wrap">
              {post.cover_image
                ? <img src={post.cover_image} alt={post.title} className="blog-post-thumb" />
                : <div className="blog-post-thumb-empty">📝</div>
              }
            </div>

            {/* Info */}
            <div className="blog-post-row-info">
              <strong className="blog-post-row-title">{post.title}</strong>
              <div className="blog-post-row-badges">
                <span className="bl-badge-cat">{post.category}</span>
                <span className={`bl-badge-status ${post.published ? "pub" : "draft"}`}>
                  {post.published ? "● Published" : "○ Draft"}
                </span>
                <span className="bl-badge-readtime">{calcReadTime(post.content)} min read</span>
                {post.is_featured && <span className="bl-badge-featured">⭐ Featured</span>}
              </div>
              <p className="blog-post-row-excerpt">
                {stripMd(post.content).slice(0, 110)}…
              </p>
              <span className="blog-post-row-date">
                {new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>

            {/* Actions */}
            <div className="blog-post-row-actions">
              <button
                className={`blog-btn-feature${post.is_featured ? " active" : ""}`}
                onClick={() => toggleFeatured(post.id, post.is_featured)}
                title={post.is_featured ? "Remove featured" : "Mark as featured"}
              >
                {post.is_featured ? "⭐" : "☆"}
              </button>
              <button className="btn-edit" onClick={() => edit(post)}>✏️ Edit</button>
              {confirmId === post.id
                ? <span className="inline-confirm">
                    Sure?&nbsp;
                    <button className="btn-del" onClick={() => del(post.id)}>Yes</button>&nbsp;
                    <button className="btn-cancel" onClick={() => setConfirmId(null)}>No</button>
                  </span>
                : <button className="btn-del" onClick={() => setConfirmId(post.id)}>🗑️</button>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── MARQUEE MANAGEMENT ───────────────────────────────── */
function AdminMarquee() {
  const [members,  setMembers]  = useState([]);
  const [toast,    setToast]    = useState("");
  const [saving,   setSaving]   = useState(null);
  const [uploading,setUploading]= useState(null);
  const [editId,   setEditId]   = useState(null);
  const [editRole, setEditRole] = useState("");
  const [editOrder,setEditOrder]= useState("");
  const [preview,  setPreview]  = useState(false);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = () =>
    axios.get(`${API}/api/members/admin/marquee`, { headers: authHeader() })
      .then(r => setMembers(r.data))
      .catch(() => showToast("Failed to load members."));
  useEffect(() => { load(); }, []);

  const toggleVisible = async (id, cur) => {
    setSaving(id);
    try {
      await axios.put(
        `${API}/api/members/admin/marquee/${id}`,
        { show_in_marquee: !cur },
        { headers: authHeader() }
      );
      setMembers(prev => prev.map(m => m.id === id ? { ...m, show_in_marquee: !cur } : m));
      showToast(cur ? "Hidden from marquee." : "Now visible in marquee.");
    } catch { showToast("Update failed."); }
    finally { setSaving(null); }
  };

  const saveEdit = async id => {
    setSaving(id);
    try {
      const r = await axios.put(
        `${API}/api/members/admin/marquee/${id}`,
        { marquee_role: editRole.trim() || 'सदस्य', marquee_order: editOrder },
        { headers: authHeader() }
      );
      setMembers(prev => prev.map(m => m.id === id ? { ...m, ...r.data.member } : m));
      setEditId(null);
      showToast("Saved.");
    } catch { showToast("Save failed."); }
    finally { setSaving(null); }
  };

  const uploadPhoto = async (id, file) => {
    setUploading(id);
    const fd = new FormData();
    fd.append("photo", file);
    try {
      const r = await axios.put(
        `${API}/api/members/admin/marquee/${id}`,
        fd,
        { headers: { ...authHeader(), "Content-Type": "multipart/form-data" } }
      );
      setMembers(prev => prev.map(m => m.id === id ? { ...m, photo_url: r.data.member.photo_url } : m));
      showToast("Photo updated.");
    } catch { showToast("Photo upload failed."); }
    finally { setUploading(null); }
  };

  const move = async (idx, dir) => {
    const next = [...members];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    const order = next.map((m, i) => ({ id: m.id, marquee_order: i }));
    setMembers(next.map((m, i) => ({ ...m, marquee_order: i })));
    try {
      await axios.post(`${API}/api/members/admin/marquee/reorder`, { order }, { headers: authHeader() });
    } catch { showToast("Reorder failed."); load(); }
  };

  const visible = members.filter(m => m.show_in_marquee);

  return (
    <div className="admin-section">
      <h2>🎞️ Marquee Management</h2>
      {toast && <div className="admin-toast">{toast}</div>}

      {/* PREVIEW */}
      <div className="admin-form" style={{ padding: "16px 20px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>
            📺 Live Preview
            <span style={{ fontSize: "0.72rem", color: "#888", fontWeight: 400, marginLeft: 8 }}>
              {visible.length} member{visible.length !== 1 ? "s" : ""} visible
            </span>
          </h3>
          <button
            onClick={() => setPreview(p => !p)}
            style={{ padding: "5px 16px", fontSize: "0.8rem", borderRadius: 8, border: "none", cursor: "pointer",
              background: preview ? "#c62828" : "#2e7d32", color: "#fff", fontWeight: 600 }}
          >
            {preview ? "Close" : "Show Preview"}
          </button>
        </div>
        {preview && (
          <div className="admin-marquee-preview" style={{ marginTop: 14 }}>
            {visible.length === 0
              ? <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "10px 0", margin: 0, fontSize: "0.82rem" }}>
                  No visible members — enable some below.
                </p>
              : (
                <div className="admin-marquee-preview-inner">
                  {[...visible, ...visible].map((m, i) => (
                    <span key={i} className="team-marquee-item">
                      {m.photo_url
                        ? <img src={m.photo_url} alt={m.full_name} className="team-marquee-avatar" />
                        : <span className="team-marquee-avatar team-marquee-avatar-fallback">{m.full_name.charAt(0)}</span>
                      }
                      <span className="team-marquee-name">{m.full_name}</span>
                      <span className="team-marquee-badge">{m.marquee_role || 'सदस्य'}</span>
                      <span className="team-marquee-sep">✦</span>
                    </span>
                  ))}
                </div>
              )
            }
          </div>
        )}
      </div>

      {/* MEMBER LIST */}
      {members.length === 0 && (
        <p style={{ color: "#aaa", textAlign: "center", padding: "32px 0" }}>
          No approved members yet. Approve members in the Members tab first.
        </p>
      )}

      <div className="admin-list">
        {members.map((m, idx) => (
          <div className="admin-item" key={m.id} style={{ alignItems: "flex-start", gap: 14 }}>

            {/* Photo + upload */}
            <div style={{ flexShrink: 0, position: "relative" }}>
              {m.photo_url
                ? <img src={m.photo_url} alt={m.full_name} style={{ width: 54, height: 54, borderRadius: "50%", objectFit: "cover", border: "2px solid #e0e0e0" }} />
                : <div style={{ width: 54, height: 54, borderRadius: "50%", background: "linear-gradient(135deg,#2e7d32,#81c784)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1.2rem" }}>
                    {m.full_name.charAt(0)}
                  </div>
              }
              <label title="Change photo" style={{ position: "absolute", bottom: -3, right: -3, background: "#2e7d32", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #fff" }}>
                <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploading === m.id}
                  onChange={e => e.target.files[0] && uploadPhoto(m.id, e.target.files[0])} />
                <span style={{ fontSize: "0.65rem" }}>{uploading === m.id ? "…" : "📷"}</span>
              </label>
            </div>

            {/* Info + inline edit */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: "0.95rem" }}>{m.full_name}</strong>
              {editId === m.id ? (
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <input
                    value={editRole} onChange={e => setEditRole(e.target.value)}
                    placeholder="Role (e.g. अध्यक्ष)"
                    style={{ flex: 1, minWidth: 110, padding: "5px 10px", border: "1px solid #ccc", borderRadius: 7, fontSize: "0.85rem" }}
                  />
                  <input
                    type="number" min={0} value={editOrder} onChange={e => setEditOrder(e.target.value)}
                    placeholder="Order"
                    style={{ width: 72, padding: "5px 8px", border: "1px solid #ccc", borderRadius: 7, fontSize: "0.85rem" }}
                  />
                  <button className="btn-save" onClick={() => saveEdit(m.id)} disabled={saving === m.id}
                    style={{ fontSize: "0.8rem", padding: "5px 14px" }}>
                    {saving === m.id ? "…" : "Save"}
                  </button>
                  <button className="btn-cancel" onClick={() => setEditId(null)} style={{ fontSize: "0.8rem", padding: "5px 10px" }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="item-meta" style={{ marginTop: 3 }}>
                  Role: <strong>{m.marquee_role || 'सदस्य'}</strong>
                  &nbsp;·&nbsp;Order: <strong>{m.marquee_order ?? 0}</strong>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, alignItems: "flex-end" }}>
              <button
                onClick={() => toggleVisible(m.id, m.show_in_marquee)} disabled={saving === m.id}
                style={{ padding: "5px 12px", fontSize: "0.76rem", borderRadius: 20, cursor: "pointer", border: "1.5px solid",
                  background:  m.show_in_marquee ? "#e8f5e9" : "#fff3e0",
                  color:       m.show_in_marquee ? "#2e7d32"  : "#e65100",
                  borderColor: m.show_in_marquee ? "#a5d6a7"  : "#ffcc80",
                  fontWeight: 700 }}
              >
                {m.show_in_marquee ? "👁 Visible" : "🚫 Hidden"}
              </button>
              <button className="btn-edit"
                onClick={() => { setEditId(m.id); setEditRole(m.marquee_role || 'सदस्य'); setEditOrder(String(m.marquee_order ?? 0)); }}
                style={{ fontSize: "0.76rem", padding: "4px 12px" }}>
                ✏️ Edit
              </button>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => move(idx, -1)} disabled={idx === 0} title="Move up"
                  style={{ padding: "3px 9px", fontSize: "0.75rem", border: "1px solid #ddd", borderRadius: 6, background: "#f9f9f9", cursor: "pointer", opacity: idx === 0 ? 0.4 : 1 }}>↑</button>
                <button onClick={() => move(idx, 1)} disabled={idx === members.length - 1} title="Move down"
                  style={{ padding: "3px 9px", fontSize: "0.75rem", border: "1px solid #ddd", borderRadius: 6, background: "#f9f9f9", cursor: "pointer", opacity: idx === members.length - 1 ? 0.4 : 1 }}>↓</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── MEMBERS PAGE ADMIN ───────────────────────────────── */
const GRAM_ROLES = ["सदस्य", "अध्यक्ष", "उपाध्यक्ष", "सचिव", "खजिनदार", "सल्लागार", "युवा सदस्य"];
const GRAM_EDU = [
  "NA",
  "10वी पास",
  "12वी पास",
  "Diploma",
  "ITI",
  "B.A.",
  "B.Sc.",
  "B.Sc. Computer Science",
  "B.Com.",
  "BCA",
  "BBA",
  "B.E. (Bachelor of Engineering)",
  "B.Tech. (Bachelor of Technology)",
  "M.A.",
  "M.Sc.",
  "M.Sc. Computer Science",
  "M.Com.",
  "MBA",
  "MCA",
  "M.E. (Master of Engineering)",
  "M.Tech. (Master of Technology)",
  "Engineering Postgraduate",
  "Engineering Graduate",
  "MBBS",
  "LLB",
  "CA",
  "CS",
  "CMA",
  "Ph.D.",
  "Other",
];
const MUMBAI_LOCATIONS = [
  "",
  // ── Mumbai – Western Line ──
  "Churchgate, Mumbai",
  "Marine Lines, Mumbai",
  "Grant Road, Mumbai",
  "Mumbai Central, Mumbai",
  "Mahalaxmi, Mumbai",
  "Lower Parel, Mumbai",
  "Prabhadevi, Mumbai",
  "Dadar, Mumbai",
  "Matunga Road, Mumbai",
  "Mahim, Mumbai",
  "Bandra, Mumbai",
  "Khar Road, Mumbai",
  "Santacruz, Mumbai",
  "Vile Parle, Mumbai",
  "Andheri, Mumbai",
  "Jogeshwari, Mumbai",
  "Goregaon, Mumbai",
  "Malad, Mumbai",
  "Kandivali, Mumbai",
  "Borivali, Mumbai",
  "Dahisar, Mumbai",
  "Mira Road, Mumbai",
  "Bhayander, Mumbai",
  "Nalasopara, Mumbai",
  "Virar, Mumbai",
  // ── Mumbai – Central Line ──
  "CSMT, Mumbai",
  "Sion, Mumbai",
  "Kurla, Mumbai",
  "Ghatkopar, Mumbai",
  "Vikhroli, Mumbai",
  "Kanjurmarg, Mumbai",
  "Bhandup, Mumbai",
  "Mulund, Mumbai",
  "Thane, Mumbai",
  "Dombivli, Mumbai",
  "Kalyan, Mumbai",
  "Ambernath, Mumbai",
  "Badlapur, Mumbai",
  // ── Mumbai – Areas ──
  "Colaba, Mumbai",
  "Fort, Mumbai",
  "Nariman Point, Mumbai",
  "Worli, Mumbai",
  "Dharavi, Mumbai",
  "Chembur, Mumbai",
  "Govandi, Mumbai",
  "Mankhurd, Mumbai",
  "Wadala, Mumbai",
  "Sewri, Mumbai",
  "Antop Hill, Mumbai",
  "Powai, Mumbai",
  "Chandivali, Mumbai",
  "Sakinaka, Mumbai",
  "Marol, Mumbai",
  "Chakala, Mumbai",
  "Versova, Mumbai",
  "Oshiwara, Mumbai",
  "Lokhandwala, Mumbai",
  "Dahisar East, Mumbai",
  "Mira-Bhayander, Mumbai",
  // ── Navi Mumbai ──
  "Airoli, Navi Mumbai",
  "Ghansoli, Navi Mumbai",
  "Rabale, Navi Mumbai",
  "Turbhe, Navi Mumbai",
  "Vashi, Navi Mumbai",
  "Sanpada, Navi Mumbai",
  "Juinagar, Navi Mumbai",
  "Nerul, Navi Mumbai",
  "Seawoods, Navi Mumbai",
  "Belapur, Navi Mumbai",
  "Kharghar, Navi Mumbai",
  "Mansarovar, Navi Mumbai",
  "Khandeshwar, Navi Mumbai",
  "Panvel, Navi Mumbai",
  "Taloja, Navi Mumbai",
  "Ulwe, Navi Mumbai",
  "Dronagiri, Navi Mumbai",
  "Kamothe, Navi Mumbai",
  "Kalamboli, Navi Mumbai",
  "Kopar Khairane, Navi Mumbai",
  // ── Pune ──
  "Pune",
  // ── Gujarat ──
  "Vapi, Gujarat",
];

const EMPTY_GM   = {
  first_name: "", middle_name: "", last_name: "",
  father_name: "", role: "सदस्य",
  address: "आयरेवाडी", mumbai_location: "", education: "NA",
  bio: "", mobile: "", display_order: "0"
};

function AdminGramMembers() {
  const [members,   setMembers]   = useState([]);
  const [form,      setForm]      = useState(EMPTY_GM);
  const [file,      setFile]      = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [editing,   setEditing]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState("");
  const [confirmId, setConfirmId] = useState(null);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = () =>
    axios.get(`${API}/gram-members/all`, { headers: authHeader() })
      .then(r => setMembers(r.data))
      .catch(() => showToast("Failed to load members."));
  useEffect(() => { load(); }, []);

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    if (!form.first_name.trim()) return showToast("पहिले नाव आवश्यक आहे.");
    if (!form.last_name.trim())  return showToast("आडनाव आवश्यक आहे.");
    if (!form.father_name.trim()) return showToast("वडिलांचे नाव आवश्यक आहे.");
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("photo", file);

      if (editing) {
        await axios.put(`${API}/gram-members/${editing}`, fd, {
          headers: { ...authHeader(), "Content-Type": "multipart/form-data" }
        });
        showToast("Member updated.");
      } else {
        await axios.post(`${API}/gram-members`, fd, {
          headers: { ...authHeader(), "Content-Type": "multipart/form-data" }
        });
        showToast("Member added.");
      }
      setForm(EMPTY_GM); setFile(null); setPreview(null); setEditing(null);
      load();
    } catch { showToast("Error saving. Try again."); }
    finally { setSaving(false); }
  };

  const del = async id => {
    try {
      await axios.delete(`${API}/gram-members/${id}`, { headers: authHeader() });
      setConfirmId(null);
      showToast("Member deleted.");
      load();
    } catch { showToast("Delete failed."); }
  };

  const startEdit = m => {
    setEditing(m.id);
    setForm({
      first_name:      m.first_name      || "",
      middle_name:     m.middle_name     || "",
      last_name:       m.last_name       || "",
      father_name:     m.father_name     || "",
      role:            m.role            || "सदस्य",
      address:         m.address         || "",
      mumbai_location: m.mumbai_location || "",
      education:       m.education       || "NA",
      bio:             m.bio             || "",
      mobile:          m.mobile          || "",
      display_order:   String(m.display_order ?? 0),
    });
    setFile(null);
    setPreview(m.photo_url || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditing(null); setForm(EMPTY_GM); setFile(null); setPreview(null);
  };

  const previewInitial = (form.first_name.charAt(0) || "?").toUpperCase();

  return (
    <div className="admin-section">
      <h2>🏘️ Members Page</h2>
      {toast && <div className="admin-toast">{toast}</div>}

      {/* ── FORM ── */}
      <div className="admin-form">
        <h3>{editing ? "✏️ Edit Member" : "➕ Add Member"}</h3>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Photo preview */}
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ width: 90, height: 90, borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg,#2e7d32,#81c784)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "2rem", fontWeight: 800, border: "3px solid #e0e0e0", marginBottom: 8 }}>
              {preview
                ? <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : previewInitial
              }
            </div>
            <label style={{ fontSize: "0.78rem", color: "#2e7d32", cursor: "pointer", fontWeight: 600 }}>
              📷 Choose Photo
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
            </label>
            {file && <p style={{ fontSize: "0.7rem", color: "#888", marginTop: 4 }}>{file.name}</p>}
          </div>

          {/* Fields */}
          <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Name row */}
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>पहिले नाव *</label>
                <input placeholder="पहिले नाव" value={form.first_name} onChange={e => f("first_name", e.target.value.toUpperCase())} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>मधले नाव</label>
                <input placeholder="मधले नाव" value={form.middle_name} onChange={e => f("middle_name", e.target.value.toUpperCase())} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>आडनाव *</label>
                <input placeholder="आडनाव" value={form.last_name} onChange={e => f("last_name", e.target.value.toUpperCase())} />
              </div>
            </div>

            {/* Father name */}
            <div>
              <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>वडिलांचे नाव *</label>
              <input placeholder="वडिलांचे नाव" value={form.father_name} onChange={e => f("father_name", e.target.value.toUpperCase())} />
            </div>

            {/* Role */}
            <div>
              <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>पद</label>
              <select value={form.role} onChange={e => f("role", e.target.value)}>
                {GRAM_ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            {/* Education */}
            <div>
              <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>शिक्षण</label>
              <select value={form.education} onChange={e => f("education", e.target.value)}>
                {GRAM_EDU.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>

            {/* Address */}
            <div>
              <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>गावातील पत्ता</label>
              <input placeholder="गावातील पत्ता (optional)" value={form.address} onChange={e => f("address", e.target.value)} />
            </div>

            {/* Mumbai location */}
            <div>
              <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>मुंबई पत्ता</label>
              <select value={form.mumbai_location} onChange={e => f("mumbai_location", e.target.value)}>
                {MUMBAI_LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc || "— निवडा (optional) —"}</option>
                ))}
              </select>
            </div>

            {/* Bio */}
            <div>
              <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>थोडक्यात परिचय</label>
              <textarea
                placeholder="उपलब्धी, भूमिका वर्णन (optional)"
                value={form.bio} onChange={e => f("bio", e.target.value)}
                style={{ minHeight: 72, resize: "vertical" }}
              />
            </div>

            {/* Mobile + order */}
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>मोबाइल</label>
                <input placeholder="मोबाइल (optional)" value={form.mobile} onChange={e => f("mobile", e.target.value)} />
              </div>
              <div style={{ width: 120 }}>
                <label style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600, display: "block", marginBottom: 3 }}>क्रम (0=प्रथम)</label>
                <input type="number" min={0} value={form.display_order}
                  onChange={e => f("display_order", e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="form-btns" style={{ marginTop: 16 }}>
          <button className="btn-save" onClick={save} disabled={saving}>
            {saving ? "Saving…" : editing ? "Update Member" : "Add Member"}
          </button>
          {editing && (
            <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>
          )}
        </div>
      </div>

      {/* ── MEMBER LIST ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: "0.95rem", color: "#555" }}>
          {members.length} member{members.length !== 1 ? "s" : ""} total
        </h3>
      </div>

      <div className="admin-list">
        {members.length === 0 && (
          <p style={{ color: "#aaa", textAlign: "center", padding: "32px 0" }}>
            No members yet. Add one above.
          </p>
        )}
        {members.map(m => (
          <div className="admin-item" key={m.id} style={{ alignItems: "center" }}>
            {/* Photo */}
            <div style={{ flexShrink: 0 }}>
              {m.photo_url
                ? <img src={m.photo_url} alt={m.name} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid #e0e0e0" }} />
                : <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#2e7d32,#81c784)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1.15rem" }}>
                    {m.name.charAt(0)}
                  </div>
              }
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <strong style={{ fontSize: "0.95rem" }}>{m.name}</strong>
                <span style={{ background: "#e8f5e9", color: "#2e7d32", border: "1px solid #c8e6c9", borderRadius: 20, padding: "1px 10px", fontSize: "0.7rem", fontWeight: 700 }}>
                  {m.role || "सदस्य"}
                </span>
                {m.education && m.education !== "NA" && (
                  <span style={{ background: "#e3f2fd", color: "#1565c0", border: "1px solid #90caf9", borderRadius: 20, padding: "1px 10px", fontSize: "0.7rem", fontWeight: 700 }}>
                    🎓 {m.education}
                  </span>
                )}
                {!m.is_active && (
                  <span style={{ background: "#fff3e0", color: "#e65100", border: "1px solid #ffcc80", borderRadius: 20, padding: "1px 10px", fontSize: "0.7rem", fontWeight: 700 }}>
                    Hidden
                  </span>
                )}
              </div>
              {m.father_name && <div className="item-meta" style={{ marginTop: 2 }}>वडील: {m.father_name}</div>}
              {m.address && <div className="item-meta" style={{ marginTop: 2 }}>📍 {m.address}</div>}
              {m.mumbai_location && <div className="item-meta" style={{ marginTop: 2 }}>🏙️ मुंबई: {m.mumbai_location}</div>}
            </div>

            {/* Actions */}
            <div className="item-btns">
              <button className="btn-edit" onClick={() => startEdit(m)}>✏️ Edit</button>
              {confirmId === m.id
                ? <span className="inline-confirm">
                    Sure?&nbsp;
                    <button className="btn-del" onClick={() => del(m.id)}>Yes</button>&nbsp;
                    <button className="btn-cancel" onClick={() => setConfirmId(null)}>No</button>
                  </span>
                : <button className="btn-del" onClick={() => setConfirmId(m.id)}>🗑️ Delete</button>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
