import { BarChart } from "@mui/x-charts/BarChart";
import type { ReactNode } from "react";

/** One bar: a generic label + numeric value, so this component isn't coupled to any repo/domain type. */
export interface BarChartDatum {
  /** Identifies the bar for `onBarClick` — doesn't need to be displayed anywhere. */
  id: string | number;
  label: string;
  value: number;
  // MUI X Charts' `dataset` prop requires an index signature on each row.
  [key: string]: string | number;
}

export interface StarsBarChartProps {
  data: BarChartDatum[];
  /** Defaults to scaling with the number of bars, since each bar gets its own row. */
  height?: number;
  /** Shown in place of the chart when `data` is empty. */
  emptyFallback?: ReactNode;
  /** Cap to the top N bars by value (after sorting) — keeps the chart readable with large datasets. */
  maxItems?: number;
  /** Called with the clicked bar's full datum (e.g. to scroll to/highlight the matching row elsewhere on the page). */
  onBarClick?: (datum: BarChartDatum) => void;
}

/**
 * Horizontal bar chart of GitHub stars per tracked repository.
 *
 * Horizontal (rather than vertical) bars so long repo names get a full-width row to render in —
 * a vertical chart would need to rotate/clip long names to fit under each bar.
 */
export function StarsBarChart({ data, height, emptyFallback = null, maxItems, onBarClick }: StarsBarChartProps) {
  if (data.length === 0) {
    return emptyFallback;
  }

  // Star counts vary wildly (a popular repo can dwarf everything else) — exact values are shown
  // on hover instead of printed on every bar, since in-bar labels collide once bars get short.
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const visible = maxItems ? sorted.slice(0, maxItems) : sorted;
  const chartHeight = height ?? visible.length * 48 + 40;

  return (
    <BarChart
      layout="horizontal"
      height={chartHeight}
      dataset={visible}
      yAxis={[
        {
          scaleType: "band",
          dataKey: "label",
          // Truncate only the axis tick label; the tooltip (location: "tooltip") still gets the full name.
          valueFormatter: (value: string, context) =>
            context.location === "tick" && value.length > 20 ? `${value.slice(0, 18)}…` : value,
        },
      ]}
      xAxis={[{ valueFormatter: (value: number) => value.toLocaleString() }]}
      series={[
        {
          dataKey: "value",
          label: "Stars",
          color: "#f2b90c",
          valueFormatter: (value) => (value === null ? "" : value.toLocaleString()),
        },
      ]}
      margin={{ left: 190, right: 40, top: 10, bottom: 30 }}
      onItemClick={(_event, itemData) => {
        if (onBarClick && itemData?.dataIndex !== undefined) {
          onBarClick(visible[itemData.dataIndex]);
        }
      }}
      sx={onBarClick ? { "& .MuiBarElement-root": { cursor: "pointer" } } : undefined}
      slotProps={{ legend: { hidden: true } }}
    />
  );
}
