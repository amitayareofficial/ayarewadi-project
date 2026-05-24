import React, { useState } from "react";
import {
  motion, useMotionValue, useTransform, useSpring, AnimatePresence,
} from "framer-motion";
import { X, ZoomIn, Download } from "lucide-react";

// ── Green generative art canvas (animates on hover) ───────
const GenerativeArtCanvas = ({ isHovered }) => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let rafId;

    class Line {
      constructor() { this.reset(); }
      reset() {
        this.x     = Math.random() * canvas.width;
        this.y     = Math.random() * canvas.height;
        this.speed = Math.random() * 0.55 + 0.1;
        this.angle = Math.random() * Math.PI * 2;
        this.len   = Math.random() * 18 + 4;
      }
      update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height)
          this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
          this.x - Math.cos(this.angle) * this.len,
          this.y - Math.sin(this.angle) * this.len,
        );
        ctx.strokeStyle = `rgba(74,222,128,${(Math.random() * 0.35 + 0.08).toFixed(2)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    canvas.width  = 400;
    canvas.height = 400;
    const lines = Array.from({ length: 30 }, () => new Line());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (isHovered) lines.forEach(l => { l.update(); l.draw(); });
      rafId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(rafId);
  }, [isHovered]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
    />
  );
};

// ── 3D tilt gallery card ──────────────────────────────────
const GalleryCard = ({ item, index, onExpand, catLabel }) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(useSpring(y), [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(useSpring(x), [-0.5, 0.5], ["-7deg", "7deg"]);

  const onMove = e => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top)  / r.height - 0.5);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      variants={{
        hidden:  { y: 48, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.35, duration: 0.75, delay: (index % 3) * 0.08 } },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onClick={() => onExpand(item)}
      className="group relative h-64 sm:h-72 w-full rounded-2xl bg-zinc-900 border border-zinc-800 cursor-pointer select-none"
    >
      <div
        style={{ transform: "translateZ(36px)", transformStyle: "preserve-3d" }}
        className="absolute inset-3 rounded-xl overflow-hidden"
      >
        {/* Photo */}
        <img
          src={item.src}
          alt={item.label}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Animated green lines */}
        <GenerativeArtCanvas isHovered={isHovered} />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        {/* Category badge */}
        {catLabel && (
          <div className="absolute top-3 left-3 z-10">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-600/85 text-white backdrop-blur-sm">
              {catLabel}
            </span>
          </div>
        )}

        {/* Expand icon */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
            <ZoomIn size={14} />
          </div>
        </div>

        {/* Label slides up on hover */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <motion.p
            animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="text-[15px] font-bold text-white leading-tight"
          >
            {item.label}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

// ── HD Lightbox ───────────────────────────────────────────
const Lightbox = ({ photo, onClose, onDownload, catLabel }) => {
  React.useEffect(() => {
    const fn = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/92 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
        className="relative w-full max-w-4xl flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-zinc-900">
          <img
            src={photo.fullSrc || photo.src}
            alt={photo.label}
            className="w-full max-h-[78vh] object-contain"
          />
        </div>

        {/* Bottom bar */}
        <div className="mt-3 flex items-center justify-between w-full">
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{photo.label}</p>
            {catLabel && <p className="text-green-400 text-xs mt-0.5">{catLabel}</p>}
          </div>
          <div className="flex gap-2 flex-shrink-0 ml-4">
            <button
              onClick={() => onDownload(photo.fullSrc || photo.src, photo.label)}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition-colors"
            >
              <Download size={13} /> HD Download
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Category tabs (horizontally scrollable) ───────────────
const CATEGORY_LABELS = {
  en: { All:"All", Temple:"Temple", Sports:"Sports", Festival:"Festival", Village:"Village", Initiatives:"Initiatives", Nature:"Nature" },
  mr: { All:"सर्व", Temple:"मंदिर", Sports:"क्रीडा", Festival:"उत्सव", Village:"गाव", Initiatives:"उपक्रम", Nature:"निसर्ग" },
};

const CategoryTabs = ({ categories, active, onSelect, lang }) => {
  const L = CATEGORY_LABELS[lang] || CATEGORY_LABELS.en;
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-7 scrollbar-none">
      {categories.map(cat => (
        <motion.button
          key={cat}
          onClick={() => onSelect(cat)}
          whileTap={{ scale: 0.95 }}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
            active === cat
              ? "bg-green-600 text-white shadow-lg shadow-green-600/25"
              : "bg-white text-zinc-600 hover:bg-green-50 hover:text-green-700 border border-zinc-200"
          }`}
        >
          {L[cat] || cat}
        </motion.button>
      ))}
    </div>
  );
};

// ── Main VillageGallery export ────────────────────────────
export default function VillageGallery({ photos = [], lang = "mr", t = {}, onDownload }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightbox, setLightbox] = useState(null);

  const L = CATEGORY_LABELS[lang] || CATEGORY_LABELS.en;

  const rawCats = [...new Set(photos.map(p => p.category).filter(Boolean))];
  const categories = ["All", ...rawCats];

  const filtered = activeCategory === "All"
    ? photos
    : photos.filter(p => p.category === activeCategory);

  return (
    <>
      {/* Category filter tabs */}
      {rawCats.length > 0 && (
        <CategoryTabs
          categories={categories}
          active={activeCategory}
          onSelect={cat => setActiveCategory(cat)}
          lang={lang}
        />
      )}

      {/* Count */}
      <p className="text-zinc-400 text-xs mb-5">
        {filtered.length} {lang === "mr" ? "फोटो" : "photos"}
        {activeCategory !== "All" && ` · ${L[activeCategory] || activeCategory}`}
      </p>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="py-20 text-center text-zinc-400 text-sm">
          {t.empty || "No photos found"}
        </div>
      )}

      {/* 3D card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item, i) => (
          <GalleryCard
            key={`${item.src}-${i}`}
            item={item}
            index={i}
            catLabel={L[item.category] || item.category}
            onExpand={setLightbox}
          />
        ))}
      </div>

      {/* HD Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox
            photo={lightbox}
            catLabel={L[lightbox.category] || lightbox.category}
            onClose={() => setLightbox(null)}
            onDownload={onDownload}
          />
        )}
      </AnimatePresence>
    </>
  );
}
