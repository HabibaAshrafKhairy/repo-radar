import { BarChart } from "@mui/x-charts/BarChart";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** One bar: a generic label + numeric value, so this component isn't coupled to any repo/domain type. */
export interface BarChartDatum {
  label: string;
  value: number;
  // MUI X Charts' `dataset` prop requires an index signature on each row.
  [key: string]: string | number;
}

export interface StarsBarChartProps {
  data: BarChartDatum[];
  height?: number;
  emptyFallback?: ReactNode;
  /** Cap to the top N bars by value (after sorting) — keeps the chart readable with large datasets. */
  maxItems?: number;
  color?: string;
}

const DEFAULT_LEFT_MARGIN = 160;
const DEFAULT_COLOR = "#6366f1";

/**
 * Horizontal bar chart of GitHub stars per tracked repository.
 *
 * Horizontal (rather than vertical) bars so long repo names get a full-width row to render in —
 * a vertical chart would need to rotate/clip long names to fit under each bar. Names are shown
 * in full (never truncated); the left margin is measured from the *actual rendered* tick label
 * widths (via `getBBox()`)
 */
export function StarsBarChart({
  data,
  height,
  emptyFallback = null,
  maxItems,
  color = DEFAULT_COLOR,
}: StarsBarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftMargin, setLeftMargin] = useState(DEFAULT_LEFT_MARGIN);

  const sorted = [...data].sort((a, b) => {
    const byStars = b.value - a.value;

    if (byStars !== 0) {
      return byStars;
    }
    // To prevent equal-star repositories from changing order when cards re-ordering
    return a.label.localeCompare(b.label);
  });
  const visible = maxItems ? sorted.slice(0, maxItems) : sorted;

  const visibleLabelsKey = visible.map((item) => item.label).join("|");

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      const labels = containerRef.current?.querySelectorAll<SVGTextElement>(
        ".MuiChartsAxis-tickLabel",
      );
      if (!labels || labels.length === 0) return;
      let maxWidth = 0;
      labels.forEach((label) => {
        maxWidth = Math.max(maxWidth, label.getBBox().width);
      });
      const needed = Math.ceil(maxWidth) + 24;
      setLeftMargin((current) =>
        Math.abs(current - needed) > 4 ? needed : current,
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [visibleLabelsKey]);

  if (data.length === 0) {
    return emptyFallback;
  }

  const chartHeight = height ?? visible.length * 48 + 40;

  return (
    <div ref={containerRef} style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 480 }}>
        <BarChart
          layout="horizontal"
          height={chartHeight}
          dataset={visible}
          yAxis={[{ scaleType: "band", dataKey: "label" }]}
          xAxis={[
            { valueFormatter: (value: number) => value.toLocaleString() },
          ]}
          series={[
            {
              dataKey: "value",
              label: "Stars",
              color,
              valueFormatter: (value) =>
                value === null ? "" : value.toLocaleString(),
            },
          ]}
          margin={{ left: leftMargin, right: 40, top: 10, bottom: 30 }}
          slotProps={{ legend: { hidden: true } }}
        />
      </div>
    </div>
  );
}

