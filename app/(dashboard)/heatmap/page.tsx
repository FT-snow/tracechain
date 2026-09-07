"use client";

import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import { Badge } from "@/components/ui/badge";
import { demoHeatmap, demoCorrelations } from "@/lib/data";

export default function HeatmapPage() {
  const sorted = [...demoHeatmap].sort((a, b) => b.count - a.count);
  const total = demoHeatmap.reduce((s, d) => s + d.count, 0);
  const clusterData = demoCorrelations.map((c) => ({
    label: c.id,
    value: c.walletCluster.length,
  }));

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

      <div className="card p-5">
        <h3 className="text-lg font-semibold text-text-primary">
          Complaint volume by district
        </h3>
        <p className="mt-1 text-sm text-text-secondary">
          Ranked descending · {total} active complaints
        </p>
        <div className="mt-4">
          <HorizontalBarChart
            data={sorted.map((d) => ({
              label: d.district,
              value: d.count,
              severity: d.severity,
            }))}
            valueLabel="complaints"
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl leading-tight font-bold tracking-tight text-text-primary">
          Correlations
        </h2>
        <p className="mt-1 text-base text-text-secondary">
          Separate cases converging on shared deposit wallets expose the same
          operator.
        </p>
      </div>

      <div className="card p-5">
        <h3 className="text-lg font-semibold text-text-primary">
          Wallets per cluster
        </h3>
        <p className="mt-1 text-sm text-text-secondary">
          Cluster size by linked deposit wallets
        </p>
        <div className="mt-4">
          <HorizontalBarChart data={clusterData} valueLabel="wallets" />
        </div>
      </div>

      <div className="space-y-4">
        {demoCorrelations.map((c) => (
          <div key={c.id} className="card p-5">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="mono text-xs font-semibold uppercase text-text-muted">
                    cluster {c.id}
                  </span>
                  <Badge
                    variant={c.strength > 80 ? "destructive" : "secondary"}
                    className="mono font-bold uppercase"
                  >
                    strength {c.strength}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-text-primary">{c.note}</p>
                <div className="mono mt-3 space-y-1 text-[13px] text-text-secondary">
                  {c.walletCluster.map((w) => (
                    <div key={w}>{w}</div>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="mono text-xs uppercase tracking-wider text-text-muted">
                  linked cases
                </div>
                <div className="mono mt-1 space-y-0.5 text-[13px] text-text-secondary">
                  {c.caseIds.map((id) => (
                    <div key={id}>{id}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-dashed border-border py-10 text-center">
        <p className="text-sm text-text-secondary">
          New clusters form automatically when multiple traces resolve to the
          same deposit wallet
        </p>
      </div>
    </div>
  );
}
