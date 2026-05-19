
// ════════════════════════════════════════════════════════
// pages/Emergency.jsx — Tabbed emergency page
// All data from DB, admin can add/edit via admin panel
// ════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import axios from "axios";

const API2 = "https://ayarewadi-project.onrender.com";

const TAB_ICONS = {
  Hospital:   "🏥",
  Police:     "👮",
  School:     "🏫",
  Government: "🏛️",
};

export function Emergency() {
  const [data, setData]     = useState([]);
  const [tab, setTab]       = useState("Hospital");
  const TABS = ["Hospital", "Police", "School", "Government"];

  useEffect(() => {
    axios.get(`${API2}/emergency`)
      .then(r => setData(r.data))
      .catch(() => setData([]));
  }, []);

  const filtered = data.filter(d => d.type === tab);

  return (
    <section className="page-section">
      <div className="sec-header">
        <span className="eyebrow">Help & Safety</span>
        <h2>🚨 Emergency & Services</h2>
      </div>

      {/* ALERT */}
      <div className="alert-banner">
        ⚠️ &nbsp;
        <strong>108</strong> Free Ambulance &nbsp;|&nbsp;
        <strong>102</strong> Ambulance &nbsp;|&nbsp;
        <strong>112</strong> National Emergency &nbsp;|&nbsp;
        Sindhudurg: <strong>8149822015</strong>
      </div>

      {/* TABS */}
      <div className="emg-tabs">
        {TABS.map(t => (
          <button key={t} className={`emg-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {TAB_ICONS[t]} {t}
          </button>
        ))}
      </div>

      {/* CARDS */}
      {filtered.length === 0 ? (
        <p className="empty-msg">No {tab} contacts added yet. Admin can add from the admin panel.</p>
      ) : (
        <div className="emg-cards">
          {filtered.map(item => (
            <div className="emg-card" key={item.id}>
              <div className="emg-icon">{TAB_ICONS[item.type]}</div>
              <div className="emg-body">
                <h3>{item.name}</h3>
                {item.phone && (
                  <a href={`tel:${item.phone}`} className="btn-call" style={{display:"inline-block", margin:"6px 0"}}>
                    📞 {item.phone}
                  </a>
                )}
                {item.emergency_contact && (
                  <p><strong>Emergency:</strong> {item.emergency_contact}</p>
                )}
                {item.address && <p className="emg-addr">📍 {item.address}</p>}
                {item.maps_url && (
                  <a href={item.maps_url} target="_blank" rel="noreferrer" className="maps-link">
                    🗺️ Open in Google Maps
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
