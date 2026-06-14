import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { LandingEarth } from "@/components/space/LandingEarth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orbital Harmony — Protecting Humanity's View of the Universe" },
      {
        name: "description",
        content:
          "Autonomous observatory operations. Predict satellite interference and protect irreplaceable scientific observations before they're lost.",
      },
      { property: "og:title", content: "Orbital Harmony" },
      { property: "og:description", content: "Protecting Humanity's View of the Universe." },
    ],
  }),
  component: Landing,
});

const STORY = [
  {
    eyebrow: "01 / OBSERVATION ACTIVE",
    title: "A telescope opens its shutter.",
    body: "Tonight, Hanle Observatory is tracking a near-Earth asteroid the size of a stadium. Three minutes of clean photons could rule out an impact.",
    accent: "var(--tier-3)",
  },
  {
    eyebrow: "02 / THREAT DETECTED",
    title: "47,000 satellites are in motion.",
    body: "A Starlink trail is on a collision course with the field of view. It will streak across the sensor in 4 minutes, 12 seconds.",
    accent: "var(--warning)",
  },
  {
    eyebrow: "03 / INTERFERENCE PREDICTED",
    title: "The observation is about to be lost.",
    body: "94% confidence of contamination. The next viewing window for this object is 41 days away. By then it may be unreachable.",
    accent: "var(--destructive)",
  },
  {
    eyebrow: "04 / ORBITAL HARMONY ENGAGED",
    title: "An AI core takes the watch.",
    body: "Trajectories are evaluated. Scientific value is weighed against thousands of conflicting observation requests. An alternate window is computed.",
    accent: "var(--primary)",
  },
  {
    eyebrow: "05 / OBSERVATION PROTECTED",
    title: "Science preserved.",
    body: "The observation is shifted by 18 minutes — outside the satellite pass. The shutter reopens. Photons land where they were meant to.",
    accent: "var(--success)",
  },
];

