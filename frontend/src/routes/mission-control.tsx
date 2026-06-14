import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MissionGlobe } from "@/components/space/MissionGlobe";
import {
  OBSERVATORIES,
  SATELLITES,
  TARGETS,
  TIER_META,
  CONSTELLATION_COLOR,
  type ObsTarget,
} from "@/lib/orbital/data";

export const Route = createFileRoute("/mission-control")({
  head: () => ({
    meta: [
      { title: "Mission Control — Orbital Harmony" },
      {
        name: "description",
        content:
          "Autonomous observatory operations dashboard. Watch satellite interference predictions and AI rescheduling decisions in real time.",
      },
    ],
  }),
  component: MissionControl,
});

type TimeRate = 1 | 10 | 100 | 1000;
type DemoStage = "idle" | "loading" | "threat" | "detect" | "ai" | "reschedule" | "done";

interface AIDecision {
  targetId: string;
  observatoryId: string;
  satelliteId: string;
  satelliteName: string;
  probability: number;
  originalStart: number; // sim seconds
  newStart: number;
  shiftMin: number;
  reasoning: string[];
  confidence: number;
}

function MissionControl() {
  // Sim time in seconds since "now". 0 = current.
  const [simTime, setSimTime] = useState(0);
  const [rate, setRate] = useState<TimeRate>(10);
  const [paused, setPaused] = useState(false);

  const [selectedSatId, setSelectedSatId] = useState<string | null>(null);
  const [highlightedSatId, setHighlightedSatId] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(TARGETS[0].id);

  const [demoStage, setDemoStage] = useState<DemoStage>("idle");
  const [decision, setDecision] = useState<AIDecision | null>(null);

  // Update scheduling decision dynamically when a satellite is selected manually
  useEffect(() => {
    if (demoStage !== "idle" && demoStage !== "done") {
      // Let the demo orchestration manage the decision state
      return;
    }

    if (!selectedSatId) {
      setDecision(null);
      return;
    }

    const sat = SATELLITES.find((s) => s.id === selectedSatId);
    if (!sat) {
      setDecision(null);
      return;
    }

    // Compute deterministic but unique scheduling values for this satellite
    const targetIdx = sat.norad % TARGETS.length;
    const target = TARGETS[targetIdx];
    const shiftMin = (sat.norad % 15) + 8; // dynamic shift: 8 to 22 mins
    const probability = 0.75 + (sat.norad % 20) / 100; // dynamic probability: 75% to 94%
    const confidence = 0.85 + (sat.norad % 13) / 100; // dynamic confidence: 85% to 97%
    const crossingSec = (sat.norad % 120) + 40; // dynamic crossing duration: 40s to 160s

    const dec: AIDecision = {
      targetId: target.id,
      observatoryId: target.observatoryId,
      satelliteId: sat.id,
      satelliteName: sat.name,
      probability,
      originalStart: target.startMin * 60,
      newStart: (target.startMin + shiftMin) * 60,
      shiftMin,
      confidence,
      reasoning: [
        `Target classified as ${TIER_META[target.tier].label}.`,
        `Conflict probability with ${sat.name} = ${Math.round(probability * 100)}% over ${crossingSec.toFixed(1)}s crossing.`,
        `Evaluated ${180 + (sat.norad % 220)} alternative slots in observation queue.`,
        `Selected +${shiftMin} min shift: clear sky, airmass < 1.4, no Tier ≥${target.tier} displacement.`,
        `Schedule committed. Confidence ${Math.round(confidence * 100)}%.`,
      ],
    };
    setDecision(dec);
    setSelectedTargetId(target.id);
  }, [selectedSatId, demoStage]);

  interface FeedEvent {
    id: string;
    timestamp: string;
    type: "WARNING" | "ANALYSIS" | "ACTION" | "RESULT" | "INFO";
    message: string;
    detail?: string;
  }

  const [events, setEvents] = useState<FeedEvent[]>([
    { id: "init-1", timestamp: "00:00:01", type: "INFO", message: "Uplink nominal", detail: "Ground station handshake verified." },
    { id: "init-2", timestamp: "00:00:02", type: "INFO", message: "Ingested 47,283 active objects", detail: "Celestrak catalog cached locally." },
    { id: "init-3", timestamp: "00:00:03", type: "INFO", message: "Observatories online", detail: "IAO, DOT, MK, VLT links stable." }
  ]);

  useEffect(() => {
    const timeStr = new Date().toISOString().slice(11, 19);
    // Determine which satellite is running in the demo
    const sat = selectedSatId ? SATELLITES.find((s) => s.id === selectedSatId) || SATELLITES[42] : SATELLITES[42];
    const targetIdx = sat.norad % TARGETS.length;
    const target = TARGETS[targetIdx];
    const obs = OBSERVATORIES.find((o) => o.id === target.observatoryId)!;
    const shiftMin = (sat.norad % 15) + 8;

    if (demoStage === "loading") {
      setEvents([
        { id: "demo-0", timestamp: timeStr, type: "INFO", message: "AI Scheduler engaged", detail: "Scanning observation queue for conflicts." }
      ]);
    } else if (demoStage === "threat") {
      setEvents(prev => [
        ...prev,
        { id: "demo-1", timestamp: timeStr, type: "WARNING", message: `${sat.constellation} crossing predicted`, detail: `${sat.name} crossing ${obs.name.split(",")[0]} field of view.` }
      ]);
    } else if (demoStage === "detect") {
      setEvents(prev => [
        ...prev,
        { id: "demo-2", timestamp: timeStr, type: "ANALYSIS", message: `Tier ${target.tier} observation affected`, detail: `${target.name.split(" — ")[0]} is at risk.` }
      ]);
    } else if (demoStage === "ai") {
      setEvents(prev => [
        ...prev,
        { id: "demo-3", timestamp: timeStr, type: "ACTION", message: "Evaluating alternative slots", detail: "Searching queue for optimal conflict-free window." }
      ]);
    } else if (demoStage === "reschedule") {
      setEvents(prev => [
        ...prev,
        { id: "demo-4", timestamp: timeStr, type: "RESULT", message: "Observation rescheduled", detail: `Shifted +${shiftMin}m. 98% science preserved.` }
      ]);
    } else if (demoStage === "done") {
      setEvents(prev => [
        ...prev,
        { id: "demo-5", timestamp: timeStr, type: "INFO", message: "Uplink back to nominal state", detail: "All observations clear." }
      ]);
    }
  }, [demoStage]);

  // Filter: show fewer sats by default for perf
  const [showAll, setShowAll] = useState(false);
  const visibleSats = useMemo(() => {
    if (showAll) return SATELLITES;
    // Subsample by NORAD modulo
    return SATELLITES.filter((_, i) => i % 2 === 0);
  }, [showAll]);

  // Time loop
  useEffect(() => {
    if (paused) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setSimTime((t) => t + dt * rate);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rate, paused]);

  const selectedSat = selectedSatId ? SATELLITES.find((s) => s.id === selectedSatId) : null;
  const selectedTarget = selectedTargetId ? TARGETS.find((t) => t.id === selectedTargetId) : null;

  const conflictObservatoryId = decision?.observatoryId ?? null;

  // Demo orchestration
  const runDemo = () => {
    if (demoStage !== "idle" && demoStage !== "done") return;
    setDecision(null);
    setDemoStage("loading");
    
    // Pick the selected satellite or fallback
    const sat = selectedSatId ? SATELLITES.find(s => s.id === selectedSatId) || SATELLITES[42] : SATELLITES[42];
    const targetIdx = sat.norad % TARGETS.length;
    const target = TARGETS[targetIdx];
    
    setSelectedTargetId(target.id);
    setSimTime(0);
    setRate(100);

    const shiftMin = (sat.norad % 15) + 8;
    const probability = 0.75 + (sat.norad % 20) / 100;
    const confidence = 0.85 + (sat.norad % 13) / 100;
    const crossingSec = (sat.norad % 120) + 40;

    const dec: AIDecision = {
      targetId: target.id,
      observatoryId: target.observatoryId,
      satelliteId: sat.id,
      satelliteName: sat.name,
      probability,
      originalStart: target.startMin * 60,
      newStart: (target.startMin + shiftMin) * 60,
      shiftMin,
      confidence,
      reasoning: [
        `Target classified as ${TIER_META[target.tier].label}.`,
        `Conflict probability with ${sat.name} = ${Math.round(probability * 100)}% over ${crossingSec.toFixed(1)}s crossing.`,
        `Next natural window: +${(sat.norad % 20) + 12} days — scientifically unacceptable.`,
        `Evaluated ${150 + (sat.norad % 250)} alternative slots in observation queue.`,
        `Selected +${shiftMin} min shift: clear sky, airmass < 1.4, no Tier ≥${target.tier} displacement.`,
        `Schedule committed. Confidence ${Math.round(confidence * 100)}%.`,
      ],
    };

    setTimeout(() => {
      setHighlightedSatId(sat.id);
      setSelectedSatId(sat.id);
      setDemoStage("threat");
    }, 1400);

    setTimeout(() => {
      setDecision(dec);
      setDemoStage("detect");
    }, 3200);

    setTimeout(() => setDemoStage("ai"), 5400);

    setTimeout(() => {
      setDemoStage("reschedule");
    }, 8000);

    setTimeout(() => {
      setDemoStage("done");
      setRate(10);
    }, 11000);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* GLOBE */}
      <div className="absolute inset-0">
        <MissionGlobe
          simTime={simTime}
          selectedSatId={selectedSatId}
          highlightedSatId={highlightedSatId}
          conflictObservatoryId={conflictObservatoryId}
          onSelectSat={setSelectedSatId}
          visibleSats={visibleSats}
        />
      </div>

      {/* Vignette + grid */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-radial" style={{
        background: "radial-gradient(circle at 50% 50%, transparent 40%, rgba(5,8,15,0.7) 100%)",
      }} />

      {/* TOP BAR */}
      <TopBar simTime={simTime} rate={rate} setRate={setRate} paused={paused} setPaused={setPaused} runDemo={runDemo} demoStage={demoStage} setSimTime={setSimTime} showAll={showAll} setShowAll={setShowAll} />

      {/* LEFT PANEL */}
      <LeftPanel
        selectedTargetId={selectedTargetId}
        onSelectTarget={setSelectedTargetId}
        decision={decision}
      />

      {/* RIGHT PANEL */}
      <RightPanel
        selectedSat={selectedSat ?? null}
        selectedTarget={selectedTarget ?? null}
        onClose={() => setSelectedSatId(null)}
        events={events}
      />

      {/* CONFLICT / AI OVERLAY */}
      <ConflictOverlay stage={demoStage} decision={decision} simTime={simTime} />

      {/* BOTTOM TIMELINE */}
      <BottomTimeline simTime={simTime} decision={decision} selectedTargetId={selectedTargetId} onSelectTarget={setSelectedTargetId} />

      {/* Ticker */}
      <Ticker />
    </div>
  );
}

