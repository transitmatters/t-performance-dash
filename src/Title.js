import { colorsForLine } from './constants.js';

const getLineColor = (lineName) => colorsForLine[lineName] || 'black';
const titleColor = 'gray';

const parse_location_description = (location, bothStops) => {
  let result = [];

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

const drawTitle = (title, location, bothStops, chart) => {
  let ctx = chart.chart.ctx;
  ctx.save();

  const leftMargin = 50;
  const rightMargin = 15;
  const minGap = 10;
  const vpos_row1 = 25;
  const vpos_row2 = 50;

  let position;

  const titleWidth = ctx.measureText(title).width;
  const locationWidth = parse_location_description(location, bothStops)
	  .map(x => ctx.measureText(x[0]).width)
	  .reduce((a,b) => a + b, 0);

  if ((leftMargin + titleWidth + minGap + locationWidth + rightMargin) > chart.chart.width) {
    // small screen: centered title stacks vertically
    ctx.textAlign = 'center';
    ctx.fillStyle = titleColor;
    ctx.fillText(title, chart.chart.width/2, vpos_row1);

    ctx.textAlign = 'left';
    position = chart.chart.width/2 - locationWidth/2;

    for (const [word, color] of parse_location_description(location, bothStops)) {
      ctx.fillStyle = color;
      ctx.fillText(word, position, vpos_row2);
      position += ctx.measureText(word).width;
    }

  } else {
    // larger screen
    // Primary chart title goes left left
    ctx.textAlign = 'left';
    ctx.fillStyle = titleColor;
    ctx.fillText(title, leftMargin, vpos_row2);

    // location components are aligned right
    ctx.textAlign = 'right';
    position = chart.chart.width - rightMargin;
    for (const [word, color] of parse_location_description(location, bothStops).reverse()) {
      ctx.fillStyle = color;
      ctx.fillText(word, position, vpos_row2);
      position -= ctx.measureText(word).width;
    }
  }
  ctx.restore();
};

export default drawTitle;
