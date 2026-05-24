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

// ── REGISTER ─────────────────────────────────────────────
router.post("/register", upload.single("photo"), async (req, res) => {
  try {
    const { full_name, dob, mobile, email, address, password } = req.body;

    if (!full_name?.trim())              return res.status(400).json({ error: "Full name is required" });
    if (!dob)                            return res.status(400).json({ error: "Date of birth is required" });
    if (!mobile)                         return res.status(400).json({ error: "Mobile number is required" });
    if (!/^[6-9]\d{9}$/.test(mobile))   return res.status(400).json({ error: "Enter a valid 10-digit Indian mobile number" });
    if (!password)                       return res.status(400).json({ error: "Password is required" });
    if (!req.file)                       return res.status(400).json({ error: "Photo is required" });

    const dup = await pool.query("SELECT id FROM members WHERE mobile = $1", [mobile]);
    if (dup.rows.length) return res.status(409).json({ error: "Mobile number already registered" });

    const password_hash = await bcrypt.hash(password, 12);

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "ayarewadi/members",
          transformation: [{ quality: "auto", width: 400, height: 400, crop: "fill", gravity: "face" }],
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    const r = await pool.query(
      `INSERT INTO members (full_name, dob, mobile, email, address, photo_url, password_hash, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')
       RETURNING id, full_name, mobile, status, created_at`,
      [full_name.trim(), dob, mobile, email?.trim() || null, address?.trim() || null, uploadResult.secure_url, password_hash]
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
        id:        member.id,
        full_name: member.full_name,
        mobile:    member.mobile,
        email:     member.email,
        photo_url: member.photo_url,
        address:   member.address,
        dob:       member.dob,
        status:    member.status,
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
      "SELECT id, full_name, dob, mobile, email, address, photo_url, status, created_at FROM members WHERE id = $1",
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
//  ADMIN ROUTES
// ═══════════════════════════════════════════════════════════

// GET all members
router.get("/admin/all", authAdmin, async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT id, full_name, dob, mobile, email, address, photo_url, status, created_at FROM members ORDER BY created_at DESC"
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT approve member
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

// PUT reject member
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

// DELETE member permanently
router.delete("/admin/:id", authAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM members WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
