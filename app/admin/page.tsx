"use client";

import { useState, useEffect } from "react";

interface SyncResultData {
  success: boolean;
  skipped?: boolean;
  summary?: {
    totalUpserted: number;
    totalErrors: number;
    durationMs: number;
    totalFetched: number;
    quotaUsed: number;
  };
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResultData | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const [authError, setAuthError] = useState<string | null>(null);

  // Check for saved auth
  useEffect(() => {
    const saved = sessionStorage.getItem("360tv_admin_secret");
    if (saved) {
      setSecret(saved);
      // Verify saved token against API quietly
      fetch("/api/admin/sync-logs", {
        headers: { "x-admin-secret": saved },
      }).then(res => {
        if (res.ok) setIsAuthed(true);
        else sessionStorage.removeItem("360tv_admin_secret");
      });
    }
  }, []);

  // Load logs when authed
  useEffect(() => {
    if (isAuthed) fetchLogs();
  }, [isAuthed]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);

    if (secret.trim()) {
      try {
        const res = await fetch("/api/admin/sync-logs", {
          headers: { "x-admin-secret": secret },
        });

        if (res.ok) {
          sessionStorage.setItem("360tv_admin_secret", secret);
          setIsAuthed(true);
        } else {
          setAuthError("Incorrect password. Please try again");
        }
      } catch (err) {
        setAuthError("Network error attempting delivery");
      }
    }
  }

  async function triggerSync() {
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);

    try {
      const res = await fetch("/api/admin/sync", {
        method: "POST",
        headers: { "x-admin-secret": secret },
      });
      const data = await res.json();

      if (!res.ok) {
        setSyncError(data.error || "Sync failed");
      } else {
        setSyncResult(data);
        fetchLogs(); // Refresh logs
      }
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSyncing(false);
    }
  }

  async function fetchLogs() {
    setLogsLoading(true);
    try {
      const res = await fetch("/api/admin/sync-logs", {
        headers: { "x-admin-secret": secret },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data || []);
      }
    } catch {
      // Fail silently
    } finally {
      setLogsLoading(false);
    }
  }

  if (!isAuthed) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 animate-fade-in">
        <div className="glass-surface rounded-2xl p-8">
          <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-brand-white mb-4 text-center">
            Admin Access
          </h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter Password"
              className="w-full bg-brand-navy border border-white/[0.1] rounded-lg px-4 py-3 text-brand-white focus:outline-none focus:border-brand-offwhite-dim transition-colors"
            />
            {authError && (
              <p className="text-accent-live text-sm">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-brand-navy-light text-brand-white font-medium hover:bg-brand-navy-mid transition-colors text-sm"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="animate-fade-in">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-brand-white tracking-wide">
          Admin Dashboard
        </h1>
        <p className="text-brand-offwhite-dim text-sm mt-1">
          Manage YouTube sync and monitor system health
        </p>
      </div>

      {/* Sync Control */}
      <div className="glass-surface rounded-xl p-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-brand-white mb-4">
          YouTube Sync
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={triggerSync}
            disabled={syncing}
            className="px-5 py-2.5 rounded-lg bg-brand-navy-light text-brand-white font-medium hover:bg-brand-navy-mid transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {syncing ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Syncing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Trigger Sync
              </>
            )}
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("360tv_admin_secret");
              setIsAuthed(false);
              setSecret("");
            }}
            className="px-4 py-2 text-xs text-brand-offwhite-dim hover:text-brand-white transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Result */}
        {syncResult && (
          <div className="mt-4 p-3 rounded-lg bg-accent-cricket/10 border border-accent-cricket/20 text-sm text-accent-cricket">
            ✓ Sync completed
            {syncResult.summary && (
              <span className="text-brand-offwhite-dim ml-2">
                — {syncResult.summary.totalUpserted} upserted,{" "}
                {syncResult.summary.totalErrors} errors,{" "}
                {syncResult.summary.durationMs}ms
              </span>
            )}
          </div>
        )}
        {syncError && (
          <div className="mt-4 p-3 rounded-lg bg-accent-live/10 border border-accent-live/20 text-sm text-accent-live">
            ✗ {syncError}
          </div>
        )}
      </div>

      {/* Sync Logs */}
      <div className="glass-surface rounded-xl p-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-brand-white">
            Sync History
          </h2>
          <button
            onClick={fetchLogs}
            disabled={logsLoading}
            className="text-xs text-brand-offwhite-dim hover:text-brand-white transition-colors"
          >
            {logsLoading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {logs.length === 0 ? (
          <p className="text-sm text-brand-offwhite-dim">No sync logs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-brand-offwhite-dim text-left border-b border-white/[0.06]">
                  <th className="pb-2 pr-4 font-medium">Time</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">Trigger</th>
                  <th className="pb-2 pr-4 font-medium">Fetched</th>
                  <th className="pb-2 pr-4 font-medium">Upserted</th>
                  <th className="pb-2 pr-4 font-medium">Errors</th>
                  <th className="pb-2 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id as string} className="border-b border-white/[0.03] text-brand-offwhite">
                    <td className="py-2.5 pr-4 font-[family-name:var(--font-mono)]">
                      {new Date(log.startedAt as string).toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${log.status === "COMPLETED"
                          ? "bg-accent-cricket/15 text-accent-cricket"
                          : log.status === "FAILED"
                            ? "bg-accent-live/15 text-accent-live"
                            : log.status === "RUNNING"
                              ? "bg-accent-upcoming/15 text-accent-upcoming"
                              : "bg-accent-past/15 text-accent-past"
                          }`}
                      >
                        {log.status as string}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">{log.trigger as string}</td>
                    <td className="py-2.5 pr-4 font-[family-name:var(--font-mono)]">{log.totalFetched as number}</td>
                    <td className="py-2.5 pr-4 font-[family-name:var(--font-mono)]">{log.totalUpserted as number}</td>
                    <td className="py-2.5 pr-4 font-[family-name:var(--font-mono)]">{log.totalErrors as number}</td>
                    <td className="py-2.5 font-[family-name:var(--font-mono)]">
                      {log.durationMs ? `${log.durationMs as number}ms` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
