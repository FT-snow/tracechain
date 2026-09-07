"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function ChartContainer({
  id,
  className,
  children,
  config,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  const cssVars = React.useMemo(() => {
    const entries: Array<[string, string]> = [];
    for (const [key, value] of Object.entries(config)) {
      if (value.color) entries.push([`--color-${key}`, value.color]);
    }
    return Object.fromEntries(entries) as React.CSSProperties;
  }, [config]);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        data-slot="chart"
        className={cn(
          "flex justify-center text-xs [&_.recharts-tooltip-wrapper]:outline-none",
          className,
        )}
        style={{ ...cssVars, ...style }}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  valueLabel,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{
    value?: number | string;
    payload?: { label?: string };
  }>;
  valueLabel?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  const label = item.payload?.label ?? "";

  return (
    <div className="min-w-32 rounded-sm border border-border bg-surface-2 px-3 py-2 shadow-md">
      <div className="mono text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </div>
      <div className="mono mt-1 text-[13px] font-semibold text-text-primary">
        {item.value}
        {valueLabel ? ` ${valueLabel}` : ""}
      </div>
    </div>
  );
}

export { ChartContainer, ChartTooltip, ChartTooltipContent };
