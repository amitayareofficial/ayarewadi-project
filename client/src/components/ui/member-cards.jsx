import React, { useMemo } from "react";

const VillageBadge = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 48 48" className="inline-block shrink-0">
    <polygon fill="#2e7d32" points="29.62,3 33.053,8.308 39.367,8.624 39.686,14.937 44.997,18.367 42.116,23.995 45,29.62 39.692,33.053 39.376,39.367 33.063,39.686 29.633,44.997 24.005,42.116 18.38,45 14.947,39.692 8.633,39.376 8.314,33.063 3.003,29.633 5.884,24.005 3,18.38 8.308,14.947 8.624,8.633 14.937,8.314 18.367,3.003 23.995,5.884"/>
    <polygon fill="#fff" points="21.396,31.255 14.899,24.76 17.021,22.639 21.428,27.046 30.996,17.772 33.084,19.926"/>
  </svg>
);

/* ── Single member card ─────────────────────────────────── */
export function MemberCard({ member }) {
  const initials = member.name
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const snippet =
    member.bio ||
    (member.father_name ? `वडील: ${member.father_name}` : null) ||
    member.address ||
    "आयरेवाडी ग्रामविकास मंडळ सदस्य";

  return (
    <div className="p-4 rounded-xl mx-3 shadow-sm hover:shadow-md transition-all duration-200 w-72 shrink-0 bg-white border border-gray-100">
      <div className="flex gap-3">
        {member.photo_url ? (
          <img
            className="size-11 rounded-full object-cover shrink-0"
            src={member.photo_url}
            alt={member.name}
            loading="lazy"
          />
        ) : (
          <div className="size-11 rounded-full bg-gradient-to-br from-green-800 to-green-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {initials}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-sm text-gray-800 truncate">{member.name}</p>
            <VillageBadge />
          </div>
          <span className="text-xs text-green-700 font-medium truncate">{member.role || "सदस्य"}</span>
        </div>
      </div>

      <p className="text-sm pt-3 text-gray-500 line-clamp-2 leading-relaxed">
        {snippet.length > 100 ? snippet.slice(0, 100) + "…" : snippet}
      </p>

      {(member.education && member.education !== "NA") && (
        <p className="text-xs text-blue-600 font-medium mt-2">🎓 {member.education}</p>
      )}
    </div>
  );
}

/* ── Grid card (used when search/filter active) ─────────── */
export function MemberGridCard({ member }) {
  const initials = member.name
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="p-5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-white border border-gray-100 flex flex-col">
      <div className="flex gap-3 items-center mb-3">
        {member.photo_url ? (
          <img className="size-14 rounded-full object-cover shrink-0 border-2 border-green-100"
            src={member.photo_url} alt={member.name} loading="lazy" />
        ) : (
          <div className="size-14 rounded-full bg-gradient-to-br from-green-800 to-green-500 flex items-center justify-center text-white font-bold text-lg shrink-0 border-2 border-green-100">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-gray-800 truncate">{member.name}</p>
            <VillageBadge />
          </div>
          <p className="text-xs text-green-700 font-medium">{member.role || "सदस्य"}</p>
          {member.education && member.education !== "NA" && (
            <p className="text-xs text-blue-600 mt-0.5">🎓 {member.education}</p>
          )}
        </div>
      </div>

      {member.bio && (
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-2">{member.bio}</p>
      )}
      {member.father_name && (
        <p className="text-xs text-gray-400">वडील: {member.father_name}</p>
      )}
      {member.address && (
        <p className="text-xs text-gray-400 mt-0.5">📍 {member.address}</p>
      )}
      {member.mumbai_location && (
        <p className="text-xs text-blue-400 mt-0.5">🏙️ {member.mumbai_location}</p>
      )}
    </div>
  );
}

/* ── Marquee row ────────────────────────────────────────── */
function MarqueeRow({ members, reverse = false, speed = 35 }) {
  const doubled = useMemo(() => [...members, ...members], [members]);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-20 md:w-32 z-10"
        style={{ background: "linear-gradient(to right, #f8f5f0, transparent)" }} />

      <div
        className={`flex ${reverse ? "pt-3 pb-6" : "pt-6 pb-3"}`}
        style={{
          minWidth: "200%",
          animation: `memberScroll ${speed}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
          willChange: "transform",
        }}
      >
        {doubled.map((m, i) => (
          <MemberCard key={`${m.id}-${i}`} member={m} />
        ))}
      </div>

      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-20 md:w-32 z-10"
        style={{ background: "linear-gradient(to left, #f8f5f0, transparent)" }} />
    </div>
  );
}

/* ── Two-row Marquee export ─────────────────────────────── */
export function MemberMarquee({ members }) {
  const mid    = Math.ceil(members.length / 2);
  const row1   = members.slice(0, mid);
  const row2   = members.slice(mid).length > 0 ? members.slice(mid) : members;

  return (
    <>
      <style>{`
        @keyframes memberScroll {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div className="flex flex-col gap-2 py-6">
        <MarqueeRow members={row1} reverse={false} speed={38} />
        <MarqueeRow members={row2} reverse={true}  speed={44} />
      </div>
    </>
  );
}
