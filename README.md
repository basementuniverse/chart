# @basementuniverse/chart

Tiny library for quickly rendering charts on a canvas without the overhead of a full charting framework.

## Install

```bash
npm install @basementuniverse/chart
```

## Usage

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

### 1) Quick shorthand (`number[]`)

When data is an array of numbers, x values are inferred from the index.

```ts
{
	series: [
		{ name: 'CPU', data: [33, 48, 41, 54, 50] },
	],
}
```

### 2) Explicit points (`{ x, y }[]`)

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
drawChart(context: CanvasRenderingContext2D, options: Partial<ChartOptions>): DrawChartResult
```

### Important options

- `position`: top-left chart position (`vec2`) inside the canvas.
- `size`: chart size (`vec2`) or `null` to use canvas dimensions.
- `type`: default type for series that do not specify `type`.
- `series`: chart series definitions.
- `xAxis`, `yAxis`: visibility, grid, ticks, formatter, and range options.
- `title`: optional title with align/font/color.
- `background`: optional chart background fill.

### Series options

- `type`: `line | area | bar | scatter`
- `data`: `number[] | { x: number | Date | string; y: number | null }[]`
- `color`, `fill`, `width`, `pointRadius`, `opacity`, `hidden`

### Return value

`drawChart` returns useful metadata for future interaction hooks:

- plot rectangle
- resolved x/y domains
- inferred x scale kind
- category labels (if category scale)
- helper functions to convert x/y values to canvas coordinates

## Notes

- `y: null` creates gaps for line/area series.
- Bar series include zero baseline by default unless axis range overrides it.
- This package is intentionally small and focused on static rendering.
