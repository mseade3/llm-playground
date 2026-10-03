import { cn } from "@/lib/utils";

/** Atmospheric river-flow light field for the workspace shell. */
export function RiverBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn("river-stage pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className="river-base" />
      <div className="river-band river-band-a" />
      <div className="river-band river-band-b" />
      <div className="river-band river-band-c" />
      <div className="river-caustic" />
      <div className="river-pulse" />
      <div className="river-veil" />
    </div>
  );
}
