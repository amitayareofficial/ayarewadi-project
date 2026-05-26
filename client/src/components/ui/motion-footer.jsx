"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;

  --cf-bg:         #0a0f0a;
  --cf-fg:         #f0f4f0;
  --cf-primary:    #2e7d32;
  --cf-secondary:  #4caf50;
  --cf-muted:      rgba(240,244,240,0.45);
  --cf-border:     rgba(240,244,240,0.10);
  --cf-destructive:#e53935;

  --pill-bg-1:            rgba(240,244,240,0.04);
  --pill-bg-2:            rgba(240,244,240,0.01);
  --pill-shadow:          rgba(0,0,0,0.5);
  --pill-highlight:       rgba(240,244,240,0.10);
  --pill-inset-shadow:    rgba(0,0,0,0.80);
  --pill-border:          rgba(240,244,240,0.08);
  --pill-bg-1-hover:      rgba(240,244,240,0.09);
  --pill-bg-2-hover:      rgba(240,244,240,0.02);
  --pill-border-hover:    rgba(240,244,240,0.22);
  --pill-shadow-hover:    rgba(0,0,0,0.70);
  --pill-highlight-hover: rgba(240,244,240,0.20);
}

@keyframes cf-breathe {
  0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(1.12); opacity: 0.9; }
}
@keyframes cf-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes cf-heartbeat {
  0%, 100% { transform: scale(1);   filter: drop-shadow(0 0 5px rgba(229,57,53,0.5)); }
  15%, 45% { transform: scale(1.25); filter: drop-shadow(0 0 12px rgba(229,57,53,0.9)); }
  30%       { transform: scale(1); }
}

.cf-breathe   { animation: cf-breathe  8s ease-in-out infinite alternate; }
.cf-marquee   { animation: cf-marquee 28s linear infinite; }
.cf-heartbeat { animation: cf-heartbeat 2s cubic-bezier(0.25,1,0.5,1) infinite; }

.cf-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, rgba(240,244,240,0.035) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(240,244,240,0.035) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.cf-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(46,125,50,0.20) 0%,
    rgba(76,175,80,0.12) 40%,
    transparent 70%
  );
}

.cf-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
    0 10px 30px -10px var(--pill-shadow),
    inset 0 1px 1px var(--pill-highlight),
    inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
}
.cf-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
    0 20px 40px -10px var(--pill-shadow-hover),
    inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--cf-fg);
}

