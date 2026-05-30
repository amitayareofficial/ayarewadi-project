import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote, X } from "lucide-react";
import { cn } from "../../lib/utils";

const BG_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop";

// ── Outside-click hook ───────────────────────────────────
function useOutsideClick(ref, callback) {
  useEffect(() => {
    const handler = e => {
      if (!ref.current || ref.current.contains(e.target)) return;
      callback();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, callback]);
}

// ── Carousel ────────────────────────────────────────────
export function Carousel({ items, initialScroll = 0 }) {
  const carouselRef = useRef(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const check = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      check();
    }
  }, [initialScroll]);

  const scrollBy = dx => carouselRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  const handleCardClose = index => {
    if (!carouselRef.current) return;
    const isMobile = window.innerWidth < 768;
    const cardW = isMobile ? 230 : 384;
    const gap   = isMobile ? 4 : 8;
    carouselRef.current.scrollTo({ left: (cardW + gap) * (index + 1), behavior: "smooth" });
  };

  return (
    <div className="relative w-full mt-6">
      <div
        ref={carouselRef}
        onScroll={check}
        className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth [scrollbar-width:none] py-5"
      >
        <div className="flex flex-row justify-start gap-4 pl-3 max-w-5xl mx-auto">
          {items.map((item, index) => (
            <motion.div
              key={`card-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.15 * index, ease: "easeOut" } }}
              className="last:pr-[5%] md:last:pr-[33%] rounded-3xl"
            >
              {React.cloneElement(item, { onCardClose: () => handleCardClose(index) })}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll buttons */}
      <div className="flex justify-end gap-2 mt-4 pr-3">
        <button
          onClick={() => scrollBy(-300)}
          disabled={!canScrollLeft}
          className="h-10 w-10 rounded-full bg-[#4b3f33] flex items-center justify-center disabled:opacity-40 hover:bg-[#4b3f33]/80 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-[#f2f0eb]" />
        </button>
        <button
          onClick={() => scrollBy(300)}
          disabled={!canScrollRight}
          className="h-10 w-10 rounded-full bg-[#4b3f33] flex items-center justify-center disabled:opacity-40 hover:bg-[#4b3f33]/80 transition-colors"
        >
          <ArrowRight className="h-5 w-5 text-[#f2f0eb]" />
        </button>
      </div>
    </div>
  );
}

// ── Profile image ────────────────────────────────────────
export function ProfileImage({ src, alt, initials }) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="w-[90px] h-[90px] md:w-[150px] md:h-[150px] opacity-80 overflow-hidden rounded-full border-[3px] border-[rgba(59,59,59,0.6)] flex-none saturate-[0.2] sepia-[0.46] relative bg-[#c9b99a] flex items-center justify-center">
      {src ? (
        <img
          src={src}
          alt={alt || "Profile"}
          loading="lazy"
          onLoad={() => setLoading(false)}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition duration-300",
            loading ? "blur-sm" : "blur-0"
          )}
        />
      ) : (
        <span className="text-3xl md:text-4xl font-bold text-[rgba(59,59,59,0.8)] z-10">
          {initials}
        </span>
      )}
    </div>
  );
}

// ── Member Card ──────────────────────────────────────────
export function MemberTestimonialCard({
  member,
  index,
  layout = false,
  onCardClose = () => {},
  backgroundImage = BG_IMAGE,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);

  const initials = member.name
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const description = member.bio ||
    [member.education !== "NA" && member.education, member.address].filter(Boolean).join(" · ") ||
    "आयरेवाडी ग्रामविकास मंडळ सदस्य";

  const expand   = () => setIsExpanded(true);
  const collapse = () => { setIsExpanded(false); onCardClose(); };

  /* Lock scroll when expanded */
  useEffect(() => {
    if (isExpanded) {
      const scrollY = window.scrollY;
      document.body.style.cssText = `position:fixed;top:-${scrollY}px;width:100%;overflow:hidden`;
      document.body.dataset.scrollY = scrollY;
    } else {
      const scrollY = parseInt(document.body.dataset.scrollY || "0", 10);
      document.body.style.cssText = "";
      window.scrollTo({ top: scrollY, behavior: "instant" });
    }
    const onKey = e => { if (e.key === "Escape") collapse(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isExpanded]);

  useOutsideClick(containerRef, collapse);

  return (
    <>
      {/* ── Expanded overlay ── */}
      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 h-screen overflow-hidden z-50">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="backdrop-blur-lg h-full w-full fixed inset-0 bg-black/30"
            />
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${member.id}` : undefined}
              className="max-w-2xl mx-auto bg-gradient-to-b from-[#f2f0eb] to-[#fff9eb] h-full z-[60] p-6 md:p-10 rounded-3xl relative md:mt-10 overflow-y-auto"
            >
              <button
                onClick={collapse}
                className="sticky top-0 h-8 w-8 right-0 ml-auto rounded-full flex items-center justify-center bg-[#4b3f33] mb-4"
              >
                <X className="h-5 w-5 text-white" />
              </button>

              {/* Photo */}
              <div className="flex justify-center mb-6">
                <ProfileImage src={member.photo_url} alt={member.name} initials={initials} />
              </div>

              <motion.p
                layoutId={layout ? `role-${member.id}` : undefined}
                className="text-center text-[rgba(31,27,29,0.6)] text-base font-thin underline underline-offset-8 mb-2"
              >
                {member.role || "सदस्य"}
              </motion.p>
              <motion.p
                layoutId={layout ? `name-${member.id}` : undefined}
                className="text-center text-2xl md:text-3xl font-normal italic text-[rgba(31,27,29,0.75)] mb-6"
              >
                {member.name}
              </motion.p>

              {/* Details */}
              <div className="space-y-3 text-[rgba(31,27,29,0.7)]">
                {member.father_name && (
                  <p className="text-sm">
                    <span className="font-semibold">वडील:</span> {member.father_name}
                  </p>
                )}
                {member.address && (
                  <p className="text-sm">
                    <span className="font-semibold">गाव पत्ता:</span> {member.address}
                  </p>
                )}
                {member.mumbai_location && (
                  <p className="text-sm">
                    <span className="font-semibold">मुंबई पत्ता:</span> {member.mumbai_location}
                  </p>
                )}
                {member.education && member.education !== "NA" && (
                  <p className="text-sm">
                    <span className="font-semibold">शिक्षण:</span> {member.education}
                  </p>
                )}
              </div>

              {member.bio && (
                <div className="mt-6 text-[rgba(31,27,29,0.7)] text-xl font-thin leading-snug tracking-wide">
                  <Quote className="h-5 w-5 mb-2 text-[rgba(31,27,29,0.5)]" />
                  {member.bio}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Card ── */}
      <motion.button
        layoutId={layout ? `card-${member.id}` : undefined}
        onClick={expand}
        whileHover={{
          rotateX: 2, rotateY: 2, rotate: 2, scale: 1.02,
          transition: { duration: 0.3, ease: "easeOut" },
        }}
      >
        <div className="rounded-3xl bg-gradient-to-b from-[#f2f0eb] to-[#fff9eb] h-[480px] md:h-[530px] w-72 md:w-96 overflow-hidden flex flex-col items-center justify-center relative z-10 shadow-md px-4">
          {/* BG texture */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <img
              src={backgroundImage}
              alt=""
              className="w-full h-full object-cover object-center"
            />
          </div>

          <ProfileImage src={member.photo_url} alt={member.name} initials={initials} />

          <motion.p
            layoutId={layout ? `name-${member.id}` : undefined}
            className="text-[rgba(31,27,29,0.7)] text-xl md:text-2xl font-normal text-center mt-4 px-3 leading-snug"
          >
            {description.length > 90 ? `${description.slice(0, 90)}…` : description}
          </motion.p>

          <motion.p
            layoutId={layout ? `name2-${member.id}` : undefined}
            className="text-[rgba(31,27,29,0.7)] text-xl font-thin italic text-center mt-4"
          >
            {member.name}.
          </motion.p>

          <motion.p
            layoutId={layout ? `role-${member.id}` : undefined}
            className="text-[rgba(31,27,29,0.6)] text-sm font-thin italic text-center mt-1 underline underline-offset-8 decoration-1"
          >
            {(member.role || "सदस्य").length > 28
              ? `${(member.role || "सदस्य").slice(0, 28)}…`
              : (member.role || "सदस्य")}
          </motion.p>
        </div>
      </motion.button>
    </>
  );
}
