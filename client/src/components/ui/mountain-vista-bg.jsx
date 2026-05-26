import { useMemo, memo } from "react";

const layersData = [
  { className: "layer-6", speed: "120s", size: "222px", zIndex: 1, image: "6" },
  { className: "layer-5", speed: "95s",  size: "311px", zIndex: 1, image: "5" },
  { className: "layer-4", speed: "75s",  size: "468px", zIndex: 1, image: "4" },
  { className: "layer-3", speed: "55s",  size: "158px", zIndex: 3, image: "3" },
  { className: "layer-2", speed: "30s",  size: "145px", zIndex: 4, image: "2" },
  { className: "layer-1", speed: "20s",  size: "136px", zIndex: 5, image: "1" },
];

function MountainVistaParallax({ title = "", subtitle = "", children }) {
  const dynamicStyles = useMemo(() => {
    return layersData
      .map(layer => {
        const url = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/24650/${layer.image}.png`;
        return `
          .${layer.className} {
            background-image: url(${url});
            animation-duration: ${layer.speed};
            background-size: auto ${layer.size};
            z-index: ${layer.zIndex};
          }
        `;
      })
      .join("\n");
  }, []);

  const raindrops = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${(Math.random() * 2).toFixed(2)}s`,
      duration: `${(0.5 + Math.random() * 0.5).toFixed(2)}s`,
      opacity: (0.25 + Math.random() * 0.45).toFixed(2),
      height: `${14 + Math.floor(Math.random() * 10)}px`,
    }));
  }, []);

  return (
    <div className="mountain-vista" aria-label="Animated parallax green mountain landscape with rain">
      <style>{dynamicStyles}</style>

      {/* Cloudy dark sky overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "linear-gradient(to bottom, #3a4a50 0%, #5a7060 40%, #4a6040 100%)",
        opacity: 0.72,
        pointerEvents: "none",
      }} />

      {/* Parallax layers — hue-rotate(200deg) fixes pink→green */}
      {layersData.map(layer => (
        <div
          key={layer.className}
          className={`parallax-layer ${layer.className}`}
          style={{ filter: "hue-rotate(200deg) saturate(1.8) brightness(0.75)" }}
        />
      ))}

      {/* Rain */}
      <div style={{ position: "absolute", inset: 0, zIndex: 20, pointerEvents: "none", overflow: "hidden" }}>
        {raindrops.map(drop => (
          <div
            key={drop.id}
            style={{
              position: "absolute",
              left: drop.left,
              top: "-20px",
              width: "1.5px",
              height: drop.height,
              background: "rgba(200,225,255,0.75)",
              opacity: Number(drop.opacity),
              borderRadius: "2px",
              animation: `rainfall ${drop.duration} linear ${drop.delay} infinite`,
              transform: "rotate(10deg)",
            }}
          />
        ))}
      </div>

      {/* Mist/fog at bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: "180px", zIndex: 15, pointerEvents: "none",
        background: "linear-gradient(to top, rgba(180,200,190,0.45) 0%, transparent 100%)",
      }} />

      <div className="mountain-hero-content" style={{ position: "relative", zIndex: 30 }}>
        {title    && <h1 className="mountain-hero-title">{title}</h1>}
        {subtitle && <p className="mountain-hero-subtitle">{subtitle}</p>}
      </div>

      {children}
    </div>
  );
}

export default memo(MountainVistaParallax);
