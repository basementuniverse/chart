import { vec2 } from '@basementuniverse/vec';
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
    title?: ChartTitle;
};
export type DrawChartResult = {
    plotRect: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    xDomain: {
        min: number;
        max: number;
    };
    yDomain: {
        min: number;
        max: number;
    };
    xScaleKind: XScaleKind;
    categories: string[];
    toCanvasX: (x: number | Date | string) => number;
    toCanvasY: (y: number) => number;
};
export default function drawChart(context: CanvasRenderingContext2D, options: Partial<ChartOptions>): DrawChartResult;
