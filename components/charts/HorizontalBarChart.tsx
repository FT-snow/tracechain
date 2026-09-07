"use client";

import { useReducedMotion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export interface HorizontalBarDatum {
  label: string;
  value: number;
  severity?: "danger" | "normal" | "safe";
}

export type SeverityLevel = NonNullable<HorizontalBarDatum["severity"]>;

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  danger: "var(--danger)",
  normal: "var(--normal)",
  safe: "var(--safe)",
};

const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  danger: "Danger",
  normal: "Normal",
  safe: "Safe",
};

interface HorizontalBarChartProps {
  data: HorizontalBarDatum[];
  valueLabel?: string;
  color?: string;
  className?: string;
  rowHeight?: number;
  highlightMax?: boolean;
}

export default function HorizontalBarChart({
  data,
  valueLabel,
  color = "var(--chart-1)",
  className,
  rowHeight = 44,
  highlightMax = true,
}: HorizontalBarChartProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const severityMode = data.some((d) => d.severity !== undefined);
  const maxIndex =
    highlightMax && data.length > 0
      ? data.findIndex((d) => d.value === Math.max(...data.map((x) => x.value)))
      : -1;

  const config = {
    value: {
      label: valueLabel ?? "Count",
      color,
    },
  } satisfies ChartConfig;

  return (
    <div className={cn("w-full", className)}>
      {severityMode && (
        <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          {(Object.keys(SEVERITY_LABELS) as SeverityLevel[]).map((s) => (
            <span key={s} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: SEVERITY_COLORS[s] }}
              />
              <span className="mono text-[11px] font-bold uppercase tracking-wider text-text-muted">
                {SEVERITY_LABELS[s]}
              </span>
            </span>
          ))}
        </div>
      )}
      <ChartContainer
        config={config}
        className="w-full"
        style={{ height: Math.max(data.length * rowHeight + 24, 120) }}
      >
        <BarChart
          accessibilityLayer
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 40, bottom: 4, left: 0 }}
          barSize={16}
        >
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <YAxis
            dataKey="label"
            type="category"
            width={132}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
          />
          <XAxis dataKey="value" type="number" hide />
          <ChartTooltip
            cursor={{ fill: "var(--surface-2)", opacity: 0.5 }}
            content={<ChartTooltipContent valueLabel={valueLabel} />}
          />
          <Bar
            dataKey="value"
            fill="var(--color-value)"
            radius={6}
            activeBar={severityMode ? false : { fill: "var(--chart-2)" }}
            isAnimationActive={!reduceMotion}
          >
            <LabelList
              dataKey="value"
              position="right"
              offset={8}
              className="fill-text-primary"
              fontSize={12}
            />
            {data.map((d, i) => (
              <Cell
                key={d.label}
                fill={
                  severityMode && d.severity
                    ? SEVERITY_COLORS[d.severity]
                    : i === maxIndex
                      ? "var(--chart-3)"
                      : undefined
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
