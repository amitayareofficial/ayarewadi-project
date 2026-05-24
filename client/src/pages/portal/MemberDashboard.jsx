import { useAuth } from "@/context/AuthContext";

export default function MemberDashboard() {
  const { member, logout } = useAuth();
  if (!member) return null;

  const dob      = member.dob      ? new Date(member.dob).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" }) : "—";
  const joinedOn = member.created_at ? new Date(member.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" }) : "—";

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        {/* Profile header */}
        <div style={s.profileHeader}>
          <div style={s.avatarWrap}>
            {member.photo_url
              ? <img src={member.photo_url} alt={member.full_name} style={s.avatar} />
              : <div style={s.avatarFallback}>{member.full_name?.charAt(0)?.toUpperCase()}</div>
            }
            <div style={s.approvedDot} title="Approved Member">✓</div>
          </div>

          <h2 style={s.name}>{member.full_name}</h2>
          <p style={s.subtitle}>Ayarewadi Village Member</p>
          <span style={s.badge}>✅ Approved Member</span>
        </div>

        {/* Details */}
        <div style={s.details}>
          <Row icon="📞" label="Mobile"       value={member.mobile} />
          <Row icon="📅" label="Date of Birth" value={dob} />
          {member.email   && <Row icon="📧" label="Email"    value={member.email} />}
          {member.address && <Row icon="📍" label="Address"  value={member.address} />}
          <Row icon="🗓️" label="Member Since" value={joinedOn} />
        </div>

        {/* Village banner */}
        <div style={s.banner}>
          <span style={{ fontSize:"1.3rem" }}>🏠</span>
          <div>
            <div style={{ fontWeight:700, color:"#1b5e20", fontSize:"0.88rem" }}>Ayarewadi Village Portal</div>
            <div style={{ fontSize:"0.75rem", color:"#666" }}>आयरेवाडी · मांगवली · वैभववाडी · सिंधुदुर्ग</div>
          </div>
        </div>

        {/* Logout */}
        <button style={s.logoutBtn} onClick={logout}>
          🚪 Logout · बाहेर पडा
        </button>
      </div>
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div style={r.row}>
      <span style={r.icon}>{icon}</span>
      <div>
        <div style={r.label}>{label}</div>
        <div style={r.value}>{value}</div>
      </div>
    </div>
  );
}

const r = {
  row:   { display:"flex", alignItems:"flex-start", gap:12, padding:"10px 0", borderBottom:"1px solid #f5f5f5" },
  icon:  { fontSize:"1.1rem", marginTop:3, flexShrink:0 },
  label: { fontSize:"0.68rem", color:"#aaa", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" },
  value: { fontSize:"0.95rem", color:"#222", fontWeight:500, marginTop:2 },
};

const s = {
  wrap:          { display:"flex", justifyContent:"center", padding:"2rem 1rem 3rem" },
  card:          { background:"#fff", borderRadius:20, boxShadow:"0 2px 20px rgba(0,0,0,0.08)", padding:"2rem", width:"100%", maxWidth:440 },
  profileHeader: { textAlign:"center", paddingBottom:"1.5rem", borderBottom:"1px solid #f0f0f0", marginBottom:"1rem" },
  avatarWrap:    { position:"relative", display:"inline-block", marginBottom:"1rem" },
  avatar:        { width:100, height:100, borderRadius:"50%", objectFit:"cover", border:"3px solid #4caf50" },
  avatarFallback:{ width:100, height:100, borderRadius:"50%", background:"linear-gradient(135deg,#2e7d32,#81c784)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.5rem", color:"#fff", fontWeight:800, border:"3px solid #4caf50" },
  approvedDot:   { position:"absolute", bottom:4, right:4, background:"#4caf50", color:"#fff", borderRadius:"50%", width:24, height:24, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.72rem", fontWeight:800, border:"2px solid #fff" },
  name:          { fontSize:"1.4rem", fontWeight:800, color:"#1b5e20", margin:"0 0 4px" },
  subtitle:      { fontSize:"0.82rem", color:"#aaa", margin:"0 0 10px" },
  badge:         { background:"#e8f5e9", color:"#2e7d32", border:"1px solid #c8e6c9", borderRadius:20, padding:"3px 14px", fontSize:"0.75rem", fontWeight:700 },
  details:       { marginBottom:"1.25rem" },
  banner:        { background:"#f1f8e9", border:"1px solid #dcedc8", borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:12, marginBottom:"1.5rem" },
  logoutBtn:     { width:"100%", background:"#fff", border:"2px solid #e53935", color:"#e53935", padding:"12px", borderRadius:12, fontWeight:700, fontSize:"0.95rem", cursor:"pointer" },
};
