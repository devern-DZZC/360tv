"use client";

import { useState, useEffect } from "react";

interface StreamCountdownProps {
  targetDate: string | Date;
}

export default function StreamCountdown({ targetDate }: StreamCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    function update() {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsPast(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (isPast) {
    return (
      <div className="flex items-center gap-2 text-accent-upcoming font-[family-name:var(--font-display)]">
        <span className="relative flex h-2.5 w-2.5">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{
              background: "var(--accent-upcoming)",
              animation: "pulse-ring 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
            }}
          />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-upcoming" />
        </span>
        <span className="text-lg font-semibold tracking-wide">Starting soon...</span>
      </div>
    );
  }

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <CountdownUnit value={timeLeft.days} label="DAYS" />
      <Separator />
      <CountdownUnit value={timeLeft.hours} label="HRS" />
      <Separator />
      <CountdownUnit value={timeLeft.minutes} label="MIN" />
      <Separator />
      <CountdownUnit value={timeLeft.seconds} label="SEC" />
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-[family-name:var(--font-mono)] text-2xl sm:text-3xl font-medium text-brand-white tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[9px] sm:text-[10px] text-brand-offwhite-dim font-[family-name:var(--font-display)] tracking-[0.15em] mt-1">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span className="text-brand-offwhite-dim/30 text-xl font-light self-start mt-1">
      :
    </span>
  );
}
