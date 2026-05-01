import { cn } from "@/lib/utils";
import type { Sport } from "@/lib/types";

interface SportBadgeProps {
  sport: Sport;
  size?: "sm" | "md";
}

export default function SportBadge({ sport, size = "sm" }: SportBadgeProps) {
  if (sport === "UNKNOWN") return null;

  const sizeClasses = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  const icon = sport === "CRICKET" ? "🏏" : "⚽";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wider font-[family-name:var(--font-display)]",
        sizeClasses,
        sport === "CRICKET" && "bg-accent-cricket/15 text-accent-cricket",
        sport === "FOOTBALL" && "bg-accent-football/15 text-accent-football"
      )}
    >
      <span className="text-xs">{icon}</span>
      {sport}
    </span>
  );
}
