// ════════════════════════════════════════════════════════
// components/Marquee.jsx — Running news ticker
// Fetches announcements from your backend DB
// ════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://ayarewadi-project.onrender.com";

export function Marquee() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get(`${API}/announcements`)
      .then(r => setItems(r.data))
      .catch(() => setItems([
        { id: 1, text: "🎉 रवळनाथ जत्रा - November 2025" },
        { id: 2, text: "📅 ग्रामसभा बैठक - June 20, 2025" },
        { id: 3, text: "🌿 Welcome to Ayarewadi Village Portal" },
      ]));
  }, []);

  if (!items.length) return null;

  return (
    <div className="marquee-wrap">
      <span className="marquee-label">📢 Live</span>
      <div className="marquee-track">
        <div className="marquee-inner">
          {/* Duplicate items for seamless loop */}
          {[...items, ...items].map((item, i) => (
            <span key={i} className="marquee-item">
              {item.text} &nbsp;&nbsp;•&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}