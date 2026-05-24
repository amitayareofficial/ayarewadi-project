import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { TimelineContent } from "./ui/timeline-animation.jsx";

const API2 = "https://ayarewadi-project.onrender.com";

const TAB_ICONS = {
  Hospital:   "🏥",
  Police:     "👮",
  School:     "🏫",
  Government: "🏛️",
};

const revealVariants = {
  visible: (i) => ({
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { delay: i * 0.15, duration: 0.45 },
  }),
  hidden: {
    filter: "blur(8px)",
    y: 18,
    opacity: 0,
  },
};

export function Emergency() {
  const [data, setData]  = useState([]);
  const [tab, setTab]    = useState("Hospital");
  const TABS = ["Hospital", "Police", "School", "Government"];
  const sectionRef = useRef(null);

  useEffect(() => {
    axios.get(`${API2}/emergency`)
      .then(r => setData(r.data))
      .catch(() => setData([]));
  }, []);

  const filtered = data.filter(d => d.type === tab);

  return (
    <section ref={sectionRef} className="page-section">

      {/* ── Header ── */}
      <TimelineContent animationNum={1} timelineRef={sectionRef} customVariants={revealVariants} once>
        <div className="sec-header">
          <span className="eyebrow">Help & Safety</span>
          <h2>🚨 Emergency & Services</h2>
        </div>
      </TimelineContent>

      {/* ── Alert banner ── */}
      <TimelineContent animationNum={2} timelineRef={sectionRef} customVariants={revealVariants} once>
        <div className="alert-banner">
          ⚠️ &nbsp;
          <strong>108</strong> Free Ambulance &nbsp;|&nbsp;
          <strong>102</strong> Ambulance &nbsp;|&nbsp;
          <strong>112</strong> National Emergency &nbsp;|&nbsp;
          Sindhudurg: <strong>8149822015</strong>
        </div>
      </TimelineContent>

      {/* ── Tabs ── */}
      <TimelineContent animationNum={3} timelineRef={sectionRef} customVariants={revealVariants} once>
        <div className="emg-tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`emg-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {TAB_ICONS[t]} {t}
            </button>
          ))}
        </div>
      </TimelineContent>

      {/* ── Cards ── */}
      {filtered.length === 0 ? (
        <TimelineContent animationNum={4} timelineRef={sectionRef} customVariants={revealVariants} once>
          <p className="empty-msg">
            No {tab} contacts added yet. Admin can add from the admin panel.
          </p>
        </TimelineContent>
      ) : (
        <div className="emg-cards">
          {filtered.map((item, index) => (
            <TimelineContent
              key={item.id}
              animationNum={4 + index}
              timelineRef={sectionRef}
              customVariants={revealVariants}
              once
            >
              <div className="emg-card">
                <div className="emg-icon">{TAB_ICONS[item.type]}</div>
                <div className="emg-body">
                  <h3>{item.name}</h3>
                  {item.phone && (
                    <a
                      href={`tel:${item.phone}`}
                      className="btn-call"
                      style={{ display: "inline-block", margin: "6px 0" }}
                    >
                      📞 {item.phone}
                    </a>
                  )}
                  {item.emergency_contact && (
                    <p><strong>Emergency:</strong> {item.emergency_contact}</p>
                  )}
                  {item.address && (
                    <p className="emg-addr">📍 {item.address}</p>
                  )}
                  {item.maps_url && (
                    <a
                      href={item.maps_url}
                      target="_blank"
                      rel="noreferrer"
                      className="maps-link"
                    >
                      🗺️ Open in Google Maps
                    </a>
                  )}
                </div>
              </div>
            </TimelineContent>
          ))}
        </div>
      )}

    </section>
  );
}