/* ============ TOP BAR ============ */

function TopBar({
  simTime, rate, setRate, paused, setPaused, runDemo, demoStage, setSimTime, showAll, setShowAll,
}: {
  simTime: number;
  rate: TimeRate;
  setRate: (r: TimeRate) => void;
  paused: boolean;
  setPaused: (p: boolean) => void;
  runDemo: () => void;
  demoStage: DemoStage;
  setSimTime: (n: number) => void;
  showAll: boolean;
  setShowAll: (b: boolean) => void;
}) {
  const tNow = new Date(Date.now() + simTime * 1000);
  return (
    <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between gap-4 px-5 py-3">
      {/* Left: logo + status */}
      <div className="flex items-center gap-5">
        <Link to="/" className="group flex items-center gap-3">
          <div className="relative h-7 w-7">
            <div className="absolute inset-0 border border-primary/70" />
            <div className="absolute inset-1 rotate-45 border border-primary/50" />
            <div className="absolute inset-[10px] bg-primary blink" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground">
              Orbital Harmony
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-primary/80">
              Mission Control / OH-MC-01
            </div>
          </div>
        </Link>

        <div className="hidden h-8 w-px bg-border md:block" />
        <div className="hidden md:block">
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            SIM TIME (UTC)
          </div>
          <div className="font-mono text-sm text-primary">{tNow.toISOString().slice(0, 19).replace("T", " ")}</div>
        </div>
      </div>

      {/* Center: time controls */}
      <div className="glass flex items-center gap-1 px-2 py-1.5">
        <button onClick={() => { setSimTime(0); setRate(10); }} className="rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-secondary hover:text-foreground">
          LIVE
        </button>
        <div className="mx-1 h-4 w-px bg-border" />
        {[
          ["+1h", 3600],
          ["+6h", 6 * 3600],
          ["+1d", 86400],
          ["+1w", 7 * 86400],
        ].map(([label, sec]) => (
          <button
            key={label as string}
            onClick={() => setSimTime((sec as number))}
            className="rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {label}
          </button>
        ))}
        <div className="mx-1 h-4 w-px bg-border" />
        <button
          onClick={() => setPaused(!paused)}
          className="rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-foreground hover:bg-secondary"
        >
          {paused ? "▶" : "❚❚"}
        </button>
        {([1, 10, 100, 1000] as TimeRate[]).map((r) => (
          <button
            key={r}
            onClick={() => setRate(r)}
            className={`rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${rate === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
          >
            {r}×
          </button>
        ))}
      </div>

      {/* Right: demo + density */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowAll(!showAll)}
          className="glass hidden px-3 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground md:block"
        >
          Density: {showAll ? "HIGH" : "MED"}
        </button>
        <button
          onClick={runDemo}
          disabled={demoStage !== "idle" && demoStage !== "done"}
          className="group relative overflow-hidden border border-accent/70 bg-accent/10 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.3em] text-accent transition-all hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
        >
          <span className="relative z-10 inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent blink" />
            {demoStage === "idle" || demoStage === "done" ? "RUN DEMO" : "DEMO RUNNING…"}
          </span>
        </button>
      </div>
    </div>
  );
}

/* ============ LEFT PANEL ============ */

function LeftPanel({
  selectedTargetId,
  onSelectTarget,
  decision,
}: {
  selectedTargetId: string | null;
  onSelectTarget: (id: string) => void;
  decision: AIDecision | null;
}) {
  return (
    <div className="absolute left-5 top-24 z-20 w-[360px] max-w-[88vw] space-y-3">
      <Panel title="Observatories" subtitle="4 NODES / GLOBAL">
        <div className="space-y-2">
          {OBSERVATORIES.map((o) => {
            const t = TARGETS.find((x) => x.observatoryId === o.id);
            const tier = t?.tier ?? 0;
            return (
              <div key={o.id} className="flex items-center justify-between gap-2 border border-border/40 bg-card/40 px-3 py-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: TIER_META[tier].var, boxShadow: `0 0 10px ${TIER_META[tier].var}` }}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-xs text-foreground">{o.name}</div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      {o.code} • {o.apertureM}m • {o.elevationM}m
                    </div>
                  </div>
                </div>
                <div className="font-mono text-[9px] text-success">● ONLINE</div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Observation Queue" subtitle={`${TARGETS.length} TARGETS / TONIGHT`}>
        <div className="space-y-1.5">
          {[...TARGETS].sort((a, b) => b.tier - a.tier).map((t) => (
            <TargetRow
              key={t.id}
              target={t}
              selected={t.id === selectedTargetId}
              onClick={() => onSelectTarget(t.id)}
              decision={decision?.targetId === t.id ? decision : null}
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function TargetRow({ target, selected, onClick, decision }: {
  target: ObsTarget;
  selected: boolean;
  onClick: () => void;
  decision: AIDecision | null;
}) {
  const meta = TIER_META[target.tier];
  return (
    <button
      onClick={onClick}
      className={`group w-full border px-3 py-2 text-left transition-all ${selected ? "border-primary/60 bg-primary/5" : "border-border/30 bg-card/30 hover:border-border/60 hover:bg-card/50"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-mono text-[9px] uppercase tracking-widest" style={{ color: meta.var }}>
          {meta.label}
        </div>
        <div className="font-mono text-[9px] text-muted-foreground">{target.durationMin}min</div>
      </div>
      <div className="mt-1 truncate text-sm text-foreground">{target.name}</div>
      <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
        <span>{target.category}</span>
        {decision ? (
          <span className="text-success">RESCHEDULED +{decision.shiftMin}min ✓</span>
        ) : (
          <span>T+{String(Math.floor(target.startMin / 60)).padStart(2, "0")}:{String(target.startMin % 60).padStart(2, "0")}</span>
        )}
      </div>
      <div className="mt-2 h-0.5 w-full overflow-hidden bg-border/30">
        <div
          className="h-full"
          style={{
            width: `${30 + target.tier * 20}%`,
            background: meta.var,
            boxShadow: `0 0 8px ${meta.var}`,
          }}
        />
      </div>
    </button>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="panel relative corner-frame">
      <span className="corner-tr" />
      <span className="corner-bl" />
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-2.5">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground">{title}</div>
        {subtitle && <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">{subtitle}</div>}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

/* ============ RIGHT PANEL ============ */

function RightPanel({ selectedSat, selectedTarget, onClose, events }: {
  selectedSat: typeof SATELLITES[number] | null;
  selectedTarget: ObsTarget | null;
  onClose: () => void;
  events: any[];
}) {
  const telemetryData = useMemo(() => {
    if (!selectedSat) return null;
    const prob = (selectedSat.norad * 7) % 35 + 15; // 15% to 49%
    const obsIndex = selectedSat.norad % OBSERVATORIES.length;
    const obs = OBSERVATORIES[obsIndex];
    const crossMin = (selectedSat.norad % 25) + 3;
    const crossSec = selectedSat.norad % 60;
    
    let probColor = "var(--primary)";
    if (prob > 35) probColor = "var(--destructive)";
    else if (prob > 25) probColor = "var(--warning)";

    return {
      prob,
      probColor,
      obsCode: obs.code,
      crossMin,
      crossSec,
    };
  }, [selectedSat]);

  return (
    <div className="absolute right-5 top-24 z-20 w-[360px] max-w-[88vw] space-y-3">
      <AnimatePresence mode="wait">
        {selectedSat ? (
          <motion.div
            key={selectedSat.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Panel title="Satellite Telemetry" subtitle={selectedSat.constellation}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-lg">{selectedSat.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    NORAD {selectedSat.norad}
                  </div>
                </div>
                <button onClick={onClose} className="font-mono text-xs text-muted-foreground hover:text-foreground">
                  ✕
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Stat label="Altitude" value={`${selectedSat.altitudeKm} km`} />
                <Stat label="Inclination" value={`${selectedSat.inclinationDeg}°`} />
                <Stat label="Period" value={`${selectedSat.periodMin.toFixed(1)} min`} />
                <Stat label="Velocity" value={`${(Math.sqrt(398600.4418 / (6371 + selectedSat.altitudeKm))).toFixed(2)} km/s`} />
              </div>
              <div className="mt-3 border-t border-border/30 pt-3">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>Interference probability (24h)</span>
                  <span style={{ color: telemetryData?.probColor }}>{telemetryData?.prob}%</span>
                </div>
                <div className="mt-1.5 h-1 w-full overflow-hidden bg-border/30">
                  <div className="h-full" style={{ width: `${telemetryData?.prob}%`, backgroundColor: telemetryData?.probColor }} />
                </div>
                <div className="mt-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  Predicted crossing
                </div>
                <div className="mt-1 text-sm">{telemetryData?.obsCode} FoV — T+ {telemetryData?.crossMin} min {telemetryData?.crossSec} s</div>
              </div>
            </Panel>
          </motion.div>
        ) : selectedTarget ? (
          <motion.div
            key={selectedTarget.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Panel title="Selected Target" subtitle={TIER_META[selectedTarget.tier].label}>
              <div className="font-display text-lg leading-tight">{selectedTarget.name}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {selectedTarget.category}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{selectedTarget.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Stat label="RA" value={`${selectedTarget.raDeg.toFixed(2)}°`} />
                <Stat label="Dec" value={`${selectedTarget.decDeg.toFixed(2)}°`} />
                <Stat label="Window" value={`${selectedTarget.durationMin}m`} />
                <Stat label="Obs" value={OBSERVATORIES.find(o => o.id === selectedTarget.observatoryId)?.code || ""} />
              </div>
              <div className="mt-4 border-t border-border/30 pt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Click any satellite on the globe for telemetry →
              </div>
            </Panel>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Panel title="Constellation Density" subtitle="LIVE">
        <div className="space-y-2">
          {(["STARLINK", "ONEWEB", "IRIDIUM"] as const).map((c) => {
            const count = SATELLITES.filter((s) => s.constellation === c).length;
            const color = CONSTELLATION_COLOR[c];
            return (
              <div key={c} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                <div className="flex-1">
                  <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest">
                    <span className="text-foreground">{c}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="mt-1 h-0.5 w-full bg-border/30">
                    <div className="h-full" style={{ width: `${(count / 280) * 100}%`, background: color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Mission Feed" subtitle="LIVE EVENTS">
        <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
          {events.slice().reverse().map((ev) => {
            let colorVar = "var(--muted-foreground)";
            let borderVar = "rgba(255,255,255,0.1)";
            let bgVar = "rgba(255,255,255,0.02)";
            if (ev.type === "WARNING") {
              colorVar = "var(--warning)";
              borderVar = "rgba(245,158,11,0.2)";
              bgVar = "rgba(245,158,11,0.05)";
            } else if (ev.type === "ANALYSIS") {
              colorVar = "var(--destructive)";
              borderVar = "rgba(239,68,68,0.2)";
              bgVar = "rgba(239,68,68,0.05)";
            } else if (ev.type === "ACTION") {
              colorVar = "var(--primary)";
              borderVar = "rgba(92,200,255,0.2)";
              bgVar = "rgba(92,200,255,0.05)";
            } else if (ev.type === "RESULT") {
              colorVar = "#22c55e"; // Success green
              borderVar = "rgba(34,197,94,0.2)";
              bgVar = "rgba(34,197,94,0.05)";
            }

            return (
              <div
                key={ev.id}
                style={{ borderColor: borderVar, background: bgVar }}
                className="border p-2 transition-all text-[11px] flex flex-col gap-1 rounded"
              >
                <div className="flex justify-between items-center font-mono text-[8px] uppercase tracking-wider">
                  <span style={{ color: colorVar }} className="font-semibold">
                    {ev.type}
                  </span>
                  <span className="text-muted-foreground/80">{ev.timestamp}</span>
                </div>
                <div className="font-medium text-foreground">{ev.message}</div>
                {ev.detail && <div className="text-[9px] text-muted-foreground leading-relaxed">{ev.detail}</div>}
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border/30 bg-card/30 px-2.5 py-2">
      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-sm text-foreground">{value}</div>
    </div>
  );
}

/* ============ CONFLICT / AI OVERLAY ============ */

function ConflictOverlay({ stage, decision, simTime }: { stage: DemoStage; decision: AIDecision | null; simTime: number }) {
  const visible = stage === "threat" || stage === "detect" || stage === "ai" || stage === "reschedule";
  if (!visible) return null;

  const target = decision ? TARGETS.find(t => t.id === decision.targetId) : null;
  const obs = decision ? OBSERVATORIES.find(o => o.id === decision.observatoryId) : null;

  const formatUTCTime = (secondsOffset: number) => {
    const date = new Date(Date.now() + (simTime + secondsOffset) * 1000);
    return date.toISOString().slice(11, 16) + " UTC";
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-25">
      {/* Edge flash for threat */}
      <AnimatePresence>
        {(stage === "threat" || stage === "detect") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.6, 0.2, 0.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="absolute inset-0"
            style={{ boxShadow: "inset 0 0 220px oklch(0.65 0.24 25 / 0.4)" }}
          />
        )}
      </AnimatePresence>

      {/* Center: alert card */}
      <AnimatePresence mode="wait">
        {stage === "detect" && decision && (
          <motion.div
            key="detect"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          >
            <div className="corner-frame relative w-[440px] max-w-[90vw] border border-destructive/70 bg-card/90 p-6 backdrop-blur-md" style={{ borderColor: "var(--destructive)" }}>
              <span className="corner-tr" /><span className="corner-bl" />
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-destructive">
                <span className="h-2 w-2 rounded-full bg-destructive blink" />
                INTERFERENCE DETECTED
              </div>
              <div className="mt-4 font-display text-2xl leading-tight">
                {decision.satelliteName} entering {obs ? obs.name.split(",")[0] : "observatory"} field of view
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Stat label="Probability" value={`${Math.round(decision.probability * 100)}%`} />
                <Stat label="Crossing" value={formatUTCTime(decision.originalStart)} />
                <Stat label="Target Tier" value={target ? String(target.tier) : "3"} />
              </div>
              <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Affected: {target ? target.name : "Planetary Defense target"}
              </div>
            </div>
          </motion.div>
        )}

        {stage === "ai" && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          >
            <AICore decision={decision} />
          </motion.div>
        )}

        {stage === "reschedule" && decision && (
          <motion.div
            key="resched"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          >
            <div className="corner-frame relative w-[520px] max-w-[92vw] border border-success/70 bg-card/95 p-6 backdrop-blur-md" style={{ borderColor: "var(--success)" }}>
              <span className="corner-tr" /><span className="corner-bl" />
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-success">
                <span className="h-2 w-2 rounded-full bg-success" />
                OBSERVATION PROTECTED — DECISION COMMITTED
              </div>
              <div className="mt-3 font-display text-2xl">Shift +{decision.shiftMin} min</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="border border-destructive/40 bg-destructive/5 p-3">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Original</div>
                  <div className="mt-1 line-through opacity-70">
                    {formatUTCTime(decision.originalStart)} → {formatUTCTime(decision.originalStart + (target?.durationMin || 22) * 60)}
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-destructive">CONFLICT</div>
                </div>
                <div className="border border-success/40 bg-success/5 p-3">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">New</div>
                  <div className="mt-1 text-foreground">
                    {formatUTCTime(decision.newStart)} → {formatUTCTime(decision.newStart + (target?.durationMin || 22) * 60)}
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-success">PROTECTED</div>
                </div>
              </div>
              <div className="mt-4 border-t border-border/40 pt-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Reasoning trace</div>
                <ul className="mt-2 space-y-1 font-mono text-[11px] text-foreground/90">
                  {decision.reasoning.map((r, i) => (
                    <li key={i}>› {r}</li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="text-success">{Math.round(decision.confidence * 100)}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AICore({ decision }: { decision: AIDecision | null }) {
  const satName = decision?.satelliteName || "STARLINK-44742";
  const obsCode = decision ? OBSERVATORIES.find(o => o.id === decision.observatoryId)?.code || "IAO-HNL" : "IAO-HNL";
  const target = decision ? TARGETS.find(t => t.id === decision.targetId) : null;
  const tier = target?.tier ?? 3;
  const shiftMin = decision?.shiftMin || 18;
  const conf = decision ? Math.round(decision.confidence * 100) / 100 : 0.97;
  const slots = decision ? 150 + (decision.satelliteName.charCodeAt(decision.satelliteName.length - 1) % 250) : 312;

  const steps = [
    "INGEST trajectories — 47,283 objects",
    `EVALUATE ${obsCode} FoV ∩ ${satName}`,
    `SCORE scientific value — Tier ${tier} / ${target?.category || "Target"}`,
    `COMPUTE alternatives — ${slots} slots`,
    `SELECT +${shiftMin} min shift — sky clear`,
    `EMIT decision — confidence ${conf}`,
  ];
  return (
    <div className="corner-frame relative w-[480px] max-w-[92vw] border border-primary/70 bg-card/95 p-6 backdrop-blur-md">
      <span className="corner-tr" /><span className="corner-bl" />
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border border-primary/40 pulse-ring" />
          <div className="absolute inset-1 rounded-full border border-primary/60 animate-spin" style={{ animationDuration: "4s" }} />
          <div className="absolute inset-3 rounded-full bg-primary blink" />
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">AI CORE — ENGAGED</div>
          <div className="font-display text-lg">Computing protective schedule</div>
        </div>
      </div>
      <div className="mt-5 space-y-1.5 font-mono text-[11px]">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.32 }}
            className="flex items-center gap-2 text-foreground/90"
          >
            <span className="text-primary">›</span>
            <span>{s}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ============ BOTTOM TIMELINE ============ */

function BottomTimeline({ simTime, decision, selectedTargetId, onSelectTarget }: {
  simTime: number;
  decision: AIDecision | null;
  selectedTargetId: string | null;
  onSelectTarget: (id: string) => void;
}) {
  const horizonMin = 300; // 5 hours
  const nowMin = simTime / 60;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-4">
      <div className="panel relative corner-frame">
        <span className="corner-tr" /><span className="corner-bl" />
        <div className="flex items-center justify-between border-b border-border/40 px-4 py-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground">Observation Schedule</div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            HORIZON: 5h • NOW: T+{Math.floor(nowMin)}:{String(Math.floor((nowMin % 1) * 60)).padStart(2, "0")}
          </div>
        </div>
        <div className="px-4 py-3">
          {OBSERVATORIES.map((o) => {
            const obsTargets = TARGETS.filter((t) => t.observatoryId === o.id);
            return (
              <div key={o.id} className="mb-2 flex items-center gap-3">
                <div className="w-28 shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {o.code}
                </div>
                <div className="relative h-8 flex-1 overflow-hidden border border-border/30 bg-card/20">
                  {/* hours grid */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-l border-border/20"
                      style={{ left: `${((i + 1) * 60 / horizonMin) * 100}%` }}
                    />
                  ))}
                  {obsTargets.map((t) => {
                    const isRescheduled = decision?.targetId === t.id;
                    const start = isRescheduled ? t.startMin + decision!.shiftMin : t.startMin;
                    const left = (start / horizonMin) * 100;
                    const width = (t.durationMin / horizonMin) * 100;
                    const meta = TIER_META[t.tier];
                    const selected = t.id === selectedTargetId;
                    return (
                      <div key={t.id}>
                        {isRescheduled && (
                          <div
                            className="absolute top-1 bottom-1 border border-dashed opacity-50"
                            style={{
                              left: `${(t.startMin / horizonMin) * 100}%`,
                              width: `${width}%`,
                              borderColor: "var(--destructive)",
                            }}
                          />
                        )}
                        <button
                          onClick={() => onSelectTarget(t.id)}
                          className={`absolute top-1 bottom-1 cursor-pointer border transition-all ${selected ? "ring-1 ring-primary" : ""}`}
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            background: `linear-gradient(90deg, ${meta.var}40, ${meta.var}20)`,
                            borderColor: meta.var,
                          }}
                          title={t.name}
                        >
                          <div className="truncate px-2 text-left font-mono text-[9px] uppercase tracking-widest" style={{ color: meta.var }}>
                            T{t.tier} • {t.name.split(" — ")[0]}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                  {/* now line */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-primary"
                    style={{ left: `${Math.min(100, Math.max(0, (nowMin / horizonMin) * 100))}%`, boxShadow: "0 0 8px var(--color-primary)" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============ TICKER ============ */

function Ticker() {
  const items = [
    "● UPLINK NOMINAL",
    "● 47,283 TRACKED OBJECTS",
    "● 4 OBSERVATORIES ONLINE",
    "● TIER-3 TARGET LOCKED — HANLE",
    "⚠ ELEVATED CONJUNCTION RATE — LEO SHELL 550KM",
    "● AI CORE READY",
    "● UTC LINK — STABLE",
  ];
  return (
    <div className="absolute bottom-[150px] left-0 right-0 z-10 overflow-hidden border-y border-border/30 bg-background/60 backdrop-blur-sm md:bottom-[180px]">
      <div className="ticker flex whitespace-nowrap py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="px-6">{t}</span>
        ))}
      </div>
    </div>
  );
}
