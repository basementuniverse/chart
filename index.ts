const times = (f: Function, n: number) =>
  Array(n)
    .fill(0)
    .map((_, i) => f(i));
const range = (n: number) => times((i: number) => i, n);
const clamp = (a: number, min = 0, max = 1) =>
  a < min ? min : a > max ? max : a;
const remap = (i: number, a1: number, a2: number, b1: number, b2: number) =>
  b1 + ((i - a1) * (b2 - b1)) / (a2 - a1);
const round = (n: number, d = 0) => {
  const p = Math.pow(10, d);
  return Math.round(n * p + Number.EPSILON) / p;
};

type vec2 = { x: number; y: number };

export type ChartType = 'line' | 'area' | 'bar' | 'scatter';
export type PrimitiveX = number | Date | string;
export type XScaleKind = 'linear' | 'time' | 'category';

export type DataPoint = {
  x: PrimitiveX;
  y: number | null;
};

export type SeriesData = number[] | DataPoint[];

export type Series = {
  name?: string;
  type?: ChartType;
  data: SeriesData;
  color?: string;
  fill?: string;
  width?: number;
  pointRadius?: number;
  opacity?: number;
  hidden?: boolean;
};

export type AxisRange = {
  min?: number | Date;
  max?: number | Date;
  padding?: number;
  nice?: boolean;
  includeZero?: boolean;
};

export type AxisOptions = {
  show?: boolean;
  grid?: boolean;
  ticks?: number;
  formatter?: (value: number | string | Date) => string;
  range?: AxisRange;
};

