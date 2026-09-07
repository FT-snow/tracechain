"use client";

import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import { demoHeatmap } from "@/lib/data";

export default function HeatmapPage() {
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

      <div className="card p-5">
        <h3 className="text-lg font-semibold text-text-primary">
          Complaint volume by district
        </h3>
        <p className="mt-1 text-sm text-text-secondary">
          Ranked descending · {total} active complaints
        </p>
        <div className="mt-4">
          <HorizontalBarChart
            data={sorted.map((d) => ({ label: d.district, value: d.count }))}
            valueLabel="complaints"
          />
        </div>
      </div>
    </div>
  );
}