function Landing() {
  return (
    <div className="relative">
      <Hero />
      <ScrollStory />
      <FinalCTA />
    </div>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-screen w-full overflow-hidden"
    >
      <div className="absolute inset-0">
        <LandingEarth />
      </div>
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background" />

      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="relative h-7 w-7">
            <div className="absolute inset-0 rounded-sm border border-primary/70" />
            <div className="absolute inset-1 rotate-45 border border-primary/50" />
            <div className="absolute inset-[10px] bg-primary blink" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              Orbital Harmony
            </div>
            <div className="font-mono text-[10px] text-primary/80">v1.0 • UPLINK NOMINAL</div>
          </div>
        </div>
        <div className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:flex gap-6">
          <span><span className="text-primary">●</span> Live Telemetry</span>
          <span>{new Date().toISOString().slice(0, 19).replace("T", " ")} UTC</span>
        </div>
      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 text-center"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-primary/90">
          <span className="h-1.5 w-1.5 rounded-full bg-primary blink" />
          Mission Brief — Restricted Distribution
        </div>
        <h1 className="font-display text-[clamp(2.5rem,7vw,6rem)] font-light leading-[0.95] tracking-tight">
          <span className="block text-foreground/95">PROTECTING HUMANITY'S</span>
          <span className="block bg-gradient-to-b from-primary via-primary/90 to-primary/40 bg-clip-text text-transparent text-glow">
            VIEW OF THE UNIVERSE
          </span>
        </h1>
        <p className="mt-8 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Every night thousands of satellites cross telescope fields of view.
          Some observations can wait. <span className="text-foreground">Others may never happen again.</span>
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
          <Link
            to="/mission-control"
            className="group relative inline-flex items-center gap-3 overflow-hidden border border-primary/60 bg-primary/10 px-7 py-3.5 font-mono text-xs uppercase tracking-[0.3em] text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            <span className="relative z-10">Enter Mission Control</span>
            <span className="relative z-10 inline-block transition-transform group-hover:translate-x-1">→</span>
            <span className="absolute inset-0 -translate-x-full bg-primary transition-transform duration-500 group-hover:translate-x-0" />
          </Link>
          <a
            href="#story"
            className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground"
          >
            See the threat ↓
          </a>
        </div>
      </motion.div>

      {/* Bottom HUD readout */}
      <div className="absolute bottom-6 left-6 right-6 z-10 hidden grid-cols-4 gap-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:grid">
        {[
          ["Tracked Objects", "47,283"],
          ["Active Constellations", "12"],
          ["Observatories Online", "4 / 4"],
          ["Interference Risk (24h)", "HIGH"],
        ].map(([k, v]) => (
          <div key={k} className="glass px-3 py-2.5">
            <div className="text-[9px] text-muted-foreground">{k}</div>
            <div className="mt-1 text-sm text-foreground">{v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ScrollStory() {
  return (
    <section id="story" className="relative">
      <div className="mx-auto max-w-6xl px-6 py-32">
        <div className="mb-24 max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.4em] text-primary/80">
            The Crisis / Five Acts
          </div>
          <h2 className="mt-4 font-display text-4xl font-light leading-tight sm:text-5xl">
            One night.
            <br />
            One observation.
            <br />
            <span className="text-muted-foreground">One chance.</span>
          </h2>
        </div>

        <div className="space-y-32">
          {STORY.map((s, i) => (
            <StoryBeat key={i} {...s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StoryBeat({
  eyebrow,
  title,
  body,
  accent,
  index,
}: {
  eyebrow: string;
  title: string;
  body: string;
  accent: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.2"] });
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0.1, 1, 0.4]);
  const x = useTransform(scrollYProgress, [0, 0.5], [40, 0]);

  return (
    <motion.div ref={ref} style={{ opacity }} className="grid gap-10 md:grid-cols-12">
      <div className="md:col-span-4">
        <motion.div style={{ x }} className="sticky top-32">
          <div
            className="font-mono text-[10px] uppercase tracking-[0.4em]"
            style={{ color: accent }}
          >
            {eyebrow}
          </div>
          <div className="mt-3 h-px w-16" style={{ background: accent }} />
          <div className="mt-3 font-mono text-[10px] text-muted-foreground">
            T+{String(index * 3).padStart(2, "0")}:00:00
          </div>
        </motion.div>
      </div>
      <div className="md:col-span-8">
        <h3 className="font-display text-3xl font-light leading-tight sm:text-5xl">{title}</h3>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">{body}</p>
        <div
          className="relative mt-10 corner-frame overflow-hidden border border-border/50 bg-card/30 p-6"
          style={{ borderColor: `${accent}` }}
        >
          <span className="corner-tr" />
          <span className="corner-bl" />
          <BeatVisual index={index} accent={accent} />
        </div>
      </div>
    </motion.div>
  );
}

function BeatVisual({ index, accent }: { index: number; accent: string }) {
  switch (index) {
    case 0:
      return <BeatVisual0 accent={accent} />;
    case 1:
      return <BeatVisual1 accent={accent} />;
    case 2:
      return <BeatVisual2 accent={accent} />;
    case 3:
      return <BeatVisual3 accent={accent} />;
    case 4:
      return <BeatVisual4 accent={accent} />;
    default:
      return null;
  }
}

function BeatVisual0({ accent }: { accent: string }) {
  return (
    <div className="relative flex flex-col md:flex-row gap-6 min-h-[13rem] w-full items-center justify-between">
      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-clockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-counter {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      `}</style>
      
      {/* Left panel: HUD Data */}
      <div className="flex-1 font-mono text-[10px] space-y-2.5 w-full">
        <div className="flex items-center gap-2 border-b border-primary/20 pb-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary blink" />
          <span className="uppercase tracking-widest text-primary font-bold">SYSTEM: IAO DECVIS</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <span className="text-muted-foreground block text-[9px]">TELESCOPE</span>
            <span className="text-foreground">HANLE DEVASTHAL</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[9px]">TARGET</span>
            <span className="text-foreground text-glow font-bold">2024 PT5</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[9px]">RA / DEC</span>
            <span className="text-foreground">18h42m / +34°12'</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[9px]">APERTURE</span>
            <span className="text-foreground">100% NOMINAL</span>
          </div>
        </div>
        <div className="bg-primary/5 border border-primary/20 p-2 rounded-sm text-[9px] text-primary/80">
          <span className="font-bold">STATUS:</span> ACTIVE EXPOSURE IN PROGRESS...
          <div className="mt-1.5 h-1 w-full bg-primary/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </div>
      
      {/* Right panel: Radar / Shutter scope */}
      <div className="relative h-40 w-40 flex-shrink-0 flex items-center justify-center">
        <div className="absolute inset-0 grid-bg opacity-20 rounded-full border border-primary/10" />
        
        <svg viewBox="0 0 160 160" className="h-full w-full relative z-10">
          <defs>
            <linearGradient id="cone0" x1="0.5" y1="0.5" x2="1" y2="0.1">
              <stop offset="0" stopColor={accent} stopOpacity="0.4" />
              <stop offset="1" stopColor={accent} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sweepGrad" x1="0.5" y1="0.5" x2="1" y2="0.5">
              <stop offset="0" stopColor={accent} stopOpacity="0" />
              <stop offset="0.8" stopColor={accent} stopOpacity="0.1" />
              <stop offset="1" stopColor={accent} stopOpacity="0.6" />
            </linearGradient>
          </defs>
          
          <circle cx="80" cy="80" r="75" fill="none" stroke={accent} strokeWidth="0.5" strokeOpacity="0.2" />
          <circle cx="80" cy="80" r="55" fill="none" stroke={accent} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 8" 
            style={{ animation: "spin-clockwise 25s linear infinite", transformOrigin: "80px 80px" }} />
          <circle cx="80" cy="80" r="35" fill="none" stroke={accent} strokeWidth="0.75" strokeOpacity="0.4" strokeDasharray="8 6"
            style={{ animation: "spin-counter 15s linear infinite", transformOrigin: "80px 80px" }} />
          <circle cx="80" cy="80" r="15" fill="none" stroke={accent} strokeWidth="0.5" strokeOpacity="0.2" />
          
          <line x1="80" y1="5" x2="80" y2="155" stroke={accent} strokeWidth="0.5" strokeOpacity="0.15" />
          <line x1="5" y1="80" x2="155" y2="80" stroke={accent} strokeWidth="0.5" strokeOpacity="0.15" />
          
          <polygon points="80,80 145,40 145,120" fill="url(#cone0)" />
          
          <circle cx="80" cy="80" r="75" fill="url(#sweepGrad)" stroke="none"
            style={{ animation: "radar-sweep 4s linear infinite", transformOrigin: "80px 80px" }} />
          
          <circle cx="80" cy="80" r="3" fill={accent} />
          
          <g transform="translate(130, 70)">
            <circle cx="0" cy="0" r="5" fill={accent} className="blink" />
            <circle cx="0" cy="0" r="1.5" fill="#fff" />
            <rect x="-6" y="-6" width="12" height="12" fill="none" stroke={accent} strokeWidth="0.75" strokeOpacity="0.8" />
            <line x1="-9" y1="0" x2="-6" y2="0" stroke={accent} strokeWidth="0.75" />
            <line x1="6" y1="0" x2="9" y2="0" stroke={accent} strokeWidth="0.75" />
            <line x1="0" y1="-9" x2="0" y2="-6" stroke={accent} strokeWidth="0.75" />
            <line x1="0" y1="6" x2="0" y2="9" stroke={accent} strokeWidth="0.75" />
          </g>
          
          <text x="85" y="15" fill={accent} fontSize="6" fontFamily="monospace" opacity="0.6">RNG: 0.14 AU</text>
          <text x="120" y="60" fill={accent} fontSize="6" fontFamily="monospace" fontWeight="bold">2024 PT5</text>
        </svg>
        <div className="absolute top-2 right-2 border border-primary/20 bg-background/80 px-1 py-0.5 rounded-sm font-mono text-[8px] tracking-wider text-primary">
          SYS: EXPOSING
        </div>
      </div>
    </div>
  );
}

function BeatVisual1({ accent }: { accent: string }) {
  return (
    <div className="relative flex flex-col md:flex-row gap-6 min-h-[13rem] w-full items-center justify-between">
      <style>{`
        @keyframes satellite-move-1 {
          0% { transform: translate(-40px, 40px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(160px, -60px); opacity: 0; }
        }
        @keyframes satellite-move-2 {
          0% { transform: translate(-30px, 80px); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translate(170px, -20px); opacity: 0; }
        }
        @keyframes alert-flash {
          0%, 100% { border-color: var(--color-warning); background-color: rgba(234, 179, 8, 0.05); }
          50% { border-color: transparent; background-color: transparent; }
        }
        @keyframes hazard-pulse {
          0%, 100% { fill: var(--color-warning); fill-opacity: 0.15; stroke-opacity: 0.8; }
          50% { fill: var(--color-warning); fill-opacity: 0.03; stroke-opacity: 0.2; }
        }
      `}</style>

      {/* Left panel: Conjunction HUD */}
      <div className="flex-1 font-mono text-[10px] space-y-2 w-full">
        <div className="flex items-center gap-2 border-b border-warning/30 pb-1.5">
          <span className="h-2 w-2 rounded-full bg-warning blink" />
          <span className="uppercase tracking-widest text-warning font-bold">WARNING: CONJUNCTION RISK</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">CONSTELLATION:</span>
            <span className="text-foreground">STARLINK</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">CRITICAL NODE:</span>
            <span className="text-warning text-glow font-bold">STARLINK-5472</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">TIME TO INTERFERENCE:</span>
            <span className="text-foreground">4m 12s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">PROJECTED CROSSING:</span>
            <span className="text-warning">14.2s DURATION</span>
          </div>
        </div>
        
        <div className="border border-warning/30 bg-warning/5 p-2 rounded-sm text-[9px] text-warning flex items-start gap-2 animate-[alert-flash_2s_infinite]">
          <span className="font-bold">ALERT:</span> 
          <span>Mega-constellation density warning. 47,000+ active satellites in track list. FOV penetration imminent.</span>
        </div>
      </div>
      
      {/* Right panel: Conjunction Simulation */}
      <div className="relative h-40 w-40 flex-shrink-0 flex items-center justify-center bg-background/40 border border-border/50 rounded-sm">
        <div className="absolute inset-0 grid-bg opacity-15" />
        
        <svg viewBox="0 0 160 160" className="h-full w-full relative z-10">
          <defs>
            <linearGradient id="cone1" x1="0.1" y1="0.9" x2="0.9" y2="0.1">
              <stop offset="0" stopColor={accent} stopOpacity="0.4" />
              <stop offset="1" stopColor={accent} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          
          <polygon points="10,150 150,110 110,10" fill="url(#cone1)" stroke={accent} strokeWidth="0.5" strokeOpacity="0.3" />
          <circle cx="10" cy="150" r="3" fill={accent} />
          <text x="12" y="145" fill={accent} fontSize="6" fontFamily="monospace" opacity="0.6">HANLE FOV</text>
          
          <line x1="0" y1="120" x2="160" y2="40" stroke="var(--color-warning)" strokeWidth="0.75" strokeDasharray="3 3" strokeOpacity="0.4" />
          <line x1="0" y1="140" x2="160" y2="90" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" strokeDasharray="2 4" />
          
          <g transform="translate(90, 75)">
            <circle cx="0" cy="0" r="16" fill="none" stroke="var(--color-warning)" strokeWidth="0.75" 
              style={{ animation: "hazard-pulse 1.8s ease-in-out infinite" }} />
            <line x1="-20" y1="0" x2="20" y2="0" stroke="var(--color-warning)" strokeWidth="0.5" strokeOpacity="0.3" />
            <line x1="0" y1="-20" x2="0" y2="20" stroke="var(--color-warning)" strokeWidth="0.5" strokeOpacity="0.3" />
            <text x="-25" y="-20" fill="var(--color-warning)" fontSize="5" fontFamily="monospace">CONFLICT RANGE</text>
          </g>
          
          <g style={{ animation: "satellite-move-1 5s linear infinite", transformOrigin: "80px 80px" }}>
            <circle cx="0" cy="0" r="4.5" fill="var(--color-warning)" />
            <circle cx="0" cy="0" r="1.5" fill="#fff" />
            <path d="M 0,0 L -25,12.5" stroke="var(--color-warning)" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
            <path d="M 0,0 L -40,20" stroke="var(--color-warning)" strokeWidth="0.75" strokeOpacity="0.3" strokeLinecap="round" />
            
            <rect x="5" y="-12" width="55" height="9" fill="var(--color-background)" stroke="var(--color-warning)" strokeWidth="0.5" rx="1" />
            <text x="7" y="-5" fill="var(--color-warning)" fontSize="5" fontFamily="monospace" fontWeight="bold">SL-5472 INBOUND</text>
          </g>
          
          <g style={{ animation: "satellite-move-2 7s linear infinite", transformOrigin: "80px 80px" }}>
            <circle cx="0" cy="0" r="2.5" fill="rgba(255,255,255,0.7)" />
            <path d="M 0,0 L -20,6" stroke="rgba(255,255,255,0.4)" strokeWidth="0.75" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function BeatVisual2({ accent }: { accent: string }) {
  return (
    <div className="relative flex flex-col md:flex-row gap-6 min-h-[13rem] w-full items-center justify-between">
      <style>{`
        @keyframes scan-up-down {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(140px); }
        }
        @keyframes stroke-offset {
          to { stroke-dashoffset: 17; }
        }
        @keyframes flash-bg {
          0%, 100% { background-color: rgba(239, 68, 68, 0.03); }
          50% { background-color: rgba(239, 68, 68, 0.12); }
        }
        @keyframes pulse-destructive {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
      
      {/* Left panel: Glowing Circular Gauge */}
      <div className="relative h-40 w-40 flex-shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(239, 68, 68, 0.1)" strokeWidth="6" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-destructive)" strokeWidth="6" 
            strokeDasharray="263.8" strokeDashoffset="263.8" strokeLinecap="round"
            style={{ 
              animation: "stroke-offset 2s cubic-bezier(0.4, 0, 0.2, 1) forwards", 
              transform: "rotate(-90deg)", 
              transformOrigin: "50px 50px" 
            }} 
          />
          <circle cx="50" cy="50" r="36" fill="none" stroke="var(--color-destructive)" strokeWidth="0.5" strokeOpacity="0.4" strokeDasharray="3 3" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
          <span className="text-2xl font-bold text-destructive text-glow animate-[pulse-destructive_1.2s_infinite]">94%</span>
          <span className="text-[7px] uppercase tracking-widest text-muted-foreground text-center px-2">CONTAMINATION<br/>CONFIDENCE</span>
        </div>
      </div>
      
      {/* Right panel: Threat Assessment and Real-time Logs */}
      <div className="flex-1 flex flex-col justify-between min-h-40 w-full font-mono text-[10px] gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-destructive/10 border border-destructive/30 px-3 py-2 rounded-sm animate-[flash-bg_1.5s_infinite]">
            <span className="text-muted-foreground block text-[8px]">THREAT LEVEL</span>
            <span className="text-destructive font-bold text-xs uppercase">CRITICAL CRASH</span>
          </div>
          <div className="bg-card/50 border border-border/40 px-3 py-2 rounded-sm">
            <span className="text-muted-foreground block text-[8px]">NEXT WINDOW</span>
            <span className="text-foreground font-bold text-xs">+41 DAYS (LOST)</span>
          </div>
        </div>
        
        <div className="bg-black/40 border border-destructive/20 rounded-sm p-3 h-24 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-destructive/60 animate-[scan-up-down_2.5s_infinite]" />
          <div className="space-y-1 text-[8.5px] text-destructive/90 select-none">
            <div className="flex justify-between">
              <span>[01:36:12] OBS_CONTAM_PROB = 0.9429</span>
              <span className="text-destructive font-bold">FAIL</span>
            </div>
            <div className="flex justify-between">
              <span>[01:36:13] PEAK CONTAMINATION BRIGHTNESS: 4.2 MAG</span>
              <span className="animate-pulse">⚠️ DEGRADED</span>
            </div>
            <div className="flex justify-between">
              <span>[01:36:14] SECTOR BLOCKED BY MEGA-CONSTELLATION</span>
              <span>WAIT: +41d</span>
            </div>
            <div className="text-[8px] text-muted-foreground/50 border-t border-destructive/10 pt-1 mt-1">
              PROCEEDING WITH AUTONOMOUS EMERGENCY DISPATCH...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BeatVisual3({ accent }: { accent: string }) {
  return (
    <div className="relative flex flex-col md:flex-row gap-6 min-h-[13rem] w-full items-center justify-between">
      <style>{`
        @keyframes core-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px var(--color-primary)); }
          50% { transform: scale(1.15); filter: drop-shadow(0 0 16px var(--color-primary)); }
        }
        @keyframes neural-node-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.9; }
        }
      `}</style>
      
      {/* Left panel: Compiling scheduler console */}
      <div className="flex-1 font-mono text-[9px] bg-black/40 border border-primary/20 rounded-sm p-3 h-40 overflow-hidden relative w-full">
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
        
        <div className="space-y-1.5 text-primary/95">
          <div className="flex items-center gap-1.5 border-b border-primary/20 pb-1 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary blink" />
            <span className="uppercase tracking-widest font-bold">COGNITIVE ENGINE v1.2</span>
          </div>
          
          <motion.div 
            initial="hidden"
            animate="visible"
            className="space-y-1"
          >
            {[
              "› INGESTING satellite orbital parameters... DONE",
              "› DETERMINING intersection geometry... FOUND CONFLICT",
              "› EVALUATING observation utility tier... TIER 3 (DEFENSE)",
              "› RUNNING priority optimization solver...",
              "› SCENARIO 1: Keep target window ➔ FAILED (CONFIDENCE 6%)",
              "› SCENARIO 2: Postpone observation ➔ DEFERRED (+41 DAYS)",
              "› SCENARIO 3: Reschedule window shift ➔ SUCCESS (+18 MIN)",
              "› VERIFYING satellite trail intersection... CLEAR (0% CONTAM)",
              "› RESOLVED: RESCHEDULE COMMAND SENT TO IAO TELESCOPES"
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.3 }}
                className={i === 8 ? "text-success font-bold text-glow" : ""}
              >
                {text}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      
      {/* Right panel: Holographic AI Core */}
      <div className="relative h-40 w-40 flex-shrink-0 flex items-center justify-center">
        <div className="absolute inset-2 border border-primary/10 rounded-full animate-[spin-clockwise_20s_linear_infinite]" />
        <div className="absolute inset-6 border border-primary/25 border-dashed rounded-full animate-[spin-counter_12s_linear_infinite]" />
        <div className="absolute inset-10 border border-primary/40 rounded-full animate-[spin-clockwise_6s_linear_infinite]" />
        
        <svg viewBox="0 0 100 100" className="h-full w-full relative z-10">
          <line x1="50" y1="50" x2="15" y2="25" stroke="var(--color-primary)" strokeWidth="0.5" strokeOpacity="0.4" />
          <line x1="50" y1="50" x2="85" y2="25" stroke="var(--color-primary)" strokeWidth="0.5" strokeOpacity="0.4" />
          <line x1="50" y1="50" x2="80" y2="75" stroke="var(--color-primary)" strokeWidth="0.5" strokeOpacity="0.4" />
          <line x1="50" y1="50" x2="20" y2="75" stroke="var(--color-primary)" strokeWidth="0.5" strokeOpacity="0.4" />
          
          <circle cx="15" cy="25" r="2.5" fill="var(--color-primary)" style={{ animation: "neural-node-glow 2s infinite" }} />
          <circle cx="85" cy="25" r="2.5" fill="var(--color-primary)" style={{ animation: "neural-node-glow 1.5s infinite" }} />
          <circle cx="80" cy="75" r="2.5" fill="var(--color-primary)" style={{ animation: "neural-node-glow 2.5s infinite" }} />
          <circle cx="20" cy="75" r="2.5" fill="var(--color-primary)" style={{ animation: "neural-node-glow 1.8s infinite" }} />
          
          <circle cx="50" cy="50" r="12" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeOpacity="0.5" />
          <circle cx="50" cy="50" r="8" fill="var(--color-primary)" style={{ animation: "core-pulse 2s ease-in-out infinite" }} />
          <circle cx="50" cy="50" r="3" fill="#fff" />
          
          <text x="50" y="32" fill="var(--color-primary)" fontSize="5" fontFamily="monospace" textAnchor="middle">CORE ACTIVE</text>
          <text x="50" y="72" fill="var(--color-primary)" fontSize="4.5" fontFamily="monospace" textAnchor="middle">CONF: 97.4%</text>
        </svg>
      </div>
    </div>
  );
}

function BeatVisual4({ accent }: { accent: string }) {
  return (
    <div className="relative flex flex-col gap-4 min-h-[13rem] w-full justify-center">
      <style>{`
        @keyframes green-success-pulse {
          0%, 100% { box-shadow: 0 0 4px rgba(34, 197, 94, 0.2), inset 0 0 2px rgba(34, 197, 94, 0.2); }
          50% { box-shadow: 0 0 16px rgba(34, 197, 94, 0.6), inset 0 0 8px rgba(34, 197, 94, 0.4); }
        }
        @keyframes scan-line-horizontal {
          0% { left: 0%; }
          100% { left: 100%; }
        }
      `}</style>
      
      {/* Top Section: Original schedule with warning overlay */}
      <div className="relative border border-destructive/25 bg-destructive/5 rounded-sm p-3 font-mono text-[10px]">
        <div className="flex justify-between items-center border-b border-destructive/10 pb-1 mb-1.5">
          <span className="text-destructive font-bold uppercase tracking-wider">SCHEDULE A: ORIGINAL WINDOW</span>
          <span className="bg-destructive/20 text-destructive text-[8px] px-1 py-0.5 rounded font-bold uppercase tracking-widest blink">INTERFERENCE CONFLICT</span>
        </div>
        
        <div className="relative h-8 bg-background/50 border border-border/30 rounded flex items-center overflow-hidden">
          <div className="absolute left-4 w-28 h-full bg-muted-foreground/10 border-x border-dashed border-muted-foreground/30 flex items-center justify-center">
            <span className="text-muted-foreground/60 text-[8px] tracking-wider">OBSERVATION WINDOW (20:00 - 20:22)</span>
          </div>
          
          <div className="absolute left-16 w-16 h-full bg-destructive/35 border-x border-destructive flex items-center justify-center">
            <span className="text-[#fff] text-[9px] font-bold tracking-widest drop-shadow animate-pulse">STARLINK-5472 PASS</span>
          </div>
          
          <div className="absolute inset-0 bg-red-950/20 pointer-events-none flex items-center justify-center">
            <span className="text-destructive font-bold text-xs uppercase tracking-[0.2em] bg-background/90 px-2 border border-destructive rounded-sm shadow-md">DATA LOSS PREDICTED</span>
          </div>
        </div>
      </div>
      
      {/* Bottom Section: Shifted/Optimized schedule */}
      <div className="relative border border-success/30 bg-success/5 rounded-sm p-3 font-mono text-[10px] animate-[green-success-pulse_3s_infinite]">
        <div className="flex justify-between items-center border-b border-success/10 pb-1 mb-1.5">
          <span className="text-success font-bold uppercase tracking-wider">SCHEDULE B: OPTIMIZED WINDOW (+18m Shift)</span>
          <span className="bg-success/20 text-success text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">SCIENCE PROTECTED</span>
        </div>
        
        <div className="relative h-8 bg-background/50 border border-border/30 rounded flex items-center overflow-hidden">
          <div className="absolute left-16 w-16 h-full bg-destructive/15 border-x border-destructive/40 flex items-center justify-center opacity-60">
            <span className="text-destructive/80 text-[7px] font-bold tracking-widest">SL-5472 PASS</span>
          </div>
          
          <motion.div 
            className="absolute left-20 text-success/60 text-lg z-20"
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            ➔
          </motion.div>
          
          <motion.div 
            className="absolute left-[88px] w-28 h-full bg-success/20 border-x border-success flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.2)] overflow-hidden"
            initial={{ scale: 0.98 }}
            animate={{ scale: [0.98, 1.02, 0.98] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute top-0 bottom-0 w-1 bg-success/60 blur-[1px] animate-[scan-line-horizontal_3s_linear_infinite]" />
            <span className="text-success font-bold text-[8.5px] tracking-wider text-glow flex items-center gap-1">
              ● NO INTERFERENCE (20:40 - 21:02)
            </span>
          </motion.div>
          <div className="absolute right-3 flex items-center gap-1 bg-success text-success-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase">
            100% SECURED
          </div>
        </div>
      </div>
    </div>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-border/40 py-32">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.5em] text-primary/80">
          Mission Control / Standing By
        </div>
        <h2 className="mt-6 font-display text-5xl font-light leading-tight sm:text-7xl">
          The sky is not empty.
          <br />
          <span className="text-muted-foreground">It never will be again.</span>
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-muted-foreground">
          Take command of the autonomous observatory operations system. Watch a real conflict
          unfold, intervene, or let the AI protect the science for you.
        </p>
        <div className="mt-12 flex justify-center">
          <Link
            to="/mission-control"
            className="group relative inline-flex items-center gap-4 overflow-hidden border border-primary bg-primary/10 px-10 py-5 font-mono text-sm uppercase tracking-[0.3em] text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            <span className="relative z-10">Enter Mission Control</span>
            <span className="relative z-10 text-lg">→</span>
            <span className="absolute inset-0 -translate-x-full bg-primary transition-transform duration-500 group-hover:translate-x-0" />
          </Link>
        </div>
        <div className="mt-16 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
          ORBITAL HARMONY • A SYSTEM FOR THE AGE OF MEGA-CONSTELLATIONS
        </div>
      </div>
    </section>
  );
}