export type AxisStyle = {
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

export type ChartTitle = {
  text: string;
  color?: string;
  font?: string;
  align?: 'left' | 'center' | 'right';
};

export type EdgeInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type ChartOptions = {
  position: vec2;
  size: vec2 | null;
  padding: number | Partial<EdgeInsets>;
  pixelRatio: number;
  background: string | null;
  type: ChartType;
  colors: string[];
  series: Series[];
  xAxis: AxisOptions;
  yAxis: AxisOptions;
  axisStyle: AxisStyle;
  title?: ChartTitle;
};

export type DrawChartResult = {
  plotRect: { x: number; y: number; width: number; height: number };
  xDomain: { min: number; max: number };
  yDomain: { min: number; max: number };
  xScaleKind: XScaleKind;
  categories: string[];
  toCanvasX: (x: number | Date | string) => number;
  toCanvasY: (y: number) => number;
};

type NormalizedPoint = {
  x: number;
  y: number | null;
  rawX: PrimitiveX;
};

type NormalizedSeries = {
  name: string;
  type: ChartType;
  data: NormalizedPoint[];
  color: string;
  fill: string;
  width: number;
  pointRadius: number;
  opacity: number;
  hidden: boolean;
};

type Domain = {
  min: number;
  max: number;
};

type PlotRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const DEFAULT_COLORS = [
  '#FA6868',
  '#71BEA0',
  '#5A9CB5',
  '#FAAC68',
  '#609B8F',
  '#2C4E80',
  '#FACE68',
  '#624E88',
];

const DEFAULT_CHART_OPTIONS: ChartOptions = {
  position: { x: 0, y: 0 },
  size: null,
  padding: { top: 24, right: 16, bottom: 32, left: 44 },
  pixelRatio: 1,
  background: null,
  type: 'line',
  colors: DEFAULT_COLORS,
  series: [],
  xAxis: {
    show: true,
    grid: false,
    ticks: 6,
    range: {
      padding: 0.02,
      nice: false,
      includeZero: false,
    },
  },
  yAxis: {
    show: true,
    grid: true,
    ticks: 6,
    range: {
      padding: 0.05,
      nice: true,
      includeZero: false,
    },
  },
  axisStyle: {
    axisColor: '#6b7280',
    axisWidth: 1,
    gridColor: '#e5e7eb',
    gridWidth: 1,
    tickColor: '#9ca3af',
    tickWidth: 1,
    tickLength: 4,
    labelColor: '#4b5563',
    labelFont: '12px sans-serif',
    labelOffset: 8,
  },
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isDataPoint(value: unknown): value is DataPoint {
  return !!value && typeof value === 'object' && 'x' in value && 'y' in value;
}

function toEdgeInsets(value: number | Partial<EdgeInsets>): EdgeInsets {
  if (typeof value === 'number') {
    return {
      top: value,
      right: value,
      bottom: value,
      left: value,
    };
  }

  return {
    top: value.top ?? 0,
    right: value.right ?? 0,
    bottom: value.bottom ?? 0,
    left: value.left ?? 0,
  };
}

function alphaColor(hexColor: string, alpha: number): string {
  const safeAlpha = clamp(alpha, 0, 1);

  if (
    hexColor.startsWith('#') &&
    (hexColor.length === 7 || hexColor.length === 4)
  ) {
    const fullHex =
      hexColor.length === 4
        ? `#${hexColor[1]}${hexColor[1]}${hexColor[2]}${hexColor[2]}${hexColor[3]}${hexColor[3]}`
        : hexColor;

    const r = Number.parseInt(fullHex.slice(1, 3), 16);
    const g = Number.parseInt(fullHex.slice(3, 5), 16);
    const b = Number.parseInt(fullHex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
  }

  return hexColor;
}

function resolveOptions(options: Partial<ChartOptions>): ChartOptions {
  const xAxisRange = {
    ...DEFAULT_CHART_OPTIONS.xAxis.range,
    ...(options.xAxis?.range ?? {}),
  };

  const yAxisRange = {
    ...DEFAULT_CHART_OPTIONS.yAxis.range,
    ...(options.yAxis?.range ?? {}),
  };

  return {
    ...DEFAULT_CHART_OPTIONS,
    ...options,
    position: options.position
      ? { x: options.position.x, y: options.position.y }
      : {
          x: DEFAULT_CHART_OPTIONS.position.x,
          y: DEFAULT_CHART_OPTIONS.position.y,
        },
    size: options.size
      ? { x: options.size.x, y: options.size.y }
      : DEFAULT_CHART_OPTIONS.size,
    colors:
      options.colors && options.colors.length > 0
        ? options.colors
        : DEFAULT_CHART_OPTIONS.colors,
    xAxis: {
      ...DEFAULT_CHART_OPTIONS.xAxis,
      ...(options.xAxis ?? {}),
      range: xAxisRange,
    },
    yAxis: {
      ...DEFAULT_CHART_OPTIONS.yAxis,
      ...(options.yAxis ?? {}),
      range: yAxisRange,
    },
    axisStyle: {
      ...DEFAULT_CHART_OPTIONS.axisStyle,
      ...(options.axisStyle ?? {}),
    },
    series: options.series ?? DEFAULT_CHART_OPTIONS.series,
  };
}

function inferXScaleKind(series: Series[]): XScaleKind {
  let hasTime = false;
  let hasCategory = false;

  for (const item of series) {
    if (!Array.isArray(item.data)) {
      continue;
    }

    for (const point of item.data) {
      if (!isDataPoint(point)) {
        continue;
      }

      if (typeof point.x === 'string') {
        hasCategory = true;
      } else if (point.x instanceof Date) {
        hasTime = true;
      }
    }
  }

  if (hasCategory) {
    return 'category';
  }

  if (hasTime) {
    return 'time';
  }

  return 'linear';
}

function xToLabel(value: PrimitiveX): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return `${value}`;
}

function normalizeSeries(
  series: Series[],
  chartType: ChartType,
  colors: string[]
): {
  xScaleKind: XScaleKind;
  categories: string[];
  series: NormalizedSeries[];
} {
  const xScaleKind = inferXScaleKind(series);
  const categoryIndex = new Map<string, number>();
  const categories: string[] = [];

  const getCategoryValue = (rawX: PrimitiveX): number => {
    const label = xToLabel(rawX);
    const existing = categoryIndex.get(label);

    if (existing !== undefined) {
      return existing;
    }

    const next = categories.length;
    categoryIndex.set(label, next);
    categories.push(label);
    return next;
  };

  const normalized = series.map((item, index): NormalizedSeries => {
    const data = item.data.map((entry, i): NormalizedPoint => {
      if (typeof entry === 'number') {
        return {
          x: xScaleKind === 'category' ? getCategoryValue(i) : i,
          y: isFiniteNumber(entry) ? entry : null,
          rawX: i,
        };
      }

      const rawX = entry.x;
      let xValue = 0;

      if (xScaleKind === 'category') {
        xValue = getCategoryValue(rawX);
      } else if (xScaleKind === 'time') {
        xValue = rawX instanceof Date ? rawX.getTime() : Number(rawX);
      } else {
        xValue = Number(rawX);
      }

      return {
        x: isFiniteNumber(xValue) ? xValue : i,
        y: isFiniteNumber(entry.y) ? entry.y : null,
        rawX,
      };
    });

    const color = item.color ?? colors[index % colors.length] ?? '#1f77b4';
    const opacity = item.opacity ?? 1;

    return {
      name: item.name ?? `Series ${index + 1}`,
      type: item.type ?? chartType,
      data,
      color,
      fill: item.fill ?? alphaColor(color, 0.2),
      width: item.width ?? 2,
      pointRadius: item.pointRadius ?? (item.type === 'scatter' ? 3 : 0),
      opacity,
      hidden: item.hidden ?? false,
    };
  });

  return {
    xScaleKind,
    categories,
    series: normalized,
  };
}

function toDomainValue(value: number | Date | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return Number(value);
}

function ensureSpan(domain: Domain): Domain {
  if (domain.min !== domain.max) {
    return domain;
  }

  const delta = domain.min === 0 ? 1 : Math.abs(domain.min) * 0.1;

  return {
    min: domain.min - delta,
    max: domain.max + delta,
  };
}

function withPadding(domain: Domain, padding: number): Domain {
  if (padding <= 0) {
    return domain;
  }

  const span = domain.max - domain.min;
  const offset = span * padding;

  return {
    min: domain.min - offset,
    max: domain.max + offset,
  };
}

function niceStep(step: number): number {
  const exponent = Math.floor(Math.log10(step));
  const fraction = step / 10 ** exponent;

  let niceFraction = 1;
  if (fraction >= 7.5) {
    niceFraction = 10;
  } else if (fraction >= 3.5) {
    niceFraction = 5;
  } else if (fraction >= 1.5) {
    niceFraction = 2;
  }

  return niceFraction * 10 ** exponent;
}

function applyNice(domain: Domain, tickCount: number): Domain {
  const safeTickCount = Math.max(2, tickCount);
  const span = domain.max - domain.min;

  if (span <= 0 || !Number.isFinite(span)) {
    return domain;
  }

  const step = niceStep(span / (safeTickCount - 1));

  return {
    min: Math.floor(domain.min / step) * step,
    max: Math.ceil(domain.max / step) * step,
  };
}

function computeDomains(
  series: NormalizedSeries[],
  xScaleKind: XScaleKind,
  categories: string[],
  xAxis: AxisOptions,
  yAxis: AxisOptions
): { xDomain: Domain; yDomain: Domain } {
  const visibleSeries = series.filter(item => !item.hidden);

  const allX = visibleSeries
    .flatMap(item => item.data.map(point => point.x))
    .filter(value => Number.isFinite(value));

  const allY = visibleSeries
    .flatMap(item => item.data.map(point => point.y))
    .filter(isFiniteNumber);

  let xDomain: Domain;
  if (xScaleKind === 'category') {
    if (categories.length === 0) {
      xDomain = { min: -0.5, max: 0.5 };
    } else {
      xDomain = { min: -0.5, max: categories.length - 0.5 };
    }
  } else {
    const xMin = allX.length > 0 ? Math.min(...allX) : 0;
    const xMax = allX.length > 0 ? Math.max(...allX) : 1;

    xDomain = ensureSpan({ min: xMin, max: xMax });
  }

  const yMin = allY.length > 0 ? Math.min(...allY) : 0;
  const yMax = allY.length > 0 ? Math.max(...allY) : 1;
  let yDomain = ensureSpan({ min: yMin, max: yMax });

  const hasBars = visibleSeries.some(item => item.type === 'bar');
  const includeZero = yAxis.range?.includeZero ?? hasBars;
  if (includeZero) {
    yDomain = {
      min: Math.min(0, yDomain.min),
      max: Math.max(0, yDomain.max),
    };
  }

  const xMinOverride = toDomainValue(xAxis.range?.min);
  const xMaxOverride = toDomainValue(xAxis.range?.max);
  const yMinOverride = toDomainValue(yAxis.range?.min);
  const yMaxOverride = toDomainValue(yAxis.range?.max);

  xDomain = {
    min: Number.isFinite(xMinOverride) ? (xMinOverride as number) : xDomain.min,
    max: Number.isFinite(xMaxOverride) ? (xMaxOverride as number) : xDomain.max,
  };

  yDomain = {
    min: Number.isFinite(yMinOverride) ? (yMinOverride as number) : yDomain.min,
    max: Number.isFinite(yMaxOverride) ? (yMaxOverride as number) : yDomain.max,
  };

  xDomain = ensureSpan(xDomain);
  yDomain = ensureSpan(yDomain);

  if (xScaleKind !== 'category') {
    xDomain = withPadding(xDomain, xAxis.range?.padding ?? 0);
  }

  yDomain = withPadding(yDomain, yAxis.range?.padding ?? 0);

  if (yAxis.range?.nice) {
    yDomain = applyNice(yDomain, yAxis.ticks ?? 6);
  }

  return { xDomain, yDomain };
}

function buildPlotRect(
  context: CanvasRenderingContext2D,
  options: ChartOptions
): { canvasWidth: number; canvasHeight: number; plotRect: PlotRect } {
  const canvasWidth = options.size
    ? options.size.x
    : Math.max(1, context.canvas.width - options.position.x);
  const canvasHeight = options.size
    ? options.size.y
    : Math.max(1, context.canvas.height - options.position.y);
  const padding = toEdgeInsets(options.padding);

  const titleHeight = options.title?.text ? 20 : 0;
  const plotRect: PlotRect = {
    x: options.position.x + padding.left,
    y: options.position.y + padding.top + titleHeight,
    width: Math.max(1, canvasWidth - padding.left - padding.right),
    height: Math.max(
      1,
      canvasHeight - padding.top - padding.bottom - titleHeight
    ),
  };

  return {
    canvasWidth,
    canvasHeight,
    plotRect,
  };
}

function makeScales(plotRect: PlotRect, xDomain: Domain, yDomain: Domain) {
  const toCanvasX = (value: number): number =>
    remap(
      value,
      xDomain.min,
      xDomain.max,
      plotRect.x,
      plotRect.x + plotRect.width
    );
  const toCanvasY = (value: number): number =>
    remap(
      value,
      yDomain.min,
      yDomain.max,
      plotRect.y + plotRect.height,
      plotRect.y
    );

  const clampX = (value: number): number =>
    clamp(value, plotRect.x, plotRect.x + plotRect.width);
  const clampY = (value: number): number =>
    clamp(value, plotRect.y, plotRect.y + plotRect.height);

  return {
    toCanvasX,
    toCanvasY,
    toClampedCanvasX: (value: number): number => clampX(toCanvasX(value)),
    toClampedCanvasY: (value: number): number => clampY(toCanvasY(value)),
  };
}

function makeTicks(domain: Domain, count: number): number[] {
  const safeCount = Math.max(2, count);
  if (safeCount === 2) {
    return [domain.min, domain.max];
  }

  const divisor = safeCount - 1;
  return range(safeCount).map(index =>
    remap(index, 0, divisor, domain.min, domain.max)
  );
}

function sampleCategoryTicks(categories: string[], maxCount: number): number[] {
  if (categories.length === 0) {
    return [];
  }

  if (categories.length <= maxCount) {
    return range(categories.length);
  }

  const step = Math.max(1, Math.ceil(categories.length / maxCount));
  const ticks: number[] = [];
  for (let i = 0; i < categories.length; i += step) {
    ticks.push(i);
  }

  if (ticks[ticks.length - 1] !== categories.length - 1) {
    ticks.push(categories.length - 1);
  }

  return ticks;
}

function defaultFormatNumber(value: number): string {
  return `${round(value, 2)}`;
}

function defaultFormatTime(value: number): string {
  return new Date(value).toLocaleDateString();
}

function drawAxes(
  context: CanvasRenderingContext2D,
  plotRect: PlotRect,
  xScaleKind: XScaleKind,
  categories: string[],
  xDomain: Domain,
  yDomain: Domain,
  xAxis: AxisOptions,
  yAxis: AxisOptions,
  axisStyle: AxisStyle,
  toCanvasX: (x: number) => number,
  toCanvasY: (y: number) => number
): void {
  const xTicks =
    xScaleKind === 'category'
      ? sampleCategoryTicks(categories, xAxis.ticks ?? 6)
      : makeTicks(xDomain, xAxis.ticks ?? 6);
  const yTicks = makeTicks(yDomain, yAxis.ticks ?? 6);
  const axisColor = axisStyle.axisColor ?? '#6b7280';
  const axisWidth = axisStyle.axisWidth ?? 1;
  const gridColor = axisStyle.gridColor ?? '#e5e7eb';
  const gridWidth = axisStyle.gridWidth ?? 1;
  const tickColor = axisStyle.tickColor ?? '#9ca3af';
  const tickWidth = axisStyle.tickWidth ?? 1;
  const tickLength = axisStyle.tickLength ?? 4;
  const labelColor = axisStyle.labelColor ?? '#4b5563';
  const labelFont = axisStyle.labelFont ?? '12px sans-serif';
  const labelOffset = axisStyle.labelOffset ?? 8;

  context.save();
  context.strokeStyle = tickColor;
  context.lineWidth = tickWidth;
  context.font = labelFont;

  if (yAxis.grid) {
    context.strokeStyle = gridColor;
    context.lineWidth = gridWidth;
    for (const value of yTicks) {
      const y = toCanvasY(value);
      context.beginPath();
      context.moveTo(plotRect.x, y);
      context.lineTo(plotRect.x + plotRect.width, y);
      context.stroke();
    }
  }

  if (xAxis.grid) {
    context.strokeStyle = gridColor;
    context.lineWidth = gridWidth;
    for (const value of xTicks) {
      const x = toCanvasX(value);
      context.beginPath();
      context.moveTo(x, plotRect.y);
      context.lineTo(x, plotRect.y + plotRect.height);
      context.stroke();
    }
  }

  context.strokeStyle = axisColor;
  context.lineWidth = axisWidth;
  if (xAxis.show) {
    context.beginPath();
    context.moveTo(plotRect.x, plotRect.y + plotRect.height);
    context.lineTo(plotRect.x + plotRect.width, plotRect.y + plotRect.height);
    context.stroke();
  }

  if (yAxis.show) {
    context.beginPath();
    context.moveTo(plotRect.x, plotRect.y);
    context.lineTo(plotRect.x, plotRect.y + plotRect.height);
    context.stroke();
  }

  context.strokeStyle = tickColor;
  context.lineWidth = tickWidth;
  if (yAxis.show && tickLength > 0) {
    for (const value of yTicks) {
      const y = toCanvasY(value);
      context.beginPath();
      context.moveTo(plotRect.x, y);
      context.lineTo(plotRect.x - tickLength, y);
      context.stroke();
    }
  }

  if (xAxis.show && tickLength > 0) {
    const axisY = plotRect.y + plotRect.height;
    for (const value of xTicks) {
      const x = toCanvasX(value);
      context.beginPath();
      context.moveTo(x, axisY);
      context.lineTo(x, axisY + tickLength);
      context.stroke();
    }
  }

  context.fillStyle = labelColor;
  context.textBaseline = 'middle';
  context.textAlign = 'right';

  for (const value of yTicks) {
    const y = toCanvasY(value);
    const label = yAxis.formatter
      ? yAxis.formatter(value)
      : defaultFormatNumber(value);
    context.fillText(label, plotRect.x - (tickLength + labelOffset), y);
  }

  context.textAlign = 'center';
  context.textBaseline = 'top';

  for (const value of xTicks) {
    const x = toCanvasX(value);
    let label = '';

    if (xScaleKind === 'category') {
      label = categories[Math.round(value)] ?? '';
      if (xAxis.formatter) {
        label = xAxis.formatter(label);
      }
    } else if (xScaleKind === 'time') {
      const asDate = new Date(value);
      label = xAxis.formatter
        ? xAxis.formatter(asDate)
        : defaultFormatTime(value);
    } else {
      label = xAxis.formatter
        ? xAxis.formatter(value)
        : defaultFormatNumber(value);
    }

    context.fillText(
      label,
      x,
      plotRect.y + plotRect.height + tickLength + labelOffset
    );
  }

  context.restore();
}

function drawTitle(
  context: CanvasRenderingContext2D,
  options: ChartOptions,
  canvasWidth: number
): void {
  if (!options.title?.text) {
    return;
  }

  context.save();
  context.fillStyle = options.title.color ?? '#111827';
  context.font = options.title.font ?? 'bold 14px sans-serif';
  context.textBaseline = 'top';

  const align = options.title.align ?? 'left';
  if (align === 'center') {
    context.textAlign = 'center';
    context.fillText(
      options.title.text,
      options.position.x + canvasWidth / 2,
      options.position.y + 2
    );
  } else if (align === 'right') {
    context.textAlign = 'right';
    context.fillText(
      options.title.text,
      options.position.x + canvasWidth,
      options.position.y + 2
    );
  } else {
    context.textAlign = 'left';
    context.fillText(
      options.title.text,
      options.position.x,
      options.position.y + 2
    );
  }

  context.restore();
}

function drawLineSeries(
  context: CanvasRenderingContext2D,
  series: NormalizedSeries,
  toCanvasX: (value: number) => number,
  toCanvasY: (value: number) => number
): void {
  context.save();
  context.globalAlpha = series.opacity;
  context.strokeStyle = series.color;
  context.lineWidth = series.width;
  context.beginPath();

  let hasSegment = false;
  for (const point of series.data) {
    const x = toCanvasX(point.x);

    if (!isFiniteNumber(point.y)) {
      hasSegment = false;
      continue;
    }

    const y = toCanvasY(point.y);
    if (!hasSegment) {
      context.moveTo(x, y);
      hasSegment = true;
    } else {
      context.lineTo(x, y);
    }
  }

  context.stroke();
  context.restore();
}

function drawAreaSeries(
  context: CanvasRenderingContext2D,
  series: NormalizedSeries,
  yDomain: Domain,
  toCanvasX: (value: number) => number,
  toCanvasY: (value: number) => number
): void {
  const baseline = clamp(0, yDomain.min, yDomain.max);
  const baselineY = toCanvasY(baseline);

  context.save();
  context.globalAlpha = series.opacity;
  context.fillStyle = series.fill;
  context.strokeStyle = series.color;
  context.lineWidth = series.width;

  let segment: Array<{ x: number; y: number }> = [];
  const flushSegment = (): void => {
    if (segment.length < 2) {
      segment = [];
      return;
    }

    context.beginPath();
    context.moveTo(segment[0].x, baselineY);
    for (const point of segment) {
      context.lineTo(point.x, point.y);
    }
    const lastPoint = segment[segment.length - 1];
    context.lineTo(lastPoint.x, baselineY);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo(segment[0].x, segment[0].y);
    for (let i = 1; i < segment.length; i += 1) {
      context.lineTo(segment[i].x, segment[i].y);
    }
    context.stroke();

    segment = [];
  };

  for (const point of series.data) {
    if (!isFiniteNumber(point.y)) {
      flushSegment();
      continue;
    }

    segment.push({
      x: toCanvasX(point.x),
      y: toCanvasY(point.y),
    });
  }
  flushSegment();

  context.restore();
}

function estimateNumericBarWidth(
  series: NormalizedSeries[],
  toCanvasX: (value: number) => number
): number {
  const xValues = new Set<number>();
  for (const item of series) {
    if (item.type !== 'bar' || item.hidden) {
      continue;
    }

    for (const point of item.data) {
      xValues.add(point.x);
    }
  }

  const sorted = [...xValues].sort((a, b) => a - b);
  if (sorted.length < 2) {
    return 24;
  }

  let minDelta = Number.POSITIVE_INFINITY;
  for (let i = 1; i < sorted.length; i += 1) {
    minDelta = Math.min(minDelta, sorted[i] - sorted[i - 1]);
  }

  if (!Number.isFinite(minDelta) || minDelta <= 0) {
    return 24;
  }

  return Math.max(
    2,
    Math.abs(toCanvasX(sorted[0] + minDelta) - toCanvasX(sorted[0])) * 0.8
  );
}

function drawBarSeries(
  context: CanvasRenderingContext2D,
  series: NormalizedSeries,
  allSeries: NormalizedSeries[],
  xScaleKind: XScaleKind,
  categories: string[],
  plotRect: PlotRect,
  yDomain: Domain,
  toCanvasX: (value: number) => number,
  toCanvasY: (value: number) => number
): void {
  const bars = allSeries.filter(item => item.type === 'bar' && !item.hidden);
  const barIndex = bars.findIndex(item => item === series);
  if (barIndex < 0 || bars.length === 0) {
    return;
  }

  let slotWidth = 24;
  if (xScaleKind === 'category') {
    slotWidth =
      categories.length > 0
        ? (plotRect.width / categories.length) * 0.8
        : plotRect.width * 0.8;
  } else {
    slotWidth = estimateNumericBarWidth(allSeries, toCanvasX);
  }

  const width = Math.max(1, slotWidth / bars.length);
  const offset = -slotWidth / 2 + barIndex * width;
  const baseline = clamp(0, yDomain.min, yDomain.max);
  const baselineY = toCanvasY(baseline);

  context.save();
  context.globalAlpha = series.opacity;
  context.fillStyle = series.fill;
  context.strokeStyle = series.color;
  context.lineWidth = 1;

  for (const point of series.data) {
    if (!isFiniteNumber(point.y)) {
      continue;
    }

    const x = toCanvasX(point.x) + offset;
    const y = toCanvasY(point.y);
    const left = x;
    const top = Math.min(y, baselineY);
    const height = Math.max(1, Math.abs(y - baselineY));

    context.beginPath();
    context.rect(left, top, width, height);
    context.fill();
  }

  context.restore();
}

function drawScatterSeries(
  context: CanvasRenderingContext2D,
  series: NormalizedSeries,
  toCanvasX: (value: number) => number,
  toCanvasY: (value: number) => number
): void {
  context.save();
  context.globalAlpha = series.opacity;
  context.fillStyle = series.fill;
  context.strokeStyle = series.color;
  context.lineWidth = Math.max(1, series.width * 0.5);

  for (const point of series.data) {
    if (!isFiniteNumber(point.y)) {
      continue;
    }

    context.beginPath();
    context.arc(
      toCanvasX(point.x),
      toCanvasY(point.y),
      Math.max(1, series.pointRadius),
      0,
      Math.PI * 2
    );
    context.fill();
    context.stroke();
  }

  context.restore();
}

function drawSeries(
  context: CanvasRenderingContext2D,
  series: NormalizedSeries[],
  xScaleKind: XScaleKind,
  categories: string[],
  plotRect: PlotRect,
  yDomain: Domain,
  toCanvasX: (value: number) => number,
  toCanvasY: (value: number) => number
): void {
  for (const item of series) {
    if (item.hidden) {
      continue;
    }

    if (item.type === 'line') {
      drawLineSeries(context, item, toCanvasX, toCanvasY);
    } else if (item.type === 'area') {
      drawAreaSeries(context, item, yDomain, toCanvasX, toCanvasY);
    } else if (item.type === 'bar') {
      drawBarSeries(
        context,
        item,
        series,
        xScaleKind,
        categories,
        plotRect,
        yDomain,
        toCanvasX,
        toCanvasY
      );
    } else if (item.type === 'scatter') {
      drawScatterSeries(context, item, toCanvasX, toCanvasY);
    }
  }
}

function toInputXValue(
  value: number | Date | string,
  xScaleKind: XScaleKind,
  categories: string[]
): number {
  if (xScaleKind === 'category') {
    const label = xToLabel(value);
    const index = categories.indexOf(label);
    return index >= 0 ? index : 0;
  }

  if (xScaleKind === 'time') {
    return value instanceof Date ? value.getTime() : Number(value);
  }

  return Number(value);
}

export function drawChart(
  context: CanvasRenderingContext2D,
  options: Partial<ChartOptions>
): DrawChartResult {
  const resolved = resolveOptions(options);
  const normalized = normalizeSeries(
    resolved.series,
    resolved.type,
    resolved.colors
  );

  const { canvasWidth, canvasHeight, plotRect } = buildPlotRect(
    context,
    resolved
  );
  const { xDomain, yDomain } = computeDomains(
    normalized.series,
    normalized.xScaleKind,
    normalized.categories,
    resolved.xAxis,
    resolved.yAxis
  );

  const scales = makeScales(plotRect, xDomain, yDomain);

  context.save();
  if (resolved.background) {
    context.fillStyle = resolved.background;
    context.fillRect(
      resolved.position.x,
      resolved.position.y,
      canvasWidth,
      canvasHeight
    );
  }

  drawAxes(
    context,
    plotRect,
    normalized.xScaleKind,
    normalized.categories,
    xDomain,
    yDomain,
    resolved.xAxis,
    resolved.yAxis,
    resolved.axisStyle,
    scales.toClampedCanvasX,
    scales.toClampedCanvasY
  );

  drawSeries(
    context,
    normalized.series,
    normalized.xScaleKind,
    normalized.categories,
    plotRect,
    yDomain,
    scales.toClampedCanvasX,
    scales.toClampedCanvasY
  );

  drawTitle(context, resolved, canvasWidth);
  context.restore();

  return {
    plotRect,
    xDomain,
    yDomain,
    xScaleKind: normalized.xScaleKind,
    categories: normalized.categories,
    toCanvasX: (x): number =>
      scales.toClampedCanvasX(
        toInputXValue(x, normalized.xScaleKind, normalized.categories)
      ),
    toCanvasY: (y): number => scales.toClampedCanvasY(y),
  };
}
