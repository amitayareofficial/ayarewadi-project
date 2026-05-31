import { motion } from "framer-motion";

/**
 * Three pulsating dots in the project's village-green theme.
 * Props:
 *   color   – Tailwind bg class, default "bg-green-700"
 *   size    – dot size in px, default 10
 *   message – optional text below the dots
 */
export default function PulsatingLoader({ color = "bg-green-700", size = 10, message }) {
  const dot = {
    animate: { scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] },
    transition: { duration: 1, ease: "easeInOut", repeat: Infinity },
  };

  const style = { width: size, height: size };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="flex items-center gap-2">
        <motion.span className={`rounded-full ${color}`} style={style}
          animate={dot.animate} transition={{ ...dot.transition }} />
        <motion.span className={`rounded-full ${color}`} style={style}
          animate={dot.animate} transition={{ ...dot.transition, delay: 0.3 }} />
        <motion.span className={`rounded-full ${color}`} style={style}
          animate={dot.animate} transition={{ ...dot.transition, delay: 0.6 }} />
      </div>
      {message && (
        <p className="text-xs font-semibold text-green-800 opacity-70 tracking-wide">
          {message}
        </p>
      )}
    </div>
  );
}
