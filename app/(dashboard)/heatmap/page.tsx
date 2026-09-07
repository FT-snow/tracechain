"use client";

import { demoHeatmap } from "@/lib/data";
import { riskColor } from "@/lib/utils";

export default function HeatmapPage() {
  const max = Math.max(...demoHeatmap.map((d) => d.count));
  const sorted = [...demoHeatmap].sort((a, b) => b.count - a.count);
  const total = demoHeatmap.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[32px] leading-tight font-bold tracking-tight text-text-primary">
          Heat Map
        </h1>
        <p className="mt-1 text-base text-text-secondary">
          Complaint volume by district. Total active: {total}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((d, i) => {
          const pct = (d.count / max) * 100;
          return (
            <div key={d.district} className="bg-bg p-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="mono text-xs uppercase tracking-wider text-text-muted">
                    {d.state}
                  </span>
                  <div className="text-sm font-semibold text-text-primary">
                    {d.district}
                  </div>
                </div>
                <div className="mono text-2xl font-bold text-text-primary">
                  {d.count}
                </div>
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: riskColor(pct),
                  }}
                />
              </div>
              <div className="mono mt-2 text-[13px] text-text-muted">
                rank {i + 1} · {Math.round((d.count / total) * 100)}% of total
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
