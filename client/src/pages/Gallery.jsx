import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://ayarewadi-project.onrender.com";

const CAT_ICONS = {
  "Sports":            "⚽",
  "Ravalnath Temple":  "🛕",
  "Meetings":          "🤝",
  "Village Festivals": "🎉",
  "Mumbai Meeting":    "🏙️",
  "Ganesh Chaturthi":  "🐘",
  "Gudhi Padwa":       "🎋",
  "Shimga (Holi)":     "🎨",
};

const CAT_MR = {
  "Sports":            "क्रीडा",
  "Ravalnath Temple":  "रवळनाथ मंदिर",
  "Meetings":          "सभा",
  "Village Festivals": "गाव उत्सव",
  "Mumbai Meeting":    "मुंबई सभा",
  "Ganesh Chaturthi":  "गणेश चतुर्थी",
  "Gudhi Padwa":       "गुढी पाडवा",
  "Shimga (Holi)":     "शिमगा (होळी)",
};

export default function Gallery_Page({ lang }) {
  const isMr = lang === "mr";

  const [level, setLevel]           = useState("years");
  const [years, setYears]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [photos, setPhotos]         = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedCat, setSelectedCat]   = useState(null);
  const [loading, setLoading]       = useState(false);
  const [lbIdx, setLbIdx]           = useState(null);

  // Load years on mount
  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/gallery/years`)
      .then(r => setYears(r.data))
      .catch(() => setYears([]))
      .finally(() => setLoading(false));
  }, []);

  // Lightbox keyboard navigation
  useEffect(() => {
    if (lbIdx === null) return;
    const handler = e => {
      if (e.key === "Escape")     setLbIdx(null);
      if (e.key === "ArrowLeft")  setLbIdx(i => (i - 1 + photos.length) % photos.length);
      if (e.key === "ArrowRight") setLbIdx(i => (i + 1) % photos.length);
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [lbIdx, photos.length]);

  const selectYear = year => {
    setSelectedYear(year);
    setLevel("categories");
    setLoading(true);
    axios.get(`${API}/gallery/categories?year=${year}`)
      .then(r => setCategories(r.data))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  const selectCat = cat => {
    setSelectedCat(cat);
    setLevel("photos");
    setLoading(true);
    axios.get(`${API}/gallery?year=${selectedYear}&category=${encodeURIComponent(cat)}`)
      .then(r => setPhotos(r.data))
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));
  };

  const goToYears = () => {
    setLevel("years"); setSelectedYear(null); setSelectedCat(null);
    setCategories([]); setPhotos([]);
  };
  const goToCats = () => {
    setLevel("categories"); setSelectedCat(null); setPhotos([]);
  };

  const download = async (url, caption) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = (caption || "ayarewadi-photo") + ".jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch { window.open(url, "_blank"); }
  };

  const prev = () => setLbIdx(i => (i - 1 + photos.length) % photos.length);
  const next = () => setLbIdx(i => (i + 1) % photos.length);

  return (
    <section className="page-section">

      {/* ── Header ── */}
      <div className="sec-header">
        <span className="eyebrow">{isMr ? "आठवणी" : "Memories"}</span>
        <h2 className="gallery-heading">
          📸 {isMr ? "गाव फोटो | Village Gallery" : "Village Gallery | गाव फोटो"}
        </h2>
      </div>

      {/* ── Breadcrumb ── */}
      {level !== "years" && (
        <nav className="glry-breadcrumb">
          <button className="glry-bc-btn" onClick={goToYears}>
            {isMr ? "सर्व वर्षे" : "All Years"}
          </button>
          {selectedYear && (
            <>
              <span className="glry-bc-sep">›</span>
              <button
                className={`glry-bc-btn ${level === "categories" ? "glry-bc-current" : ""}`}
                onClick={level === "photos" ? goToCats : undefined}
                style={{ cursor: level === "photos" ? "pointer" : "default" }}
              >
                {selectedYear}
              </button>
            </>
          )}
          {selectedCat && level === "photos" && (
            <>
              <span className="glry-bc-sep">›</span>
              <span className="glry-bc-current">
                {CAT_ICONS[selectedCat] || ""} {isMr ? (CAT_MR[selectedCat] || selectedCat) : selectedCat}
              </span>
            </>
          )}
        </nav>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="glry-loading">
          <div className="glry-spinner" />
          <p>{isMr ? "लोड होत आहे..." : "Loading..."}</p>
        </div>
      )}

      {/* ════════════════════════
          LEVEL 1 — Year cards
      ════════════════════════ */}
      {!loading && level === "years" && (
        years.length === 0 ? (
          <div className="glry-empty-state">
            <span>📷</span>
            <p>{isMr ? "अद्याप फोटो उपलब्ध नाहीत" : "No photos available yet"}</p>
          </div>
        ) : (
          <div className="glry-year-grid">
            {years.map(y => (
              <button key={y.year} className="glry-year-card" onClick={() => selectYear(y.year)}>
                {y.cover
                  ? <img src={y.cover} alt={String(y.year)} loading="lazy" />
                  : <div className="glry-placeholder">📷</div>
                }
                <div className="glry-year-overlay" />
                <div className="glry-year-content">
                  <span className="glry-year-num">{y.year}</span>
                  <span className="glry-year-count">
                    {y.count} {isMr ? "फोटो" : "photos"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )
      )}

      {/* ════════════════════════
          LEVEL 2 — Categories
      ════════════════════════ */}
      {!loading && level === "categories" && (
        <>
          <p className="glry-level-sub">
            {isMr ? `${selectedYear} मधील फोटो` : `Photos from ${selectedYear}`}
          </p>
          {categories.length === 0 ? (
            <div className="glry-empty-state">
              <span>📁</span>
              <p>{isMr ? "या वर्षासाठी फोटो नाहीत" : "No photos for this year"}</p>
            </div>
          ) : (
            <div className="glry-cat-grid">
              {categories.map(c => (
                <button key={c.category} className="glry-cat-card" onClick={() => selectCat(c.category)}>
                  {c.cover
                    ? <img src={c.cover} alt={c.category} loading="lazy" />
                    : <div className="glry-placeholder">{CAT_ICONS[c.category] || "📷"}</div>
                  }
                  <div className="glry-cat-overlay" />
                  <div className="glry-cat-content">
                    <span className="glry-cat-emoji">{CAT_ICONS[c.category] || "📷"}</span>
                    <span className="glry-cat-label">
                      {isMr ? (CAT_MR[c.category] || c.category) : c.category}
                    </span>
                    <span className="glry-cat-pill">
                      {c.count} {isMr ? "फोटो" : "photos"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════
          LEVEL 3 — Photo grid
      ════════════════════════ */}
      {!loading && level === "photos" && (
        <>
          <p className="glry-level-sub">
            {isMr
              ? `${selectedYear} · ${CAT_MR[selectedCat] || selectedCat}`
              : `${selectedYear} · ${selectedCat}`
            }
            {photos.length > 0 && (
              <span className="glry-count-inline"> — {photos.length} {isMr ? "फोटो" : "photos"}</span>
            )}
          </p>
          {photos.length === 0 ? (
            <div className="glry-empty-state">
              <span>🖼️</span>
              <p>{isMr ? "फोटो सापडले नाहीत" : "No photos found"}</p>
            </div>
          ) : (
            <div className="glry-photo-grid">
              {photos.map((p, i) => (
                <button key={p.id || i} className="glry-photo-item" onClick={() => setLbIdx(i)}>
                  <img src={p.thumbnail_url || p.url} alt={p.caption || ""} loading="lazy" />
                  {p.caption && <div className="glry-photo-caption">{p.caption}</div>}
                  <div className="glry-photo-zoom">🔍</div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════
          LIGHTBOX
      ════════════════════════ */}
      {lbIdx !== null && photos[lbIdx] && (
        <div className="glry-lightbox" onClick={() => setLbIdx(null)}>
          <div className="glry-lb-box" onClick={e => e.stopPropagation()}>

            <button className="glry-lb-close" onClick={() => setLbIdx(null)} title="Close (Esc)">
              ✕
            </button>

            <div className="glry-lb-img-wrap">
              <img
                key={lbIdx}
                src={photos[lbIdx].url}
                alt={photos[lbIdx].caption || ""}
              />
            </div>

            <div className="glry-lb-bar">
              <div className="glry-lb-meta">
                {photos[lbIdx].caption && (
                  <p className="glry-lb-caption">{photos[lbIdx].caption}</p>
                )}
                <span className="glry-lb-counter">{lbIdx + 1} / {photos.length}</span>
              </div>
              <button
                className="glry-lb-dl"
                onClick={() => download(photos[lbIdx].url, photos[lbIdx].caption)}
              >
                ⬇ {isMr ? "डाउनलोड" : "Download HD"}
              </button>
            </div>

            {photos.length > 1 && (
              <>
                <button className="glry-lb-prev" onClick={prev} title="Previous (←)">‹</button>
                <button className="glry-lb-next" onClick={next} title="Next (→)">›</button>
              </>
            )}
          </div>
        </div>
      )}

    </section>
  );
}
