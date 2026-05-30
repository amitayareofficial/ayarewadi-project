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

// ── MEDICAL CONTACTS ──────────────────────────────────────
pool.query(`
  CREATE TABLE IF NOT EXISTS medical_contacts (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(200) NOT NULL,
    type          VARCHAR(60)  DEFAULT 'Hospital',
    phone         VARCHAR(40),
    address       TEXT,
    maps_url      TEXT,
    specialist    VARCHAR(120),
    working_hours VARCHAR(120),
    image_url     TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
  )
`).catch(() => {});

app.get("/medical", async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM medical_contacts ORDER BY type, name");
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch medical contacts" });
  }
});

app.post("/medical", authAdmin, async (req, res) => {
  try {
    const { name, type, phone, address, maps_url, specialist, working_hours, image_url } = req.body;
    const r = await pool.query(
      `INSERT INTO medical_contacts (name,type,phone,address,maps_url,specialist,working_hours,image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, type || "Hospital", phone || null, address || null,
       maps_url || null, specialist || null, working_hours || null, image_url || null]
    );
    res.status(201).json(r.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to create medical contact" });
  }
});

app.put("/medical/:id", authAdmin, async (req, res) => {
  try {
    const { name, type, phone, address, maps_url, specialist, working_hours, image_url } = req.body;
    const r = await pool.query(
      `UPDATE medical_contacts
       SET name=$1,type=$2,phone=$3,address=$4,maps_url=$5,specialist=$6,working_hours=$7,image_url=$8
       WHERE id=$9 RETURNING *`,
      [name, type, phone || null, address || null,
       maps_url || null, specialist || null, working_hours || null, image_url || null, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to update medical contact" });
  }
});

app.delete("/medical/:id", authAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM medical_contacts WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete medical contact" });
  }
});

// ── VILLAGE SERVICES (Help & Services page) ──────────────
pool.query(`
  CREATE TABLE IF NOT EXISTS village_services (
    id            SERIAL PRIMARY KEY,
    category      VARCHAR(60)  NOT NULL,
    subcategory   VARCHAR(80),
    name          VARCHAR(200) NOT NULL,
    phone         VARCHAR(60),
    address       TEXT,
    maps_url      TEXT,
    website       VARCHAR(250),
    description   TEXT,
    timing        VARCHAR(150),
    image_url     TEXT,
    display_order INT DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW()
  )
`).catch(() => {});

app.get("/services", async (req, res) => {
  try {
    const { category } = req.query;
    const q = category
      ? "SELECT * FROM village_services WHERE category=$1 ORDER BY display_order, name"
      : "SELECT * FROM village_services ORDER BY category, display_order, name";
    const r = await pool.query(q, category ? [category] : []);
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

app.post("/services", authAdmin, async (req, res) => {
  try {
    const { category, subcategory, name, phone, address, maps_url, website, description, timing, image_url, display_order } = req.body;
    const r = await pool.query(
      `INSERT INTO village_services
       (category,subcategory,name,phone,address,maps_url,website,description,timing,image_url,display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [category, subcategory||null, name, phone||null, address||null, maps_url||null,
       website||null, description||null, timing||null, image_url||null, display_order||0]
    );
    res.status(201).json(r.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to create service" });
  }
});

app.put("/services/:id", authAdmin, async (req, res) => {
  try {
    const { category, subcategory, name, phone, address, maps_url, website, description, timing, image_url, display_order } = req.body;
    const r = await pool.query(
      `UPDATE village_services SET category=$1,subcategory=$2,name=$3,phone=$4,address=$5,
       maps_url=$6,website=$7,description=$8,timing=$9,image_url=$10,display_order=$11
       WHERE id=$12 RETURNING *`,
      [category, subcategory||null, name, phone||null, address||null, maps_url||null,
       website||null, description||null, timing||null, image_url||null, display_order||0, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Not found" });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to update service" });
  }
});

app.delete("/services/:id", authAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM village_services WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete service" });
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
// Migration: add is_featured column if it doesn't exist yet
pool.query("ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false").catch(() => {});

app.get("/blog", async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM blog_posts WHERE published=true ORDER BY is_featured DESC, created_at DESC");
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

// Upload cover image to Cloudinary — must be declared before /blog/:id routes
app.post("/blog/upload-image", authAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "ayarewadi/blog", resource_type: "image",
          transformation: [{ width: 1200, crop: "limit" }, { quality: "auto:good" }] },
        (err, result) => { if (err) reject(err); else resolve(result); }
      );
      stream.end(req.file.buffer);
    });
    res.json({ url: result.secure_url });
  } catch {
    res.status(500).json({ error: "Image upload failed" });
  }
});

