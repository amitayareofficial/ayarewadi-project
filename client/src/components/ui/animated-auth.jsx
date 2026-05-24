import {
  memo, useState, useEffect, useRef, forwardRef,
} from "react";
import {
  motion,
  useAnimation,
  useInView,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

// ── Input with radial hover glow ──────────────────────────
export const Input = memo(
  forwardRef(function Input({ className, type, ...props }, ref) {
    const radius = 100;
    const [visible, setVisible] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    };

    return (
      <motion.div
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
              #4caf50,
              transparent 80%
            )
          `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="group/input rounded-lg p-[2px] transition duration-300"
      >
        <input
          type={type}
          className={cn(
            "shadow-input flex h-11 w-full rounded-md border-none bg-gray-50 px-3 py-2 text-sm text-black transition duration-300 group-hover/input:shadow-none placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-green-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    );
  })
);
Input.displayName = "Input";

// ── BoxReveal — slides a color box over content on entry ──
export const BoxReveal = memo(function BoxReveal({
  children,
  width = "fit-content",
  boxColor,
  duration,
  overflow = "hidden",
  position = "relative",
  className,
}) {
  const mainControls  = useAnimation();
  const slideControls = useAnimation();
  const ref     = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      slideControls.start("visible");
      mainControls.start("visible");
    } else {
      slideControls.start("hidden");
      mainControls.start("hidden");
    }
  }, [isInView, mainControls, slideControls]);

  return (
    <section ref={ref} style={{ position, width, overflow }} className={className}>
      <motion.div
        variants={{ hidden: { opacity: 0, y: 75 }, visible: { opacity: 1, y: 0 } }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: duration ?? 0.5, delay: 0.25 }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{ hidden: { left: 0 }, visible: { left: "100%" } }}
        initial="hidden"
        animate={slideControls}
        transition={{ duration: duration ?? 0.5, ease: "easeIn" }}
        style={{
          position: "absolute",
          top: 4, bottom: 4, left: 0, right: 0,
          zIndex: 20,
          background: boxColor ?? "var(--skeleton)",
          borderRadius: 4,
        }}
      />
    </section>
  );
});

// ── Ripple — concentric animated rings ────────────────────
export const Ripple = memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className = "",
}) {
  return (
    <section
      className={`absolute inset-0 flex items-center justify-center
        bg-gradient-to-b from-green-50 to-transparent
        [mask-image:linear-gradient(to_bottom,black,transparent)] ${className}`}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size  = mainCircleSize + i * 60;
        const opacity = mainCircleOpacity - i * 0.025;
        const borderStyle = i === numCircles - 1 ? "dashed" : "solid";

        return (
          <span
            key={i}
            className="absolute animate-ripple rounded-full border border-green-400/30 bg-green-500/5"
            style={{
              width:  `${size}px`,
              height: `${size}px`,
              opacity,
              animationDelay: `${i * 0.06}s`,
              borderStyle,
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </section>
  );
});

// ── OrbitingCircles — single orbiting element ─────────────
export const OrbitingCircles = memo(function OrbitingCircles({
  className,
  children,
  reverse = false,
  duration = 20,
  delay = 10,
  radius = 50,
  path = true,
}) {
  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute inset-0 size-full"
        >
          <circle
            className="stroke-white/15 stroke-1"
            cx="50%" cy="50%" r={radius} fill="none"
            strokeDasharray="4 6"
          />
        </svg>
      )}
      <section
        style={{ "--duration": duration, "--radius": radius, "--delay": -delay }}
        className={cn(
          "absolute flex size-full transform-gpu animate-orbit items-center justify-center rounded-full border bg-transparent [animation-delay:calc(var(--delay)*1000ms)]",
          reverse && "animation-reverse",
          className
        )}
      >
        {children}
      </section>
    </>
  );
});

// ── VillageOrbitDisplay — left-panel display ──────────────
export const VillageOrbitDisplay = memo(function VillageOrbitDisplay({
  iconsArray = [],
  centerText = "आयरेवाडी",
}) {
  return (
    <section className="relative flex items-center justify-center" style={{ width: 500, height: 500 }}>
      <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
        <span
          className="whitespace-pre-wrap bg-clip-text text-center text-6xl font-black leading-none text-transparent drop-shadow-lg"
          style={{ backgroundImage: "linear-gradient(180deg, #ffffff 0%, #a5f3a5 60%, rgba(134,239,172,0.6) 100%)" }}
        >
          {centerText}
        </span>
        <span className="mt-2 text-sm font-semibold text-white/70 tracking-widest uppercase drop-shadow">
          Village Portal
        </span>
      </div>

      {iconsArray.map((icon, i) => (
        <OrbitingCircles
          key={i}
          className={icon.className}
          duration={icon.duration}
          delay={icon.delay}
          radius={icon.radius}
          path={icon.path ?? true}
          reverse={icon.reverse}
        >
          {icon.component()}
        </OrbitingCircles>
      ))}
    </section>
  );
});

// ── BottomGradient — button hover effect ──────────────────
export const BottomGradient = () => (
  <>
    <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-green-500 to-transparent" />
    <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
  </>
);

// ── Label ─────────────────────────────────────────────────
export const Label = memo(function Label({ className, ...props }) {
  return (
    <label
      className={cn(
        "text-sm font-semibold leading-none text-neutral-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
});
