import { colorsForLine } from '../constants.js';

const getLineColor = (lineName) => colorsForLine[lineName] || 'black';
const titleColor = 'gray';

const parse_location_description = (location, bothStops) => {
  /** Example return values:
   * [["Harvard", "red"], [" to ", "gray"], ["Park St", "red"]]
   * or
   * [["Harvard", "red"], [" southbound", "gray"]]
   */
  const result = [];
  const lineColor = getLineColor(location['line']);

  result.push([location['from'], lineColor]);
  if (bothStops) {
    result.push([' to ', titleColor]);
    result.push([location['to'], lineColor]);
  } else {
    result.push([` ${location['direction']}`, titleColor]);
  }
  return result;
};

function font(size_px = 16) {
  // This is the default from chartjs, but now we can adjust size.
  return `bold ${size_px}px "Helvetica Neue", "Helvetica", "Arial", sans-serif`;
}

const calcLocationWidth = (words, ctx) => {
  // input: result of parse_location_description
  // output depends on ctx's current font
  return words.map(x => ctx.measureText(x[0]).width)
              .reduce((a,b) => a + b, 0);
}

const drawTitle = (title, location, bothStops, chart) => {
  const ctx = chart.chart.ctx;
  ctx.save();

  const leftMargin = chart.scales['x-axis-0'].left;
  const rightMargin = chart.chart.width - chart.scales['x-axis-0'].right;
  const minGap = 10;
  const vpos_row1 = 25;
  const vpos_row2 = 50;
  
  let fontSize = 16;
  ctx.font = font(fontSize);

  let position;
  
  const locationDescr = parse_location_description(location, bothStops);
  const titleWidth = ctx.measureText(title).width;
  let locationWidth = calcLocationWidth(locationDescr, ctx);

  if ((leftMargin + titleWidth + minGap + locationWidth + rightMargin) > chart.chart.width) {
    // small screen: centered title stacks vertically
    ctx.textAlign = 'center';
    ctx.fillStyle = titleColor;
    ctx.fillText(title, chart.chart.width/2, vpos_row1);

    // Location info might be too long. Shrink the font until it fits.
    while (locationWidth > chart.chart.width && fontSize >= 8) {
      fontSize -= 1;
      ctx.font = font(fontSize);
      locationWidth = calcLocationWidth(locationDescr, ctx);
    }
    // we want centered, but have to write 1 word at a time bc colors, so...
    ctx.textAlign = 'left';
    position = chart.chart.width/2 - locationWidth/2;

    for (const [word, color] of locationDescr) {
      ctx.fillStyle = color;
      ctx.fillText(word, position, vpos_row2);
      position += ctx.measureText(word).width;
    }

  } else {
    // larger screen
    // Primary chart title goes left
    ctx.textAlign = 'left';
    ctx.fillStyle = titleColor;
    ctx.fillText(title, leftMargin, vpos_row2);

    // location components are aligned right
    ctx.textAlign = 'right';
    position = chart.chart.width - rightMargin;
    for (const [word, color] of locationDescr.reverse()) {
      ctx.fillStyle = color;
      ctx.fillText(word, position, vpos_row2);
      position -= ctx.measureText(word).width;
    }
  }
  ctx.restore();
};

export default drawTitle;