.cf-giant-bg-text {
  font-size: 24vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(240,244,240,0.06);
  background: linear-gradient(180deg, rgba(240,244,240,0.10) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

.cf-text-glow {
  background: linear-gradient(180deg, var(--cf-fg) 0%, rgba(240,244,240,0.35) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 22px rgba(240,244,240,0.14));
}
`;

/* ── Magnetic Button ── */
const MagneticButton = React.forwardRef(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const el = localRef.current;
      if (!el) return;

      const ctx = gsap.context(() => {
        const onMove = (e) => {
          const r = el.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          gsap.to(el, { x: x * 0.4, y: y * 0.4, rotationX: -y * 0.15, rotationY: x * 0.15, scale: 1.05, ease: "power2.out", duration: 0.4 });
        };
        const onLeave = () => {
          gsap.to(el, { x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1, ease: "elastic.out(1,0.3)", duration: 1.2 });
        };
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
      }, el);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node) => {
          localRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

/* ── Marquee row ── */
const MarqueeItem = ({ lang }) => (
  <div className="flex items-center space-x-10 px-6" style={{ color: "var(--cf-muted)", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", fontSize: "0.72rem" }}>
    {lang === "mr" ? (
      <>
        <span>आपलं गाव, आपली जबाबदारी</span><span style={{ color: "var(--cf-secondary)", opacity: 0.6 }}>✦</span>
        <span>स्वच्छ गाव, अभिमानी गाव</span><span style={{ color: "var(--cf-primary)", opacity: 0.6 }}>✦</span>
        <span>एकतेतून विकास</span><span style={{ color: "var(--cf-secondary)", opacity: 0.6 }}>✦</span>
        <span>श्री देव रवळनाथ</span><span style={{ color: "var(--cf-primary)", opacity: 0.6 }}>✦</span>
        <span>एक गाव, एक ओळख</span><span style={{ color: "var(--cf-secondary)", opacity: 0.6 }}>✦</span>
      </>
    ) : (
      <>
        <span>Our Village, Our Pride</span><span style={{ color: "var(--cf-secondary)", opacity: 0.6 }}>✦</span>
        <span>Clean Village, Proud Village</span><span style={{ color: "var(--cf-primary)", opacity: 0.6 }}>✦</span>
        <span>Development Through Unity</span><span style={{ color: "var(--cf-secondary)", opacity: 0.6 }}>✦</span>
        <span>Shri Dev Ravalnath</span><span style={{ color: "var(--cf-primary)", opacity: 0.6 }}>✦</span>
        <span>One Village, One Identity</span><span style={{ color: "var(--cf-secondary)", opacity: 0.6 }}>✦</span>
      </>
    )}
  </div>
);

/* ── Main Component ── */
export function CinematicFooter({ nav, lang = "mr" }) {
  const wrapperRef    = useRef(null);
  const giantTextRef  = useRef(null);
  const headingRef    = useRef(null);
  const linksRef      = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.85 },
        { y: "0vh", scale: 1, ease: "power1.out",
          scrollTrigger: { trigger: wrapperRef.current, start: "top 80%", end: "bottom bottom", scrub: 1 } }
      );
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 30 },
        { y: 0, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: wrapperRef.current, start: "top 40%", end: "bottom bottom", scrub: 1 } }
      );
    }, wrapperRef);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => clearTimeout(t);
  }, [lang]);

  const goTo = (section) => {
    if (nav) nav(section);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const links = lang === "mr"
    ? [
        { label: "🏠 मुख्यपान",    section: "home"      },
        { label: "🚨 आपत्कालीन",   section: "emergency" },
        { label: "📸 गॅलरी",       section: "gallery"   },
        { label: "📅 कार्यक्रम",   section: "events"    },
        { label: "👤 पोर्टल",      section: "portal"    },
      ]
    : [
        { label: "🏠 Home",         section: "home"      },
        { label: "🚨 Emergency",    section: "emergency" },
        { label: "📸 Gallery",      section: "gallery"   },
        { label: "📅 Events",       section: "events"    },
        { label: "👤 Portal",       section: "portal"    },
      ];

  const heading   = lang === "mr" ? "जोडले राहा" : "Stay Connected";
  const copyright = lang === "mr" ? "© 2026 Ayarewadi.in · सर्व हक्क राखीव" : "© 2026 Ayarewadi.in · All rights reserved";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div
        ref={wrapperRef}
        className="relative w-full"
        style={{ height: "32svh", clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer
          className="cinematic-footer-wrapper fixed bottom-0 left-0 flex w-full flex-col justify-between overflow-hidden"
          style={{ height: "32svh", background: "var(--cf-bg)", color: "var(--cf-fg)" }}
        >
          {/* Aurora glow */}
          <div className="cf-aurora cf-breathe absolute rounded-[50%] blur-[90px] pointer-events-none"
            style={{ width: "80vw", height: "60vh", top: "50%", left: "50%", zIndex: 0 }} />

          {/* Grid */}
          <div className="cf-bg-grid absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />

          {/* Giant background text — intentionally empty */}
          <div ref={giantTextRef} className="absolute pointer-events-none select-none" style={{ zIndex: 0 }} />

          {/* Center content */}
          <div className="relative flex flex-1 flex-col items-start justify-center px-6 mx-auto w-full"
            style={{ maxWidth: "56rem", marginTop: "0.75rem", zIndex: 10 }}>

            <h2 ref={headingRef}
              className="cf-text-glow font-black tracking-tighter text-left"
              style={{ fontSize: "clamp(0.9rem,2.5vw,1.5rem)", marginBottom: "0.5rem", lineHeight: 1 }}>
              {heading}
            </h2>

            {/* Nav pills */}
            <div ref={linksRef} className="flex flex-col items-start gap-3 w-full">
              <div className="flex flex-wrap justify-start items-center gap-0 w-full">
                {links.map((l, i) => (
                  <React.Fragment key={l.section}>
                    <MagneticButton
                      as="button"
                      onClick={() => goTo(l.section)}
                      className="px-4 py-1 font-semibold text-xs transition-colors duration-200"
                      style={{ color: "var(--cf-muted)", background: "none", border: "none" }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--cf-fg)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--cf-muted)"}
                    >
                      {l.label}
                    </MagneticButton>
                    {i < links.length - 1 && (
                      <span style={{ color: "rgba(240,244,240,0.2)", fontSize: "0.75rem", userSelect: "none" }}>|</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* WhatsApp + Email */}
              <div className="flex flex-wrap justify-center gap-3 w-full" style={{ marginTop: "0.25rem" }}>
                <MagneticButton
                  as="a"
                  href="https://wa.me/918149822015"
                  target="_blank"
                  rel="noreferrer"
                  className="cf-glass-pill px-5 py-2 rounded-full font-medium text-xs flex items-center gap-2"
                  style={{ color: "var(--cf-muted)" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#25D366" }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </MagneticButton>

                <MagneticButton
                  as="a"
                  href="mailto:contact@ayarewadi.in"
                  className="cf-glass-pill px-5 py-2 rounded-full font-medium text-xs"
                  style={{ color: "var(--cf-muted)" }}
                >
                  contact@ayarewadi.in
                </MagneticButton>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 w-full"
            style={{ padding: "0 1.5rem 1rem", zIndex: 20 }}>

            {/* Copyright */}
            <div style={{ color: "var(--cf-muted)", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", order: 2 }}>
              {copyright}
            </div>

            {/* Crafted with love */}
            <div className="cf-glass-pill flex items-center gap-2 rounded-full" style={{ padding: "10px 20px", cursor: "default", order: 1 }}>
              <span style={{ color: "var(--cf-muted)", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>बनवले</span>
              <span className="cf-heartbeat text-sm" style={{ color: "var(--cf-destructive)" }}>❤</span>
              <span style={{ color: "var(--cf-fg)", fontWeight: 800, fontSize: "0.78rem" }}>{lang === "mr" ? "अमित राजू आयरे" : "Amit Raju Ayare"}</span>
            </div>

            {/* Back to top */}
            <MagneticButton
              as="button"
              onClick={scrollToTop}
              className="cf-glass-pill flex items-center justify-center rounded-full group"
              style={{ width: "44px", height: "44px", color: "var(--cf-muted)", order: 3, flexShrink: 0 }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ transform: "translateY(0)", transition: "transform 0.3s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </MagneticButton>
          </div>
        </footer>
      </div>
    </>
  );
}
