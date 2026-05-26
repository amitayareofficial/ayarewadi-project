import { useMemo, useEffect, useRef, memo } from "react";
// useMemo kept for raindrops randomization

const leafAngles = [-60, -30, 0, 30, 60, 90, 120];

function PalmTree({ className }) {
  return (
    <div className={`palm ${className}`}>
      <div className="palm-leaves">
        {leafAngles.map((angle, i) => (
          <div key={i} className="palm-leaf" style={{ transform: `rotate(${angle}deg)`, top: 0, left: 0 }} />
        ))}
      </div>
      <div className="palm-trunk" />
    </div>
  );
}

function Hut({ className }) {
  return (
    <div className={`hut ${className}`}>
      <div className="hut-roof" />
      <div className="hut-body" />
    </div>
  );
}

const SCENE_CSS = `
  .monsoon-scene {
    position: relative; width: 100%; height: 100%; overflow: hidden;
  }
  .sky-layer {
    position: absolute; inset: 0; z-index: 0;
    background: linear-gradient(to bottom,
      #1a2535 0%, #2c3e50 25%, #3d5a47 55%, #4a7c59 75%, #3a6b3e 100%
    );
  }
  .cloud-layer {
    position: absolute; top: 0; left: 0; right: 0; height: 55%;
    z-index: 1; overflow: hidden;
  }
  .cloud {
    position: absolute; border-radius: 50%;
    filter: blur(18px);
    animation: driftCloud linear infinite;
  }
  .cloud-1 { width:420px; height:180px; background:rgba(40,50,65,0.92);  top:4%;  left:-10%; animation-duration:60s; }
  .cloud-2 { width:320px; height:140px; background:rgba(55,65,80,0.85);  top:10%; left:20%;  animation-duration:80s; animation-delay:-20s; }
  .cloud-3 { width:500px; height:200px; background:rgba(30,40,55,0.95);  top:2%;  left:50%;  animation-duration:70s; animation-delay:-35s; }
  .cloud-4 { width:260px; height:120px; background:rgba(70,80,95,0.7);   top:18%; left:35%;  animation-duration:50s; animation-delay:-10s; }
  .cloud-light { width:200px; height:90px; background:rgba(180,190,200,0.25); top:8%; left:40%; animation-duration:90s; animation-delay:-5s; filter:blur(12px); }
  .field-layer {
    position: absolute; bottom:0; left:0; right:0; height:50%; z-index:2;
    background: linear-gradient(to bottom,
      rgba(58,120,58,0) 0%, rgba(60,140,60,0.9) 30%,
      rgba(40,110,50,1) 60%, rgba(30,85,35,1) 100%
    );
  }
  .path-layer {
    position: absolute; bottom:0; left:50%; transform:translateX(-50%);
    width:12%; height:55%; z-index:3;
    background: linear-gradient(to top, #5c3d1e, #7a5230, #8a6040);
    clip-path: polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%);
  }
  .palm { position:absolute; z-index:4; bottom:38%; }
  .palm-trunk {
    width:18px; height:160px; margin:0 auto;
    background: linear-gradient(to right, #5c3d1e, #7a5230, #5c3d1e);
    border-radius:4px; transform:rotate(-3deg); transform-origin:bottom center;
  }
  .palm-leaves { position:absolute; top:-30px; left:50%; transform:translateX(-50%); }
  .palm-leaf {
    position:absolute; width:90px; height:22px;
    background: linear-gradient(to right, #1a6b2a, #2d9e3c, #1a6b2a);
    border-radius:0 50% 50% 0; transform-origin:left center;
  }
  .palm-1 { left:3%;   animation:sway 3s   ease-in-out infinite; }
  .palm-2 { left:8%;   animation:sway 4s   ease-in-out infinite reverse; bottom:40%; }
  .palm-3 { right:5%;  animation:sway 3.5s ease-in-out infinite; }
  .palm-4 { right:12%; animation:sway 5s   ease-in-out infinite reverse; bottom:42%; }
  .hut { position:absolute; z-index:4; }
  .hut-body {
    width:90px; height:55px;
    background: linear-gradient(to bottom, #c8a45a, #a07840);
    border-radius:2px;
  }
  .hut-roof {
    width:0; height:0;
    border-left:55px solid transparent; border-right:55px solid transparent;
    border-bottom:45px solid #8B6914;
    position:absolute; top:-42px; left:-10px;
  }
  .hut-1 { left:12%;  bottom:42%; }
  .hut-2 { left:20%;  bottom:43%; }
  .hut-3 { right:10%; bottom:43%; }
  .puddle {
    position:absolute; bottom:0; z-index:3;
    background:rgba(100,140,160,0.35); border-radius:50%;
  }
  .puddle-1 { width:200px; height:30px; left:30%;  bottom:5%; }
  .puddle-2 { width:120px; height:20px; right:20%; bottom:8%; }
  .grass-layer {
    position:absolute; bottom:0; left:0; right:0; height:18%; z-index:5;
    background: linear-gradient(to top, #1a5c20, #2d8c38 60%, transparent);
  }
  .lightning {
    position:absolute; inset:0; z-index:6;
    background:rgba(255,255,255,0);
    animation:lightningFlash 8s infinite; pointer-events:none;
  }
  .monsoon-text {
    position:absolute; top:30%; left:50%;
    transform:translate(-50%,-50%);
    z-index:20; text-align:center; width:100%; padding:0 24px;
  }
  .monsoon-title {
    font-size:clamp(2rem,6vw,4rem); font-weight:900; color:#fff; margin:0;
    text-shadow:0 2px 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5);
    letter-spacing:2px;
  }
  .monsoon-subtitle {
    font-size:clamp(0.85rem,2vw,1.2rem); color:rgba(255,255,255,0.88);
    text-shadow:0 1px 10px rgba(0,0,0,0.7);
    margin-top:10px; font-style:italic;
  }
  @keyframes driftCloud {
    0%   { transform:translateX(0); }
    50%  { transform:translateX(80px); }
    100% { transform:translateX(0); }
  }
  @keyframes sway {
    0%, 100% { transform:rotate(-3deg); }
    50%      { transform:rotate(3deg); }
  }
  @keyframes lightningFlash {
    0%, 90%, 92%, 94%, 100% { background:rgba(255,255,255,0); }
    91%, 93%                 { background:rgba(255,255,255,0.12); }
  }
`;

