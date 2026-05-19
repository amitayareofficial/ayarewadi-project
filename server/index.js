require("dotenv").config();
const express   = require("express");
const cors      = require("cors");
const jwt       = require("jsonwebtoken");
const bcrypt    = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const multer    = require("multer");
const pool      = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });
const SECRET = process.env.JWT_SECRET;

// ── AUTH MIDDLEWARE ───────────────────────────────────────
function authAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.admin = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ── ADMIN LOGIN ───────────────────────────────────────────
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  const r = await pool.query("SELECT * FROM admins WHERE username=$1", [username]);
  if (!r.rows.length) return res.status(401).json({ error: "Invalid credentials" });
  const admin = r.rows[0];
  const match = await bcrypt.compare(password, admin.password);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: admin.id, username: admin.username }, SECRET, { expiresIn: "7d" });
  res.json({ token, username: admin.username });
});

// ── EVENTS (public GET, admin POST/PUT/DELETE) ────────────
app.get("/events", async (req, res) => {
  const r = await pool.query("SELECT * FROM events ORDER BY date DESC");
  res.json(r.rows);
});
app.post("/events", authAdmin, async (req, res) => {
  const { title, description, date, category, is_marquee } = req.body;
  const r = await pool.query(
    "INSERT INTO events (title,description,date,category,is_marquee) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [title, description, date, category || "General", is_marquee || false]
  );
  res.json(r.rows[0]);
});
app.put("/events/:id", authAdmin, async (req, res) => {
  const { title, description, date, category, is_marquee } = req.body;
  const r = await pool.query(
    "UPDATE events SET title=$1,description=$2,date=$3,category=$4,is_marquee=$5 WHERE id=$6 RETURNING *",
    [title, description, date, category, is_marquee, req.params.id]
  );
  res.json(r.rows[0]);
});
app.delete("/events/:id", authAdmin, async (req, res) => {
  await pool.query("DELETE FROM events WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

// ── ANNOUNCEMENTS (marquee) ───────────────────────────────
app.get("/announcements", async (req, res) => {
  const r = await pool.query("SELECT * FROM announcements WHERE active=true ORDER BY created_at DESC");
  res.json(r.rows);
});
app.post("/announcements", authAdmin, async (req, res) => {
  const r = await pool.query(
    "INSERT INTO announcements (text,active) VALUES ($1,$2) RETURNING *",
    [req.body.text, true]
  );
  res.json(r.rows[0]);
});
app.delete("/announcements/:id", authAdmin, async (req, res) => {
  await pool.query("DELETE FROM announcements WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

// ── GALLERY (Cloudinary upload) ───────────────────────────
app.get("/gallery", async (req, res) => {
  const { category } = req.query;
  let q = "SELECT * FROM gallery ORDER BY uploaded_at DESC";
  let params = [];
  if (category) {
    q = "SELECT * FROM gallery WHERE category=$1 ORDER BY uploaded_at DESC";
    params = [category];
  }
  const r = await pool.query(q, params);
  res.json(r.rows);
});
app.post("/gallery/upload", authAdmin, upload.single("photo"), async (req, res) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "ayarewadi", transformation: [{ quality: "auto" }] },
        (err, result) => err ? reject(err) : resolve(result)
      );
      stream.end(req.file.buffer);
    });
    const r = await pool.query(
      "INSERT INTO gallery (url,thumbnail_url,caption,category) VALUES ($1,$2,$3,$4) RETURNING *",
      [result.secure_url, result.secure_url.replace("/upload/", "/upload/w_400/"), req.body.caption, req.body.category]
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.delete("/gallery/:id", authAdmin, async (req, res) => {
  await pool.query("DELETE FROM gallery WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

// ── EMERGENCY ─────────────────────────────────────────────
app.get("/emergency", async (req, res) => {
  const r = await pool.query("SELECT * FROM emergency ORDER BY type, name");
  res.json(r.rows);
});
app.post("/emergency", authAdmin, async (req, res) => {
  const { name, type, phone, address, maps_url, emergency_contact } = req.body;
  const r = await pool.query(
    "INSERT INTO emergency (name,type,phone,address,maps_url,emergency_contact) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
    [name, type, phone, address, maps_url, emergency_contact]
  );
  res.json(r.rows[0]);
});
app.put("/emergency/:id", authAdmin, async (req, res) => {
  const { name, type, phone, address, maps_url, emergency_contact } = req.body;
  const r = await pool.query(
    "UPDATE emergency SET name=$1,type=$2,phone=$3,address=$4,maps_url=$5,emergency_contact=$6 WHERE id=$7 RETURNING *",
    [name, type, phone, address, maps_url, emergency_contact, req.params.id]
  );
  res.json(r.rows[0]);
});
app.delete("/emergency/:id", authAdmin, async (req, res) => {
  await pool.query("DELETE FROM emergency WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

// ── BUDGET ────────────────────────────────────────────────
app.get("/budget", async (req, res) => {
  const r = await pool.query("SELECT * FROM budget ORDER BY created_at DESC");
  res.json(r.rows);
});
app.post("/budget", authAdmin, async (req, res) => {
  const { description, type, amount, month } = req.body;
  const r = await pool.query(
    "INSERT INTO budget (description,type,amount,month) VALUES ($1,$2,$3,$4) RETURNING *",
    [description, type, amount, month]
  );
  res.json(r.rows[0]);
});
app.delete("/budget/:id", authAdmin, async (req, res) => {
  await pool.query("DELETE FROM budget WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

// ── MEMBER LOGIN ──────────────────────────────────────────
app.post("/login", async (req, res) => {
  const { member_id, password } = req.body;
  const r = await pool.query("SELECT * FROM members WHERE member_id=$1 AND password=$2", [member_id, password]);
  if (!r.rows.length) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ success: true, member: r.rows[0] });
});
app.get("/family/:member_id", async (req, res) => {
  const r = await pool.query("SELECT * FROM family WHERE member_id=$1", [req.params.member_id]);
  res.json(r.rows);
});

app.get("/", (req, res) => res.send("Ayarewadi Backend Running ✅"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(5000, () => console.log("Server running on port 5000"));