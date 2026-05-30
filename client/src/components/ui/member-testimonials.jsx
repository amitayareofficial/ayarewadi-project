import { motion } from "framer-motion";
import { GridPattern } from "./grid-pattern";

function MemberAvatar({ member }) {
  const initials = member.name
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (member.photo_url) {
    return (
      <img
        alt={member.name}
        src={member.photo_url}
        loading="lazy"
        className="size-9 rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div className="size-9 rounded-full bg-gradient-to-br from-green-800 to-green-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
      {initials}
    </div>
  );
}

function MemberCard({ member, index }) {
  const location = member.address || member.mumbai_location || "आयरेवाडी";
  const quote =
    member.bio ||
    (member.father_name ? `वडील: ${member.father_name}` : null) ||
    (member.education && member.education !== "NA" ? `शिक्षण: ${member.education}` : null) ||
    "आयरेवाडी ग्रामविकास मंडळ सदस्य";

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.07 * (index % 9) + 0.1, duration: 0.7 }}
      className="border-green-800/20 relative grid grid-cols-[auto_1fr] gap-x-3 overflow-hidden border border-dashed p-4 rounded-sm bg-white/60"
    >
      {/* Grid pattern overlay */}
      <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
        <div className="from-green-900/5 to-green-900/2 absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
          <GridPattern
            width={25}
            height={25}
            x={-12}
            y={4}
            strokeDasharray="3"
            className="stroke-green-900/15 absolute inset-0 h-full w-full mix-blend-overlay"
          />
        </div>
      </div>

      <MemberAvatar member={member} />

      <div>
        <div className="-mt-0.5 -space-y-0.5">
          <p className="text-sm md:text-base font-medium text-gray-800">{member.name}</p>
          <span className="text-green-700 block text-[11px] font-medium tracking-tight">
            {member.role || "सदस्य"}
            {location && location !== "आयरेवाडी" ? ` · ${location}` : " · आयरेवाडी"}
          </span>
          {member.education && member.education !== "NA" && (
            <span className="text-blue-600 block text-[10px] font-medium tracking-tight">
              🎓 {member.education}
            </span>
          )}
        </div>
        <blockquote className="mt-3">
          <p className="text-gray-600 text-sm font-light tracking-wide leading-relaxed">
            {quote}
          </p>
        </blockquote>
      </div>
    </motion.div>
  );
}

export function MembersGrid({ members }) {
  return (
    <section className="relative w-full pt-6 pb-20 px-4">
      {/* Decorative radial blobs */}
      <div aria-hidden className="absolute inset-0 isolate z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-0 h-[500px] w-[400px] -translate-y-1/2 -rotate-45 rounded-full opacity-60"
          style={{ background: "radial-gradient(68.54% 68.72% at 55.02% 31.46%, rgba(46,125,50,0.07) 0, rgba(46,125,50,0.01) 60%, transparent 80%)" }}
        />
        <div
          className="absolute top-0 right-0 h-[400px] w-[300px] translate-x-1/4 -translate-y-1/3 rotate-12 rounded-full opacity-50"
          style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(46,125,50,0.05) 0, transparent 100%)" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {members.length === 0 ? null : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member, index) => (
              <MemberCard key={member.id} member={member} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
