import type { Chart } from 'chart.js';
import type { LineShort } from '../../types/lines';

export const colorsForLine: Record<LineShort, string> = {
  Red: '#da291c',
  Orange: '#ed8b00',
  Blue: '#003da5',
  Green: '#00834d',
  Bus: '#ffc72c',
};

const titleColor = 'gray';

function font(size_px = 16) {
  // This is the default from chartjs, but now we can adjust size.
  return `bold ${size_px}px "Helvetica Neue", "Helvetica", "Arial", sans-serif`;
}

export const drawSimpleTitle = (title: string, chart: Chart) => {
  const { ctx } = chart;
  ctx.save();

  const leftMargin = chart.scales.x.left;
  const rightMargin = chart.width - chart.scales.x.right;
  const minGap = 10;
  const vpos_row1 = 25;
  const vpos_row2 = 50;

  const fontSize = 16;
  ctx.font = font(fontSize);
  const titleWidth = ctx.measureText(title).width;

  if (leftMargin + titleWidth + minGap + rightMargin > chart.width) {
    // small screen: centered title stacks vertically
    ctx.textAlign = 'center';
    ctx.fillStyle = titleColor;
    ctx.fillText(title, chart.width / 2, vpos_row1);
  } else {
    // larger screen
    // Primary chart title goes left
    ctx.textAlign = 'left';
    ctx.fillStyle = titleColor;
    ctx.fillText(title, leftMargin, vpos_row2);
  }
  ctx.restore();
};
