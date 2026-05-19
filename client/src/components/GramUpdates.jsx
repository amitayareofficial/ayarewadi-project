
// ════════════════════════════════════════════════════════
// pages/GramUpdates.jsx — Public data page
// Anyone can view events, budget, gallery without login
// ════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import axios from "axios";

const API3 = "https://ayarewadi-project.onrender.com";

export function GramUpdates() {
  const [events, setEvents]   = useState([]);
  const [budget, setBudget]   = useState([]);
  const [gallery, setGallery] = useState([]);
  const [tab, setTab]         = useState("events");

  useEffect(() => {
    axios.get(`${API3}/events`).then(r => setEvents(r.data)).catch(() => {});
    axios.get(`${API3}/budget`).then(r => setBudget(r.data)).catch(() => {});
    axios.get(`${API3}/gallery`).then(r => setGallery(r.data.slice(0, 12))).catch(() => {});
  }, []);

  // Calculate balance
  const balance = budget.reduce((acc, e) =>
    e.type === "income" ? acc + Number(e.amount) : acc - Number(e.amount), 0);

  return (
    <section className="page-section">
      <div className="sec-header">
        <span className="eyebrow">Transparency</span>
        <h2>🌿 Gram Updates | ग्राम अपडेट्स</h2>
        <p style={{color:"var(--muted)", fontSize:"0.88rem", marginTop:"6px"}}>
          Public information — No login required
        </p>
      </div>

      {/* TABS */}
      <div className="emg-tabs">
        <button className={`emg-tab ${tab === "events"  ? "active" : ""}`} onClick={() => setTab("events")}>📅 Events</button>
        <button className={`emg-tab ${tab === "budget"  ? "active" : ""}`} onClick={() => setTab("budget")}>💰 Budget</button>
        <button className={`emg-tab ${tab === "gallery" ? "active" : ""}`} onClick={() => setTab("gallery")}>📸 Photos</button>
      </div>

      {/* EVENTS TAB */}
      {tab === "events" && (
        <div className="events-list">
          {events.length === 0 && <p className="empty-msg">No events yet.</p>}
          {events.map(ev => (
            <div className="event-card" key={ev.id}>
              <div className="event-date">📅 {new Date(ev.date).toDateString()}</div>
              <h3>{ev.title}</h3>
              <p>{ev.description}</p>
              {ev.category && <span className="tag">{ev.category}</span>}
            </div>
          ))}
        </div>
      )}

      {/* BUDGET TAB */}
      {tab === "budget" && (
        <>
          <div className="balance-display">
            <span>Village Balance</span>
            <strong>₹{balance.toLocaleString()}</strong>
          </div>
          <table className="budget-table">
            <thead><tr><th>Description</th><th>Month</th><th>Type</th><th>Amount</th></tr></thead>
            <tbody>
              {budget.map(b => (
                <tr key={b.id}>
                  <td>{b.description}</td>
                  <td>{b.month}</td>
                  <td><span className={`tag ${b.type}`}>{b.type}</span></td>
                  <td>₹{Number(b.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* GALLERY TAB */}
      {tab === "gallery" && (
        <div className="gallery-grid">
          {gallery.map(p => (
            <div className="gallery-item" key={p.id}>
              <img src={p.thumbnail_url || p.url} alt={p.caption} />
              <div className="gallery-caption">{p.caption || p.category}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}