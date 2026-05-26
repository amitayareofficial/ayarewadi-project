require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const jwt        = require("jsonwebtoken");
const bcrypt     = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const multer     = require("multer");
const pool       = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

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
  try {
    const { username, password } = req.body;
    const r = await pool.query("SELECT * FROM admins WHERE username=$1", [username]);
    if (!r.rows.length) return res.status(401).json({ error: "Invalid credentials" });
    const admin = r.rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: admin.id, username: admin.username }, SECRET, { expiresIn: "7d" });
    res.json({ token, username: admin.username });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

// ── EVENTS ───────────────────────────────────────────────
app.get("/events", async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM events ORDER BY date DESC");
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.post("/events", authAdmin, async (req, res) => {
  try {
    const { title, description, date, category, is_marquee } = req.body;
    const r = await pool.query(
      "INSERT INTO events (title,description,date,category,is_marquee) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [title, description, date, category || "General", is_marquee || false]
    );
    res.status(201).json(r.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to create event" });
  }
});

app.put("/events/:id", authAdmin, async (req, res) => {
  try {
    const { title, description, date, category, is_marquee } = req.body;
    const r = await pool.query(
      "UPDATE events SET title=$1,description=$2,date=$3,category=$4,is_marquee=$5 WHERE id=$6 RETURNING *",
      [title, description, date, category, is_marquee, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Event not found" });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to update event" });
  }
});

app.delete("/events/:id", authAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM events WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete event" });
  }
});

// ── ANNOUNCEMENTS ─────────────────────────────────────────
app.get("/announcements", async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM announcements WHERE active=true ORDER BY created_at DESC");
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

app.post("/announcements", authAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      "INSERT INTO announcements (text,active) VALUES ($1,$2) RETURNING *",
      [req.body.text, true]
    );
    res.status(201).json(r.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

app.delete("/announcements/:id", authAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM announcements WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

// ── GALLERY ───────────────────────────────────────────────
app.get("/gallery/years", async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT year, COUNT(*)::int AS count,
        (SELECT thumbnail_url FROM gallery g2
         WHERE g2.year = g.year ORDER BY uploaded_at ASC LIMIT 1) AS cover
      FROM gallery g WHERE year IS NOT NULL
      GROUP BY year ORDER BY year DESC
    `);
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch years" });
  }
});

app.get("/gallery/categories", async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : null;
    if (!year) {
      const r = await pool.query(`
        SELECT category, COUNT(*)::int AS count,
          (SELECT thumbnail_url FROM gallery g2
           WHERE g2.category = g.category ORDER BY uploaded_at ASC LIMIT 1) AS cover
        FROM gallery g WHERE category IS NOT NULL GROUP BY category ORDER BY category
      `);
      return res.json(r.rows);
    }
    const r = await pool.query(`
      SELECT category, COUNT(*)::int AS count,
        (SELECT thumbnail_url FROM gallery g2
         WHERE g2.category = g.category AND g2.year = $1 ORDER BY uploaded_at ASC LIMIT 1) AS cover
      FROM gallery g WHERE year = $1 AND category IS NOT NULL GROUP BY category ORDER BY category
    `, [year]);
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.get("/gallery", async (req, res) => {
  try {
    const { year, category } = req.query;
    const conditions = [];
    const params = [];
    if (year)     { params.push(parseInt(year)); conditions.push(`year = $${params.length}`); }
    if (category) { params.push(category);       conditions.push(`category = $${params.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const r = await pool.query(`SELECT * FROM gallery ${where} ORDER BY uploaded_at DESC`, params);
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
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
    const year = req.body.year ? parseInt(req.body.year) : new Date().getFullYear();
    const r = await pool.query(
      "INSERT INTO gallery (url,thumbnail_url,caption,category,year) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [result.secure_url, result.secure_url.replace("/upload/", "/upload/w_400/"), req.body.caption, req.body.category, year]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/gallery/:id", authAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM gallery WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete photo" });
  }
});

// ── EMERGENCY ─────────────────────────────────────────────
app.get("/emergency", async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM emergency ORDER BY type, name");
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch emergency contacts" });
  }
});

app.post("/emergency", authAdmin, async (req, res) => {
  try {
    const { name, type, phone, address, maps_url, emergency_contact } = req.body;
    const r = await pool.query(
      "INSERT INTO emergency (name,type,phone,address,maps_url,emergency_contact) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [name, type, phone, address, maps_url, emergency_contact]
    );
    res.status(201).json(r.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to create contact" });
  }
});

app.put("/emergency/:id", authAdmin, async (req, res) => {
  try {
    const { name, type, phone, address, maps_url, emergency_contact } = req.body;
    const r = await pool.query(
      "UPDATE emergency SET name=$1,type=$2,phone=$3,address=$4,maps_url=$5,emergency_contact=$6 WHERE id=$7 RETURNING *",
      [name, type, phone, address, maps_url, emergency_contact, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Contact not found" });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to update contact" });
  }
});

app.delete("/emergency/:id", authAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM emergency WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

// ── BUDGET ────────────────────────────────────────────────
app.get("/budget", async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM budget ORDER BY created_at DESC");
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch budget" });
  }
});

app.post("/budget", authAdmin, async (req, res) => {
  try {
    const { description, type, amount, month } = req.body;
    const r = await pool.query(
      "INSERT INTO budget (description,type,amount,month) VALUES ($1,$2,$3,$4) RETURNING *",
      [description, type, amount, month]
    );
    res.status(201).json(r.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to create budget entry" });
  }
});

app.delete("/budget/:id", authAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM budget WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete budget entry" });
  }
});

// ── BLOG ──────────────────────────────────────────────────
app.get("/blog", async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM blog_posts WHERE published=true ORDER BY created_at DESC");
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.get("/blog/all", authAdmin, async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM blog_posts ORDER BY created_at DESC");
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.post("/blog", authAdmin, async (req, res) => {
  try {
    const { title, content, category, cover_image, published } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const r = await pool.query(
      "INSERT INTO blog_posts (title,slug,content,category,cover_image,published) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [title, slug, content, category || "Village News", cover_image || null, published || false]
    );
    res.status(201).json(r.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to create post" });
  }
});

app.put("/blog/:id", authAdmin, async (req, res) => {
  try {
    const { title, content, category, cover_image, published } = req.body;
    const r = await pool.query(
      "UPDATE blog_posts SET title=$1,content=$2,category=$3,cover_image=$4,published=$5,updated_at=NOW() WHERE id=$6 RETURNING *",
      [title, content, category, cover_image || null, published, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Post not found" });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to update post" });
  }
});

app.delete("/blog/:id", authAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM blog_posts WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// ── MEMBER PORTAL ─────────────────────────────────────────
const memberRoutes = require("./routes/members");
app.use("/api/members", memberRoutes);

app.get("/", (req, res) => res.send("Ayarewadi Backend Running ✅"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(process.env.PORT || 5000);
