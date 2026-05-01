import { cn } from "@/lib/utils";
import type { StreamStatus } from "@/lib/types";

interface StreamStatusBadgeProps {
  status: StreamStatus;
  size?: "sm" | "md";
}

export default function StreamStatusBadge({
  status,
  size = "sm",
}: StreamStatusBadgeProps) {
  const sizeClasses = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wider font-[family-name:var(--font-display)]",
        sizeClasses,
        status === "LIVE" && "bg-accent-live/20 text-accent-live",
        status === "UPCOMING" && "bg-accent-upcoming/20 text-accent-upcoming",
        status === "PAST" && "bg-accent-past/20 text-accent-past",
        status === "CANCELLED" && "bg-accent-past/20 text-accent-past line-through"
      )}
    >
      {status === "LIVE" && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{
              background: "var(--accent-live)",
              animation: "pulse-ring 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
            }}
          />
          <span
            className="relative inline-flex rounded-full h-1.5 w-1.5"
            style={{ background: "var(--accent-live)" }}
          />
        </span>
      )}
      {status}
    </span>
  );
}
