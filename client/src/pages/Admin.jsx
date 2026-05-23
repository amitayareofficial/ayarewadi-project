import { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const API = "https://ayarewadi-project.onrender.com"; // ← change if URL changes

// ── Helper: get stored token ──────────────────────────────
const getToken = () => localStorage.getItem("admin_token");
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [tab, setTab] = useState("events"); // events | gallery | budget | emergency | announcements | blog

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
          { id: "emergency",     icon: "🚨", label: "Emergency" },
          { id: "blog",          icon: "📝", label: "Blog" },
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
        {tab === "emergency"     && <AdminEmergency />}
        {tab === "blog"          && <AdminBlog />}
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
  const [editing, setEditing] = useState(null); // id of event being edited

  const CATEGORIES = ["General", "Festival", "Meeting", "Sports", "Cultural", "Health"];

  const load = () => axios.get(`${API}/events`).then(r => setEvents(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editing) {
      await axios.put(`${API}/events/${editing}`, form, { headers: authHeader() });
      setEditing(null);
    } else {
      await axios.post(`${API}/events`, form, { headers: authHeader() });
    }
    setForm({ title: "", description: "", date: "", category: "General", is_marquee: false });
    load();
  };

  const del = async id => {
    if (!confirm("Delete this event?")) return;
    await axios.delete(`${API}/events/${id}`, { headers: authHeader() });
    load();
  };

  const edit = ev => {
    setEditing(ev.id);
    setForm({ title: ev.title, description: ev.description, date: ev.date?.split("T")[0], category: ev.category, is_marquee: ev.is_marquee });
  };

  return (
    <div className="admin-section">
      <h2>📅 Manage Events</h2>

      {/* FORM */}
      <div className="admin-form">
        <h3>{editing ? "✏️ Edit Event" : "➕ Add Event"}</h3>
        <input placeholder="Event title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
        <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <label className="checkbox-label">
          <input type="checkbox" checked={form.is_marquee}
            onChange={e => setForm({...form, is_marquee: e.target.checked})} />
          Show in ticker/marquee
        </label>
        <div className="form-btns">
          <button className="btn-save" onClick={save}>{editing ? "Update" : "Add Event"}</button>
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
              <button className="btn-del"  onClick={() => del(ev.id)}>🗑️ Delete</button>
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
    await axios.post(`${API}/announcements`, { text }, { headers: authHeader() });
    setText(""); load();
  };

  const del = async id => {
    await axios.delete(`${API}/announcements/${id}`, { headers: authHeader() });
    load();
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
  const [photos, setPhotos] = useState([]);
  const [file, setFile]     = useState(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("Village Festivals");
  const [uploading, setUploading] = useState(false);
  const [filterCat, setFilterCat] = useState("");

  // Gallery categories — add more here if needed
  const CATS = ["Sports","Ravalnath Temple","Meetings","Village Festivals","Mumbai Meeting","Ganesh Chaturthi","Gudhi Padwa","Shimga (Holi)"];

  const load = () => {
    const url = filterCat ? `${API}/gallery?category=${filterCat}` : `${API}/gallery`;
    axios.get(url).then(r => setPhotos(r.data));
  };
  useEffect(() => { load(); }, [filterCat]);

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    fd.append("caption", caption);
    fd.append("category", category);
    await axios.post(`${API}/gallery/upload`, fd, { headers: { ...authHeader(), "Content-Type": "multipart/form-data" } });
    setFile(null); setCaption(""); setUploading(false); load();
  };

  const del = async id => {
    if (!confirm("Delete this photo?")) return;
    await axios.delete(`${API}/gallery/${id}`, { headers: authHeader() });
    load();
  };

  return (
    <div className="admin-section">
      <h2>🖼️ Manage Gallery</h2>

      <div className="admin-form">
        <h3>📷 Upload Photo</h3>
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
        <input placeholder="Caption (optional)" value={caption} onChange={e => setCaption(e.target.value)} />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn-save" onClick={upload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload to Cloudinary"}
        </button>
      </div>

      {/* FILTER */}
      <div className="filter-row">
        <span>Filter:</span>
        <button className={!filterCat ? "active" : ""} onClick={() => setFilterCat("")}>All</button>
        {CATS.map(c => (
          <button key={c} className={filterCat === c ? "active" : ""} onClick={() => setFilterCat(c)}>{c}</button>
        ))}
      </div>

      {/* PHOTO GRID */}
      <div className="admin-gallery-grid">
        {photos.map(p => (
          <div className="admin-photo" key={p.id}>
            <img src={p.thumbnail_url || p.url} alt={p.caption} />
            <div className="photo-info">
              <small>{p.category}</small>
              <p>{p.caption}</p>
              <button className="btn-del" onClick={() => del(p.id)}>🗑️ Delete</button>
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
    await axios.post(`${API}/budget`, form, { headers: authHeader() });
    setForm({ description: "", type: "income", amount: "", month: "" });
    load();
  };

  const del = async id => {
    await axios.delete(`${API}/budget/${id}`, { headers: authHeader() });
    load();
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

/* ── EMERGENCY MANAGER ───────────────────────────────────── */
function AdminEmergency() {
  const [list, setList]   = useState([]);
  const [form, setForm]   = useState({ name: "", type: "Hospital", phone: "", address: "", maps_url: "", emergency_contact: "" });
  const [editing, setEditing] = useState(null);

  const TYPES = ["Hospital", "Police", "School", "Government"];

  const load = () => axios.get(`${API}/emergency`).then(r => setList(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editing) {
      await axios.put(`${API}/emergency/${editing}`, form, { headers: authHeader() });
      setEditing(null);
    } else {
      await axios.post(`${API}/emergency`, form, { headers: authHeader() });
    }
    setForm({ name: "", type: "Hospital", phone: "", address: "", maps_url: "", emergency_contact: "" });
    load();
  };

  const del = async id => {
    await axios.delete(`${API}/emergency/${id}`, { headers: authHeader() });
    load();
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
          {TYPES.map(t => <option key={t}>{t}</option>)}
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
/* ── BLOG MANAGER ────────────────────────────────────── */
const BLOG_CATS = ["Village News", "Announcement", "Development", "Culture", "Health", "Education"];
const EMPTY_POST = { title: "", category: "Village News", content: "", cover_image: "", published: false };

function AdminBlog() {
  const [posts, setPosts]     = useState([]);
  const [form, setForm]       = useState(EMPTY_POST);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(false);

  const load = () => axios.get(`${API}/blog/all`, { headers: authHeader() }).then(r => setPosts(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    if (editing) {
      await axios.put(`${API}/blog/${editing}`, form, { headers: authHeader() });
      setEditing(null);
    } else {
      await axios.post(`${API}/blog`, form, { headers: authHeader() });
    }
    setForm(EMPTY_POST);
    load();
  };

  const del = async id => {
    if (!confirm("Delete this blog post?")) return;
    await axios.delete(`${API}/blog/${id}`, { headers: authHeader() });
    load();
  };

  const edit = post => {
    setEditing(post.id);
    setForm({ title: post.title, category: post.category, content: post.content, cover_image: post.cover_image || "", published: post.published });
  };

  return (
    <div className="admin-section">
      <h2>📝 Manage Blog</h2>

      <div className="admin-form">
        <h3>{editing ? "✏️ Edit Post" : "➕ New Post"}</h3>
        <input
          placeholder="Post title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
          {BLOG_CATS.map(c => <option key={c}>{c}</option>)}
        </select>
        <input
          placeholder="Cover image URL (optional)"
          value={form.cover_image}
          onChange={e => setForm({ ...form, cover_image: e.target.value })}
        />

        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#555" }}>Content (Markdown)</span>
          <button
            style={{ fontSize: "0.78rem", padding: "2px 10px", borderRadius: "6px", border: "1px solid #ccc", cursor: "pointer", background: preview ? "#DB4035" : "#f4f3f1", color: preview ? "#fff" : "#333" }}
            onClick={() => setPreview(!preview)}
            type="button"
          >
            {preview ? "Edit" : "Preview"}
          </button>
        </div>

        {preview ? (
          <div className="blog-preview-box">
            <ReactMarkdown>{form.content || "_Nothing to preview yet_"}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            className="blog-md-editor"
            placeholder={`Write your post in Markdown...\n\n## Heading\n\nParagraph text here.\n\n- List item 1\n- List item 2\n\n**Bold** and _italic_ supported.`}
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
          />
        )}

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.published}
            onChange={e => setForm({ ...form, published: e.target.checked })}
          />
          Publish immediately (visible on the website)
        </label>

        <div className="form-btns">
          <button className="btn-save" onClick={save}>{editing ? "Update Post" : "Save Post"}</button>
          {editing && (
            <button className="btn-cancel" onClick={() => { setEditing(null); setForm(EMPTY_POST); }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="admin-list">
        {posts.length === 0 && <p style={{ color: "#888", padding: "16px 0" }}>No blog posts yet.</p>}
        {posts.map(post => (
          <div className="admin-item" key={post.id}>
            <div>
              <strong>{post.title}</strong>
              <span className="item-meta">
                {post.category} · {new Date(post.created_at).toLocaleDateString("en-IN")}
              </span>
              <span className={`tag ${post.published ? "income" : "expense"}`}>
                {post.published ? "✅ Published" : "📄 Draft"}
              </span>
              <p style={{ fontSize: "0.82rem", color: "#777", marginTop: "4px" }}>
                {post.content.replace(/[#*_`[\]()]/g, "").slice(0, 100)}…
              </p>
            </div>
            <div className="item-btns">
              <button className="btn-edit" onClick={() => edit(post)}>✏️ Edit</button>
              <button className="btn-del"  onClick={() => del(post.id)}>🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
