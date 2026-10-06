"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { analyze, intervalsFromTimes, RATIOS, ratioBpm, PITCH_RIDES, RESET_MS, WINDOW, type Ratio } from "@/lib/tap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeButton } from "@/components/theme-button";

export default function Page() {
  const timesRef = useRef<number[]>([]);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState({ bpm: null as number | null, taps: 0, jitter: 0 });
  const [manual, setManual] = useState<string>("");
  const [advanced, setAdvanced] = useState<Set<string>>(new Set());
  const [pulse, setPulse] = useState(false);

  const effectiveBpm = manual ? Number.parseFloat(manual) : state.bpm;

  const tap = useCallback(() => {
    setPulse(true);
    setTimeout(() => setPulse(false), 80);
    const now = performance.now();
    const times = timesRef.current;
    if (times.length && now - times[times.length - 1]! > RESET_MS) {
      timesRef.current = [now];
    } else {
      timesRef.current = [...times, now].slice(-WINDOW - 1);
    }
    const intervals = intervalsFromTimes(timesRef.current).slice(-WINDOW);
    setState(analyze(intervals));
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  // last BPM stays until explicit clear or a fresh tap session — no auto-wipe.
  function clearAll() {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    timesRef.current = [];
    setState({ bpm: null, taps: 0, jitter: 0 });
    setManual("");
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        tap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tap]);

  function toggleAdvanced(id: string) {
    setAdvanced(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const visibleRatios = RATIOS.filter(r => !r.advanced || advanced.has("all") || advanced.has(r.id));

  return (
    <TooltipProvider delayDuration={120}>
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4">
        <header className="flex items-center justify-between pt-6">
          <h1 className="text-2xl font-extrabold">bpm tap tempo</h1>
          <ThemeButton />
        </header>

        <main className="flex flex-1 flex-col items-center gap-8 py-8">
          {/* the tap button - the hero */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={tap}
              className={`flex size-44 items-center justify-center rounded-full border-4 border-primary bg-primary/10 text-xl font-extrabold tracking-wider text-primary transition-transform select-none active:scale-95 ${pulse ? "scale-95 bg-primary/25" : ""}`}
              aria-label="tap to the beat"
            >
              TAP
            </button>
            <p className="text-xs text-muted-foreground">tap to the beat, or hit spacebar. a new session starts when you tap again after a pause.</p>

            {/* readout */}
            <div className="bpm-mono flex items-baseline gap-3">
              <span className="text-5xl font-extrabold text-primary tabular-nums">
                {effectiveBpm ?? "--"}
              </span>
              <span className="text-sm text-muted-foreground">
                bpm {state.taps > 0 && !manual && `· ${state.taps} taps · ${Math.round(state.jitter * 100)}% steady`}
              </span>
              {(state.bpm !== null || manual) && (
                <Button variant="ghost" size="sm" onClick={clearAll} aria-label="reset bpm">
                  reset
                </Button>
              )}
            </div>

            {/* manual entry (Q21) */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">or type a bpm:</span>
              <Input
                inputMode="decimal"
                value={manual}
                placeholder="128"
                onChange={(e) => setManual(e.target.value.replace(/[^0-9.]/g, ""))}
                className="h-8 w-24 text-sm"
                aria-label="manual bpm entry"
              />
              {manual && (
                <Button variant="ghost" size="sm" onClick={() => setManual("")}>clear</Button>
              )}
            </div>
          </div>

          {/* ratio cards */}
          {effectiveBpm && effectiveBpm > 0 && (
            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
              {visibleRatios.map((r) => (
                <Tooltip key={r.id}>
                  <TooltipTrigger asChild>
                    <Card className="py-0 transition-colors hover:border-primary/60">
                      <CardContent className="bpm-mono flex flex-col gap-1 p-4">
                        <span className="text-2xl font-bold text-primary tabular-nums">{ratioBpm(effectiveBpm, r)}</span>
                        <span className="text-xs text-muted-foreground">{r.label}</span>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>{r.hint}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}

          {/* advanced ratio pills */}
          <div className="flex flex-wrap justify-center gap-2" aria-label="advanced ratios">
            {RATIOS.filter(r => r.advanced).map((r) => (
              <button
                key={r.id}
                title={r.hint}
                onClick={() => toggleAdvanced(r.id)}
                className={`bpm-mono rounded-full border px-3 py-1 text-xs ${advanced.has(r.id) ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* pitch ride strip */}
          {effectiveBpm && effectiveBpm > 0 && (
            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
              {PITCH_RIDES.map((p) => (
                <Card key={p} className="py-0">
                  <CardContent className="bpm-mono flex flex-col gap-1 p-4">
                    <span className="text-lg font-bold tabular-nums">
                      {Math.round(effectiveBpm * (1 + p / 100) * 10) / 10}
                    </span>
                    <span className="text-xs text-muted-foreground">pitch {p > 0 ? `+${p}` : p}%</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* crawlable explainer */}
          <section className="w-full max-w-xl space-y-3 pt-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              half and double time are the cross-genre bridge: a 174 bpm drum and bass
              track and an 87 bpm hip-hop track share the same kick grid - every other
              dnb kick lands on the hip-hop beat. the same math pairs 70 bpm trap with
              140 bpm dubstep.
            </p>
            <p>
              the dotted eighth (x3/4) is the subtler pivot: 129 house into 97 material
              feels related without a big jump, and the pros ride 4/3 (129 to 172) to
              cross from house into drum and bass.
            </p>
            <p>
              tempo math is a guide, not a rulebook. phrase alignment and your ears
              are the final judge.
            </p>
          </section>
        </main>

        <footer className="mt-auto flex flex-col items-center gap-1 pb-8 text-center text-xs text-muted-foreground">
          <p>
            built by <a href="https://endothe.dev" className="text-primary">endo</a> -
            deployed from a raspberry pi -
            <a href="https://github.com/EndoTheDev/bpm-tap-tempo" className="text-primary">source on github</a>
          </p>
          <p>
            which <em>key</em> mixes with this?{" "}
            <a href="https://endothe.dev/tools/camelot-wheel" className="text-primary">camelot wheel</a>
          </p>
        </footer>
      </div>
    </TooltipProvider>
  );
}