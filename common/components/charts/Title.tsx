import type { Chart } from 'chart.js';
import type { Location } from '../../types/charts';

interface TitleFormat {
  text: string;
  color: string;
}

export const colorsForLine: Record<string, string> = {
  Red: '#da291c',
  Orange: '#ed8b00',
  Blue: '#003da5',
  Green: '#00834d',
  bus: '#ffc72c',
};

const getLineColor = (lineName: string) => colorsForLine[lineName] || 'black';
const titleColor = 'gray';

const parse_location_description = (location: Location, bothStops: boolean) => {
  const result: TitleFormat[] = [];
  const lineColor = getLineColor(location.line);

  result.push({ text: location['from'], color: lineColor });
  if (bothStops) {
    result.push({ text: ' to ', color: titleColor });
    result.push({ text: location['to'], color: lineColor });
  } else {
    result.push({ text: ` ${location['direction']}`, color: titleColor });
  }
  return result;
};

function font(size_px = 16) {
  // This is the default from chartjs, but now we can adjust size.
  return `bold ${size_px}px "Helvetica Neue", "Helvetica", "Arial", sans-serif`;
}

const calcLocationWidth = (words: TitleFormat[], ctx: CanvasRenderingContext2D) => {
  // input: result of parse_location_description
  // output depends on ctx's current font
  return words.map((x) => ctx.measureText(x.text).width).reduce((a, b) => a + b, 0);
};

export const drawTitle = (title: string, location: Location, bothStops: boolean, chart: Chart) => {
  const ctx = chart.ctx;
  ctx.save();

  const leftMargin = chart.scales.x.left;
  const rightMargin = chart.width - chart.scales.x.right;
  const minGap = 10;
  const vpos_row1 = 25;
  const vpos_row2 = 50;

  let fontSize = 16;
  ctx.font = font(fontSize);

  let position;

  const locationDescr = parse_location_description(location, bothStops);
  const titleWidth = ctx.measureText(title).width;
  let locationWidth = calcLocationWidth(locationDescr, ctx);

  if (leftMargin + titleWidth + minGap + locationWidth + rightMargin > chart.width) {
    // small screen: centered title stacks vertically
    ctx.textAlign = 'center';
    ctx.fillStyle = titleColor;
    ctx.fillText(title, chart.width / 2, vpos_row1);

    // Location info might be too long. Shrink the font until it fits.
    while (locationWidth > chart.width && fontSize >= 8) {
      fontSize -= 1;
      ctx.font = font(fontSize);
      locationWidth = calcLocationWidth(locationDescr, ctx);
    }
    // we want centered, but have to write 1 word at a time bc colors, so...
    ctx.textAlign = 'left';
    position = chart.width / 2 - locationWidth / 2;

    for (const { text, color } of locationDescr) {
      ctx.fillStyle = color;
      ctx.fillText(text, position, vpos_row2);
      position += ctx.measureText(text).width;
    }
  } else {
    // larger screen
    // Primary chart title goes left
    ctx.textAlign = 'left';
    ctx.fillStyle = titleColor;
    ctx.fillText(title, leftMargin, vpos_row2);

    // location components are aligned right
    ctx.textAlign = 'right';
    position = chart.width - rightMargin;
    for (const { text, color } of locationDescr.reverse()) {
      ctx.fillStyle = color;
      ctx.fillText(text, position, vpos_row2);
      position -= ctx.measureText(text).width;
    }
  }
  ctx.restore();
};
