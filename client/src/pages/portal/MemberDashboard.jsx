import { useAuth } from "@/context/AuthContext";

export default function MemberDashboard() {
  const { member, logout } = useAuth();

  if (!member) return null;

  const dobFormatted = member.dob
    ? new Date(member.dob).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  const joinedFormatted = member.created_at
    ? new Date(member.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "—";

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        {/* Profile header */}
        <div style={styles.profileHeader}>
          <div style={styles.avatarWrap}>
            {member.photo_url
              ? <img src={member.photo_url} alt={member.full_name} style={styles.avatar} />
              : <div style={styles.avatarFallback}>{member.full_name?.charAt(0)?.toUpperCase()}</div>
            }
            <div style={styles.verifiedBadge} title="Verified Member">✓</div>
          </div>
          <h2 style={styles.name}>{member.full_name}</h2>
          <p style={styles.subtitle}>Ayarewadi Village Member</p>

          <div style={styles.statusRow}>
            <span style={styles.badge}>✅ Approved</span>
            <span style={styles.badge}>📱 Verified</span>
          </div>
        </div>

        {/* Details */}
        <div style={styles.detailsGrid}>
          <DetailRow icon="📞" label="Mobile" value={member.mobile} />
          <DetailRow icon="📅" label="Date of Birth" value={dobFormatted} />
          {member.email && <DetailRow icon="📧" label="Email" value={member.email} />}
          {member.address && <DetailRow icon="📍" label="Address" value={member.address} />}
          <DetailRow icon="🗓️" label="Member Since" value={joinedFormatted} />
        </div>

        {/* Village info box */}
        <div style={styles.infoBox}>
          <span style={{ fontSize: "1.2rem" }}>🏠</span>
          <div>
            <div style={{ fontWeight: 700, color: "#1b5e20", fontSize: "0.9rem" }}>Ayarewadi Village Portal</div>
            <div style={{ fontSize: "0.8rem", color: "#555" }}>
              आयरेवाडी · मांगवली · वैभववाडी · सिंधुदुर्ग
            </div>
          </div>
        </div>

        {/* Logout */}
        <button style={styles.logoutBtn} onClick={logout}>
          🚪 Logout · बाहेर पडा
        </button>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div style={detailStyles.row}>
      <span style={detailStyles.icon}>{icon}</span>
      <div>
        <div style={detailStyles.label}>{label}</div>
        <div style={detailStyles.value}>{value}</div>
      </div>
    </div>
  );
}

const detailStyles = {
  row:   { display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: "1px solid #f5f5f5" },
  icon:  { fontSize: "1.2rem", marginTop: 2, flexShrink: 0 },
  label: { fontSize: "0.72rem", color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" },
  value: { fontSize: "0.95rem", color: "#222", fontWeight: 500, marginTop: 2 },
};

const styles = {
  wrap: { display: "flex", justifyContent: "center", padding: "2rem 1rem 3rem" },
  card: { background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", padding: "2rem", width: "100%", maxWidth: 440 },
  profileHeader: { textAlign: "center", paddingBottom: "1.5rem", borderBottom: "1px solid #f0f0f0", marginBottom: "1rem" },
  avatarWrap: { position: "relative", display: "inline-block", marginBottom: "1rem" },
  avatar: { width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: "4px solid #4caf50" },
  avatarFallback: { width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, #2e7d32, #81c784)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", color: "#fff", fontWeight: 800, border: "4px solid #4caf50" },
  verifiedBadge: { position: "absolute", bottom: 4, right: 4, background: "#4caf50", color: "#fff", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, border: "2px solid #fff" },
  name: { fontSize: "1.5rem", fontWeight: 800, color: "#1b5e20", margin: "0 0 4px" },
  subtitle: { fontSize: "0.85rem", color: "#888", margin: "0 0 12px" },
  statusRow: { display: "flex", justifyContent: "center", gap: 8 },
  badge: { background: "#e8f5e9", color: "#2e7d32", border: "1px solid #c8e6c9", borderRadius: 20, padding: "3px 12px", fontSize: "0.75rem", fontWeight: 700 },
  detailsGrid: { marginBottom: "1.5rem" },
  infoBox: { background: "#f1f8e9", border: "1px solid #c8e6c9", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" },
  logoutBtn: { width: "100%", background: "#fff", border: "2px solid #e53935", color: "#e53935", padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", transition: "all 0.2s" },
};
