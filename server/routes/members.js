require("dotenv").config();
const express    = require("express");
const router     = express.Router();
const bcrypt     = require("bcrypt");
const jwt        = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const multer     = require("multer");
const pool       = require("../db");
const authMember = require("../middleware/authMember");

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

    if (!full_name || !dob || !mobile || !password) {
      return res.status(400).json({ error: "full_name, dob, mobile and password are required" });
    }

    const dup = await pool.query("SELECT id FROM members WHERE mobile = $1", [mobile]);
    if (dup.rows.length) {
      return res.status(409).json({ error: "Mobile number already registered" });
    }

    const password_hash = await bcrypt.hash(password, 12);

    let photo_url = null;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "ayarewadi/members",
            transformation: [{ quality: "auto", width: 400, height: 400, crop: "fill", gravity: "face" }],
          },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      photo_url = result.secure_url;
    }

    const r = await pool.query(
      `INSERT INTO members (full_name, dob, mobile, email, address, photo_url, password_hash, approved, verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7,false,false)
       RETURNING id, full_name, mobile, created_at`,
      [full_name, dob, mobile, email || null, address || null, photo_url, password_hash]
    );

    res.status(201).json({
      success: true,
      message: "Registration successful. Awaiting admin approval.",
      member: r.rows[0],
    });
  } catch (e) {
    console.error("register error:", e);
    res.status(500).json({ error: "Registration failed: " + e.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ error: "Mobile and password required" });
    }

    const r = await pool.query("SELECT * FROM members WHERE mobile = $1", [mobile]);
    if (!r.rows.length) return res.status(401).json({ error: "Invalid credentials" });

    const member = r.rows[0];
    const match  = await bcrypt.compare(password, member.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    if (!member.approved) {
      return res.status(403).json({ error: "Your account is pending admin approval." });
    }

    if (!member.verified) {
      return res.json({ needsOtp: true, mobile: member.mobile, memberId: member.id });
    }

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
      },
    });
  } catch (e) {
    console.error("login error:", e);
    res.status(500).json({ error: "Login failed" });
  }
});

// ── VERIFY OTP (first login) ──────────────────────────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { mobile, firebase_uid } = req.body;
    if (!mobile || !firebase_uid) {
      return res.status(400).json({ error: "mobile and firebase_uid required" });
    }

    const r = await pool.query("SELECT * FROM members WHERE mobile = $1", [mobile]);
    if (!r.rows.length) return res.status(404).json({ error: "Member not found" });

    const member = r.rows[0];
    if (!member.approved) return res.status(403).json({ error: "Account not approved" });

    await pool.query(
      "UPDATE members SET verified = true, firebase_uid = $1 WHERE id = $2",
      [firebase_uid, member.id]
    );

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
      },
    });
  } catch (e) {
    console.error("verify-otp error:", e);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

// ── ME (protected) ────────────────────────────────────────
router.get("/me", authMember, async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT id, full_name, dob, mobile, email, address, photo_url, created_at FROM members WHERE id = $1",
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
    if (!mobile) return res.status(400).json({ error: "Mobile required" });

    const r = await pool.query(
      "SELECT id, full_name FROM members WHERE mobile = $1",
      [mobile]
    );
    if (!r.rows.length) {
      return res.status(404).json({ error: "No account found with this mobile number" });
    }

    await pool.query(
      `INSERT INTO password_reset_requests (member_id, mobile, email, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [r.rows[0].id, mobile, email || null]
    );

    res.json({ success: true, message: "Reset request submitted. Admin will contact you soon." });
  } catch (e) {
    console.error("forgot-password error:", e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
