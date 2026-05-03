# @basementuniverse/chart

Tiny library for quickly rendering charts on a canvas without the overhead of a full charting framework.

## Install

```bash
npm install @basementuniverse/chart
```

## How to use

```ts
import drawChart from '@basementuniverse/chart';

const canvas = document.querySelector('canvas')!;
const context = canvas.getContext('2d')!;

drawChart(context, {
	type: 'line',
	series: [
		{
			name: 'Visits',
			data: [12, 18, 16, 24, 31, 28],
		},
	],
});
```

## Supported Chart Types

- `line`
- `area`
- `bar`
- `scatter`

You can mix types per series.

## Data Formats

### 1. Quick shorthand (`number[]`)

When data is an array of numbers, x values are inferred from the index.

```ts
{
	series: [
		{ name: 'CPU', data: [33, 48, 41, 54, 50] },
	],
}
```

### 2. Explicit points (`{ x, y }[]`)

Use explicit points for numeric x, categorical x, or time series x.

```ts
{
	series: [
		{
			name: 'Revenue',
			type: 'bar',
			data: [
				{ x: 'Jan', y: 120 },
				{ x: 'Feb', y: 132 },
				{ x: 'Mar', y: 126 },
			],
		},
	],
}
```

```ts
{
	series: [
		{
			name: 'Temperature',
			type: 'line',
			data: [
				{ x: new Date('2026-01-01'), y: 6 },
				{ x: new Date('2026-01-02'), y: 8 },
				{ x: new Date('2026-01-03'), y: 7 },
			],
		},
	],
}
```

## Axis Ranges

You can define x/y ranges explicitly, or let the chart infer them from data.

```ts
drawChart(context, {
	series: [
		{
			type: 'scatter',
			data: [
				{ x: 0, y: 12 },
				{ x: 10, y: 20 },
				{ x: 20, y: 18 },
			],
		},
	],
	xAxis: {
		range: { min: 0, max: 25 },
	},
	yAxis: {
		range: { min: 0, max: 30 },
	},
});
```

## API

```ts
drawChart(
  context: CanvasRenderingContext2D,
  options: Partial<ChartOptions>
): DrawChartResult
```

### Options

```ts
type ChartOptions = {
  position: { x: number; y: number };
  size: { x: number; y: number } | null;
  padding: number | Partial<{
    top: number;
    right: number;
    bottom: number;
    left: number;
  }>;
  pixelRatio: number;
  background: string | null;
  type: 'line' | 'area' | 'bar' | 'scatter';
  colors: string[];
  series: Series[];
  xAxis: AxisOptions;
  yAxis: AxisOptions;
  axisStyle: {
    axisColor?: string;
    axisWidth?: number;
    gridColor?: string;
    gridWidth?: number;
    tickColor?: string;
    tickWidth?: number;
    tickLength?: number;
    labelColor?: string;
    labelFont?: string;
    labelOffset?: number;
  };
  title?: {
    text: string;
    color?: string;
    font?: string;
    align?: 'left' | 'center' | 'right';
  };
};

type Series = {
  name?: string;
  type?: 'line' | 'area' | 'bar' | 'scatter';
  data:
    | number[]
    | {
        x: number | Date | string;
        y: number | null;
      }[];
  color?: string;
  fill?: string;
  width?: number;
  pointRadius?: number;
  opacity?: number;
  hidden?: boolean;
};

type AxisOptions = {
  show?: boolean;
  grid?: boolean;
  ticks?: number;
  formatter?: (value: number | string | Date) => string;
  range?: {
    min?: number | Date;
    max?: number | Date;
    padding?: number;
    nice?: boolean;
    includeZero?: boolean;
  };
};
```

### Return value

```ts
type DrawChartResult = {
  plotRect: { x: number; y: number; width: number; height: number };
  xDomain: { min: number; max: number };
  yDomain: { min: number; max: number };
  xScaleKind: 'linear' | 'time' | 'category';
  categories: string[];
  toCanvasX: (x: number | Date | string) => number;
  toCanvasY: (y: number) => number;
};
```