app.post("/services/upload-image", authAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "ayarewadi/services", resource_type: "image",
          transformation: [{ width: 900, crop: "limit" }, { quality: "auto:good" }] },
        (err, result) => { if (err) reject(err); else resolve(result); }
      );
      stream.end(req.file.buffer);
    });
    res.json({ url: result.secure_url });
  } catch {
    res.status(500).json({ error: "Image upload failed" });
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

// Feature / unfeature — must be before /blog/:id to avoid route swallowing
app.put("/blog/:id/feature", authAdmin, async (req, res) => {
  try {
    const { is_featured } = req.body;
    // Only one post can be featured at a time
    if (is_featured) {
      await pool.query("UPDATE blog_posts SET is_featured=false WHERE is_featured=true");
    }
    const r = await pool.query(
      "UPDATE blog_posts SET is_featured=$1 WHERE id=$2 RETURNING *",
      [!!is_featured, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Post not found" });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: "Failed to update featured status" });
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

// ── GRAM MEMBERS (Public Members Page) ────────────────────

/* Auto-create table on server start */
pool.query(`
  CREATE TABLE IF NOT EXISTS gram_members (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    role          VARCHAR(100) DEFAULT 'सदस्य',
    photo_url     TEXT,
    address       VARCHAR(200),
    bio           TEXT,
    mobile        VARCHAR(15),
    display_order INTEGER DEFAULT 0,
    is_active     BOOLEAN DEFAULT true,
    created_at    TIMESTAMPTZ DEFAULT NOW()
  )
`).catch(e => console.error("gram_members table:", e.message));

/* Idempotent migration — add extended profile columns */
;(async () => {
  const stmts = [
    `ALTER TABLE gram_members ADD COLUMN IF NOT EXISTS first_name      VARCHAR(80)  NOT NULL DEFAULT ''`,
    `ALTER TABLE gram_members ADD COLUMN IF NOT EXISTS middle_name     VARCHAR(80)           DEFAULT ''`,
    `ALTER TABLE gram_members ADD COLUMN IF NOT EXISTS last_name       VARCHAR(80)  NOT NULL DEFAULT ''`,
    `ALTER TABLE gram_members ADD COLUMN IF NOT EXISTS father_name     VARCHAR(150)          DEFAULT ''`,
    `ALTER TABLE gram_members ADD COLUMN IF NOT EXISTS mumbai_location VARCHAR(200)`,
    `ALTER TABLE gram_members ADD COLUMN IF NOT EXISTS education       VARCHAR(100)          DEFAULT 'NA'`,
  ];
  for (const sql of stmts) {
    try { await pool.query(sql); } catch (e) { console.error("gram_members migration:", e.message); }
  }
})();

/* Public — active members */
app.get("/gram-members", async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id,name,first_name,middle_name,last_name,father_name,role,
              photo_url,address,mumbai_location,education,bio,display_order
       FROM gram_members WHERE is_active=true ORDER BY display_order ASC, name ASC`
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Admin — all members (including hidden) */
app.get("/gram-members/all", authAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM gram_members ORDER BY display_order ASC, name ASC"
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Admin — add member */
app.post("/gram-members", authAdmin, upload.single("photo"), async (req, res) => {
  try {
    let photo_url = null;
    if (req.file) {
      const up = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "ayarewadi/members", transformation: [{ quality: "auto", width: 600, height: 600, crop: "fill", gravity: "face" }] },
          (err, result) => err ? reject(err) : resolve(result)
        );
        stream.end(req.file.buffer);
      });
      photo_url = up.secure_url;
    }
    const { first_name, middle_name, last_name, father_name, role, address, mumbai_location, education, bio, mobile, display_order } = req.body;
    const fullName = [first_name, middle_name, last_name].filter(Boolean).join(" ").trim();
    const r = await pool.query(
      `INSERT INTO gram_members
         (name,first_name,middle_name,last_name,father_name,role,photo_url,address,mumbai_location,education,bio,mobile,display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [fullName, first_name || '', middle_name || '', last_name || '', father_name || '',
       role || 'सदस्य', photo_url, address || null, mumbai_location || null,
       education || 'NA', bio || null, mobile || null, parseInt(display_order) || 0]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Admin — update member */
app.put("/gram-members/:id", authAdmin, upload.single("photo"), async (req, res) => {
  try {
    const sets = [], params = [];
    const p = v => { params.push(v); return `$${params.length}`; };

    if (req.file) {
      const up = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "ayarewadi/members", transformation: [{ quality: "auto", width: 600, height: 600, crop: "fill", gravity: "face" }] },
          (err, result) => err ? reject(err) : resolve(result)
        );
        stream.end(req.file.buffer);
      });
      sets.push(`photo_url = ${p(up.secure_url)}`);
    }

    const { first_name, middle_name, last_name, father_name, role, address, mumbai_location, education, bio, mobile, display_order, is_active } = req.body;
    if (first_name      !== undefined) sets.push(`first_name      = ${p(first_name || '')}`);
    if (middle_name     !== undefined) sets.push(`middle_name     = ${p(middle_name || '')}`);
    if (last_name       !== undefined) sets.push(`last_name       = ${p(last_name || '')}`);
    if (father_name     !== undefined) sets.push(`father_name     = ${p(father_name || '')}`);
    if (first_name !== undefined || middle_name !== undefined || last_name !== undefined) {
      const cur = await pool.query("SELECT first_name,middle_name,last_name FROM gram_members WHERE id=$1", [req.params.id]);
      if (cur.rows.length) {
        const fn = first_name  !== undefined ? first_name  : cur.rows[0].first_name;
        const mn = middle_name !== undefined ? middle_name : cur.rows[0].middle_name;
        const ln = last_name   !== undefined ? last_name   : cur.rows[0].last_name;
        sets.push(`name = ${p([fn, mn, ln].filter(Boolean).join(" ").trim() || fn || ln)}`);
      }
    }
    if (role            !== undefined) sets.push(`role            = ${p(role)}`);
    if (address         !== undefined) sets.push(`address         = ${p(address || null)}`);
    if (mumbai_location !== undefined) sets.push(`mumbai_location = ${p(mumbai_location || null)}`);
    if (education       !== undefined) sets.push(`education       = ${p(education || 'NA')}`);
    if (bio             !== undefined) sets.push(`bio             = ${p(bio || null)}`);
    if (mobile          !== undefined) sets.push(`mobile          = ${p(mobile || null)}`);
    if (display_order   !== undefined) sets.push(`display_order   = ${p(parseInt(display_order) || 0)}`);
    if (is_active       !== undefined) sets.push(`is_active       = ${p(is_active === "true" || is_active === true)}`);

    if (!sets.length) return res.status(400).json({ error: "Nothing to update" });
    params.push(req.params.id);
    const r = await pool.query(
      `UPDATE gram_members SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (!r.rows.length) return res.status(404).json({ error: "Member not found" });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Admin — delete member */
app.delete("/gram-members/:id", authAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM gram_members WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
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
