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
}

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
    <ChartContainer
      config={config}
      className={cn("w-full", className)}
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
          radius={4}
          activeBar={{ fill: "var(--chart-2)" }}
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
              fill={i === maxIndex ? "var(--chart-3)" : undefined}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