function VillageMonsoonParallax({ title = "", subtitle = "", children }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drops = Array.from({ length: 200 }, () => ({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      speed:   8 + Math.random() * 10,
      length:  15 + Math.random() * 20,
      opacity: 0.2 + Math.random() * 0.5,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drops.forEach(drop => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.length * 0.3, drop.y + drop.length);
        ctx.strokeStyle = `rgba(200,225,255,${drop.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        drop.y += drop.speed;
        drop.x += drop.speed * 0.3;
        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);


  return (
    <section className="monsoon-scene" aria-label="Indian village monsoon scene">
      <style>{SCENE_CSS}</style>

      <div className="sky-layer" />

      <div className="cloud-layer">
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
        <div className="cloud cloud-4" />
        <div className="cloud cloud-light" />
      </div>

      <div className="lightning" />

      <div className="field-layer" />
      <div className="path-layer" />

      <PalmTree className="palm-1" />
      <PalmTree className="palm-2" />
      <PalmTree className="palm-3" />
      <PalmTree className="palm-4" />

      <Hut className="hut-1" />
      <Hut className="hut-2" />
      <Hut className="hut-3" />

      <div className="puddle puddle-1" />
      <div className="puddle puddle-2" />

      <div className="grass-layer" />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          zIndex: 10, pointerEvents: "none",
        }}
      />

      <div className="monsoon-text">
        {title    && <h1 className="monsoon-title">{title}</h1>}
        {subtitle && <p className="monsoon-subtitle">{subtitle}</p>}
      </div>

      {children}
    </section>
  );
}

export default memo(VillageMonsoonParallax);
