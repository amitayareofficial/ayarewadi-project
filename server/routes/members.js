require("dotenv").config();
const express    = require("express");
const router     = express.Router();
const bcrypt     = require("bcrypt");
const jwt        = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const multer     = require("multer");
const pool       = require("../db");
const authMember = require("../middleware/authMember");
const authAdmin  = require("../middleware/authAdmin");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });
const SECRET = process.env.JWT_SECRET;

// ── DB MIGRATIONS (idempotent) ────────────────────────────
;(async () => {
  const stmts = [
    // Members table — split name columns
    `ALTER TABLE members ADD COLUMN IF NOT EXISTS first_name  VARCHAR(80) DEFAULT ''`,
    `ALTER TABLE members ADD COLUMN IF NOT EXISTS middle_name VARCHAR(80) DEFAULT ''`,
    `ALTER TABLE members ADD COLUMN IF NOT EXISTS last_name   VARCHAR(80) DEFAULT ''`,
    `ALTER TABLE members ADD COLUMN IF NOT EXISTS nickname    VARCHAR(80)`,
    // Marquee columns
    `ALTER TABLE members ADD COLUMN IF NOT EXISTS show_in_marquee BOOLEAN DEFAULT true`,
    `ALTER TABLE members ADD COLUMN IF NOT EXISTS marquee_role    VARCHAR(50) DEFAULT 'सदस्य'`,
    `ALTER TABLE members ADD COLUMN IF NOT EXISTS marquee_order   INTEGER    DEFAULT 0`,
    // Family people
    `CREATE TABLE IF NOT EXISTS family_people (
      id                   SERIAL PRIMARY KEY,
      first_name           VARCHAR(80) NOT NULL,
      middle_name          VARCHAR(80),
      last_name            VARCHAR(80) NOT NULL,
      nickname             VARCHAR(80),
      photo_url            TEXT,
      mobile               VARCHAR(15),
      dob                  DATE,
      gender               VARCHAR(20),
      created_by_member_id INTEGER,
      created_at           TIMESTAMPTZ DEFAULT NOW()
    )`,
    // Family relations
    `CREATE TABLE IF NOT EXISTS family_relations (
      id                SERIAL PRIMARY KEY,
      person_id         INTEGER NOT NULL REFERENCES family_people(id) ON DELETE CASCADE,
      related_person_id INTEGER NOT NULL REFERENCES family_people(id) ON DELETE CASCADE,
      relation_type     VARCHAR(50) NOT NULL,
      created_at        TIMESTAMPTZ DEFAULT NOW()
    )`,
    // Family requests
    `CREATE TABLE IF NOT EXISTS family_requests (
      id           SERIAL PRIMARY KEY,
      member_id    INTEGER NOT NULL,
      request_type VARCHAR(50) NOT NULL,
      request_data JSONB NOT NULL,
      status       VARCHAR(20) DEFAULT 'pending',
      admin_notes  TEXT,
      created_at   TIMESTAMPTZ DEFAULT NOW(),
      reviewed_at  TIMESTAMPTZ
    )`,
    // Password reset requests
    `CREATE TABLE IF NOT EXISTS password_reset_requests (
      id         SERIAL PRIMARY KEY,
      member_id  INTEGER,
      mobile     VARCHAR(15),
      email      VARCHAR(200),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
  ];
  for (const sql of stmts) {
    try { await pool.query(sql); } catch (e) { console.error("migration:", e.message); }
  }
})();

// ── REGISTER ─────────────────────────────────────────────
router.post("/register", upload.single("photo"), async (req, res) => {
  try {
    const { first_name, middle_name, last_name, nickname, dob, mobile, email, address, password } = req.body;

    if (!first_name?.trim())              return res.status(400).json({ error: "First name is required" });
    if (!middle_name?.trim())             return res.status(400).json({ error: "Middle name is required" });
    if (!last_name?.trim())               return res.status(400).json({ error: "Last name is required" });
    if (!dob)                             return res.status(400).json({ error: "Date of birth is required" });
    if (!mobile)                          return res.status(400).json({ error: "Mobile number is required" });
    if (!/^[6-9]\d{9}$/.test(mobile))    return res.status(400).json({ error: "Enter a valid 10-digit Indian mobile number" });
    if (!password)                        return res.status(400).json({ error: "Password is required" });
    if (!req.file)                        return res.status(400).json({ error: "Photo is required" });

    const dup = await pool.query("SELECT id FROM members WHERE mobile = $1", [mobile]);
    if (dup.rows.length) return res.status(409).json({ error: "Mobile number already registered" });

    const password_hash = await bcrypt.hash(password, 12);
    const full_name = [first_name, middle_name, last_name].filter(Boolean).join(" ").trim();

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "ayarewadi/members", transformation: [{ quality: "auto", width: 400, height: 400, crop: "fill", gravity: "face" }] },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    const r = await pool.query(
      `INSERT INTO members
         (full_name, first_name, middle_name, last_name, nickname, dob, mobile, email, address, photo_url, password_hash, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending')
       RETURNING id, full_name, first_name, middle_name, last_name, nickname, mobile, status, created_at`,
      [
        full_name,
        first_name.trim(), middle_name.trim(), last_name.trim(),
        nickname?.trim() || null,
        dob, mobile,
        email?.trim() || null,
        address?.trim() || null,
        uploadResult.secure_url,
        password_hash,
      ]
    );

    res.status(201).json({ success: true, member: r.rows[0] });
  } catch (e) {
    console.error("register:", e.message);
    res.status(500).json({ error: "Registration failed: " + e.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) return res.status(400).json({ error: "Mobile and password are required" });

    const r = await pool.query("SELECT * FROM members WHERE mobile = $1", [mobile]);
    if (!r.rows.length) return res.status(401).json({ error: "Invalid mobile number or password" });

    const member = r.rows[0];
    const match  = await bcrypt.compare(password, member.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid mobile number or password" });

    if (member.status === "pending")  return res.status(403).json({ error: "Your account is pending admin approval. Please wait." });
    if (member.status === "rejected") return res.status(403).json({ error: "Your account has been rejected. Please contact admin." });

    const token = jwt.sign(
      { id: member.id, mobile: member.mobile, full_name: member.full_name },
      SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      token,
      member: {
        id:          member.id,
        full_name:   member.full_name,
        first_name:  member.first_name,
        middle_name: member.middle_name,
        last_name:   member.last_name,
        nickname:    member.nickname,
        mobile:      member.mobile,
        email:       member.email,
        photo_url:   member.photo_url,
        address:     member.address,
        dob:         member.dob,
        status:      member.status,
      },
    });
  } catch (e) {
    console.error("login:", e.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// ── ME (member protected) ─────────────────────────────────
router.get("/me", authMember, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, full_name, first_name, middle_name, last_name, nickname,
              dob, mobile, email, address, photo_url, status, created_at
       FROM members WHERE id = $1`,
      [req.member.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Member not found" });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── FORGOT PASSWORD ───────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { mobile, email } = req.body;
    if (!mobile) return res.status(400).json({ error: "Mobile number is required" });

    const r = await pool.query("SELECT id FROM members WHERE mobile = $1", [mobile]);
    if (!r.rows.length) return res.status(404).json({ error: "No account found with this mobile number" });

    await pool.query(
      "INSERT INTO password_reset_requests (member_id, mobile, email, created_at) VALUES ($1,$2,$3,NOW())",
      [r.rows[0].id, mobile, email || null]
    );
    res.json({ success: true, message: "Request submitted. Admin will contact you soon." });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════
//  ADMIN — MEMBER MANAGEMENT
// ═══════════════════════════════════════════════════════════

router.get("/admin/all", authAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, full_name, first_name, middle_name, last_name, nickname,
              dob, mobile, email, address, photo_url, status, created_at
       FROM members ORDER BY created_at DESC`
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/admin/:id/approve", authAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      "UPDATE members SET status='approved' WHERE id=$1 RETURNING id, full_name, mobile, status",
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Member not found" });
    res.json({ success: true, member: r.rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/admin/:id/reject", authAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      "UPDATE members SET status='rejected' WHERE id=$1 RETURNING id, full_name, mobile, status",
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Member not found" });
    res.json({ success: true, member: r.rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/admin/:id/edit", authAdmin, upload.single("photo"), async (req, res) => {
  try {
    const sets = [], params = [];
    const p = v => { params.push(v); return `$${params.length}`; };

    if (req.file) {
      const up = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "ayarewadi/members", transformation: [{ quality: "auto", width: 400, height: 400, crop: "fill", gravity: "face" }] },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      sets.push(`photo_url = ${p(up.secure_url)}`);
    }

    const { first_name, middle_name, last_name, nickname, dob, email, address } = req.body;
    if (first_name  !== undefined) sets.push(`first_name  = ${p(first_name)}`);
    if (middle_name !== undefined) sets.push(`middle_name = ${p(middle_name)}`);
    if (last_name   !== undefined) sets.push(`last_name   = ${p(last_name)}`);
    if (nickname    !== undefined) sets.push(`nickname    = ${p(nickname || null)}`);
    if (dob         !== undefined) sets.push(`dob         = ${p(dob)}`);
    if (email       !== undefined) sets.push(`email       = ${p(email || null)}`);
    if (address     !== undefined) sets.push(`address     = ${p(address || null)}`);

    if (first_name !== undefined || middle_name !== undefined || last_name !== undefined) {
      const cur = await pool.query("SELECT first_name, middle_name, last_name FROM members WHERE id=$1", [req.params.id]);
      if (cur.rows.length) {
        const fn = first_name  !== undefined ? first_name  : cur.rows[0].first_name;
        const mn = middle_name !== undefined ? middle_name : cur.rows[0].middle_name;
        const ln = last_name   !== undefined ? last_name   : cur.rows[0].last_name;
        sets.push(`full_name = ${p([fn, mn, ln].filter(Boolean).join(" ").trim())}`);
      }
    }

    if (!sets.length) return res.status(400).json({ error: "Nothing to update" });
    params.push(req.params.id);
    const r = await pool.query(
      `UPDATE members SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (!r.rows.length) return res.status(404).json({ error: "Member not found" });
    res.json({ success: true, member: r.rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/admin/:id", authAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM members WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════
//  MARQUEE
// ═══════════════════════════════════════════════════════════

router.get("/marquee", async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT id, full_name, photo_url, marquee_role, marquee_order
      FROM   members
      WHERE  status = 'approved' AND show_in_marquee = true
      ORDER  BY marquee_order ASC, full_name ASC
    `);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get("/admin/marquee", authAdmin, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT id, full_name, photo_url, marquee_role, marquee_order, show_in_marquee
      FROM   members WHERE status = 'approved'
      ORDER  BY marquee_order ASC, full_name ASC
    `);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/admin/marquee/reorder", authAdmin, async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) return res.status(400).json({ error: "order must be an array" });
    await Promise.all(
      order.map(({ id, marquee_order }) =>
        pool.query("UPDATE members SET marquee_order = $1 WHERE id = $2", [marquee_order, id])
      )
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put("/admin/marquee/:id", authAdmin, upload.single("photo"), async (req, res) => {
  try {
    const sets = [], params = [];
    const p = (val) => { params.push(val); return `$${params.length}`; };

    if (req.file) {
      const up = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "ayarewadi/members", transformation: [{ quality: "auto", width: 400, height: 400, crop: "fill", gravity: "face" }] },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      sets.push(`photo_url = ${p(up.secure_url)}`);
    }

    const { show_in_marquee, marquee_role, marquee_order } = req.body;
    if (show_in_marquee !== undefined) sets.push(`show_in_marquee = ${p(show_in_marquee === "true" || show_in_marquee === true)}`);
    if (marquee_role    !== undefined) sets.push(`marquee_role    = ${p(marquee_role)}`);
    if (marquee_order   !== undefined) sets.push(`marquee_order   = ${p(parseInt(marquee_order, 10))}`);

    if (!sets.length) return res.status(400).json({ error: "Nothing to update" });
    params.push(req.params.id);
    const r = await pool.query(
      `UPDATE members SET ${sets.join(", ")} WHERE id = $${params.length}
       RETURNING id, full_name, photo_url, marquee_role, marquee_order, show_in_marquee`,
      params
    );
    if (!r.rows.length) return res.status(404).json({ error: "Member not found" });
    res.json({ success: true, member: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════
//  FAMILY PEOPLE (Village Family Tree)
// ═══════════════════════════════════════════════════════════

// Public — get all people
router.get("/family-people", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM family_people ORDER BY last_name, first_name"
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Public — search people
router.get("/family-search", async (req, res) => {
  try {
    const q = `%${(req.query.q || "").toLowerCase()}%`;
    const r = await pool.query(
      `SELECT * FROM family_people
       WHERE LOWER(first_name) LIKE $1
          OR LOWER(last_name)  LIKE $1
          OR LOWER(nickname)   LIKE $1
          OR LOWER(first_name || ' ' || COALESCE(middle_name,'') || ' ' || last_name) LIKE $1
       ORDER BY last_name, first_name LIMIT 30`,
      [q]
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Public — get one person with their relations
router.get("/family-people/:id", async (req, res) => {
  try {
    const person = await pool.query("SELECT * FROM family_people WHERE id=$1", [req.params.id]);
    if (!person.rows.length) return res.status(404).json({ error: "Person not found" });

    const relations = await pool.query(
      `SELECT fr.id, fr.relation_type, fr.related_person_id,
              fp.first_name, fp.middle_name, fp.last_name, fp.nickname, fp.photo_url, fp.gender, fp.dob
       FROM family_relations fr
       JOIN family_people fp ON fp.id = fr.related_person_id
       WHERE fr.person_id = $1`,
      [req.params.id]
    );

    res.json({ ...person.rows[0], relations: relations.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin — add person
router.post("/admin/family-people", authAdmin, upload.single("photo"), async (req, res) => {
  try {
    let photo_url = null;
    if (req.file) {
      const up = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "ayarewadi/family", transformation: [{ quality: "auto", width: 400, height: 400, crop: "fill", gravity: "face" }] },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      photo_url = up.secure_url;
    }

    const { first_name, middle_name, last_name, nickname, mobile, dob, gender } = req.body;
    if (!first_name?.trim()) return res.status(400).json({ error: "First name is required" });
    if (!last_name?.trim())  return res.status(400).json({ error: "Last name is required" });

    const r = await pool.query(
      `INSERT INTO family_people (first_name, middle_name, last_name, nickname, photo_url, mobile, dob, gender)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [first_name.trim(), middle_name?.trim()||null, last_name.trim(), nickname?.trim()||null, photo_url, mobile||null, dob||null, gender||null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin — update person
router.put("/admin/family-people/:id", authAdmin, upload.single("photo"), async (req, res) => {
  try {
    const sets = [], params = [];
    const p = v => { params.push(v); return `$${params.length}`; };

    if (req.file) {
      const up = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "ayarewadi/family", transformation: [{ quality: "auto", width: 400, height: 400, crop: "fill", gravity: "face" }] },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      sets.push(`photo_url = ${p(up.secure_url)}`);
    }

    const { first_name, middle_name, last_name, nickname, mobile, dob, gender } = req.body;
    if (first_name  !== undefined) sets.push(`first_name  = ${p(first_name)}`);
    if (middle_name !== undefined) sets.push(`middle_name = ${p(middle_name||null)}`);
    if (last_name   !== undefined) sets.push(`last_name   = ${p(last_name)}`);
    if (nickname    !== undefined) sets.push(`nickname    = ${p(nickname||null)}`);
    if (mobile      !== undefined) sets.push(`mobile      = ${p(mobile||null)}`);
    if (dob         !== undefined) sets.push(`dob         = ${p(dob||null)}`);
    if (gender      !== undefined) sets.push(`gender      = ${p(gender||null)}`);

    if (!sets.length) return res.status(400).json({ error: "Nothing to update" });
    params.push(req.params.id);
    const r = await pool.query(
      `UPDATE family_people SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (!r.rows.length) return res.status(404).json({ error: "Person not found" });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin — delete person
router.delete("/admin/family-people/:id", authAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM family_people WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin — add relation
router.post("/admin/family-relations", authAdmin, async (req, res) => {
  try {
    const { person_id, related_person_id, relation_type } = req.body;
    if (!person_id || !related_person_id || !relation_type) {
      return res.status(400).json({ error: "person_id, related_person_id, and relation_type are required" });
    }

    // Check for duplicate
    const dup = await pool.query(
      "SELECT id FROM family_relations WHERE person_id=$1 AND related_person_id=$2 AND relation_type=$3",
      [person_id, related_person_id, relation_type]
    );
    if (dup.rows.length) return res.status(409).json({ error: "Relation already exists" });

    const r = await pool.query(
      "INSERT INTO family_relations (person_id, related_person_id, relation_type) VALUES ($1,$2,$3) RETURNING *",
      [person_id, related_person_id, relation_type]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin — delete relation
router.delete("/admin/family-relations/:id", authAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM family_relations WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════
//  FAMILY REQUESTS (member submits, admin approves)
// ═══════════════════════════════════════════════════════════

// Member — submit family request
router.post("/family-requests", authMember, async (req, res) => {
  try {
    const { request_type, request_data } = req.body;
    if (!request_type || !request_data) {
      return res.status(400).json({ error: "request_type and request_data are required" });
    }
    const r = await pool.query(
      "INSERT INTO family_requests (member_id, request_type, request_data) VALUES ($1,$2,$3) RETURNING *",
      [req.member.id, request_type, JSON.stringify(request_data)]
    );
    res.status(201).json({ success: true, request: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Member — get my requests
router.get("/family-requests/mine", authMember, async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM family_requests WHERE member_id=$1 ORDER BY created_at DESC",
      [req.member.id]
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin — get all family requests
router.get("/admin/family-requests", authAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const q = status
      ? "SELECT fr.*, m.full_name AS member_name, m.mobile AS member_mobile FROM family_requests fr JOIN members m ON m.id=fr.member_id WHERE fr.status=$1 ORDER BY fr.created_at DESC"
      : "SELECT fr.*, m.full_name AS member_name, m.mobile AS member_mobile FROM family_requests fr JOIN members m ON m.id=fr.member_id ORDER BY fr.created_at DESC";
    const r = await pool.query(q, status ? [status] : []);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin — approve family request
router.put("/admin/family-requests/:id/approve", authAdmin, async (req, res) => {
  try {
    const reqRow = await pool.query("SELECT * FROM family_requests WHERE id=$1", [req.params.id]);
    if (!reqRow.rows.length) return res.status(404).json({ error: "Request not found" });

    const familyReq = reqRow.rows[0];
    const data = familyReq.request_data;

    // Auto-process: if add_person, insert into family_people
    if (familyReq.request_type === "add_person") {
      const { first_name, middle_name, last_name, nickname, mobile, dob, gender } = data.person || data;
      await pool.query(
        `INSERT INTO family_people (first_name, middle_name, last_name, nickname, mobile, dob, gender, created_by_member_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT DO NOTHING`,
        [first_name, middle_name||null, last_name, nickname||null, mobile||null, dob||null, gender||null, familyReq.member_id]
      );
    }

    await pool.query(
      "UPDATE family_requests SET status='approved', admin_notes=$1, reviewed_at=NOW() WHERE id=$2",
      [req.body.notes || null, req.params.id]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin — reject family request
router.put("/admin/family-requests/:id/reject", authAdmin, async (req, res) => {
  try {
    await pool.query(
      "UPDATE family_requests SET status='rejected', admin_notes=$1, reviewed_at=NOW() WHERE id=$2",
      [req.body.notes || null, req.params.id]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
