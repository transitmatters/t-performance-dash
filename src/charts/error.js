const errorMsg = "No data available. Try another stop or date.";
const txtColor = "gray";

function font(size_px=16) {
  return `bold ${size_px}px "Helvetica Neue", "Helvetica", "Arial", sans-serif`;
}

function writeError(chart) {
  const ctx = chart.chart.ctx;
  ctx.save();

  const xAxis = chart.scales['x-axis-0'];
  const yAxis = chart.scales['y-axis-0'];
  const centerX = (xAxis.left + xAxis.right) / 2;
  const centerY = (yAxis.bottom + yAxis.top) / 2;
  const maxWidth = (xAxis.right - xAxis.left);
  
  /* shrink font on smaller screens */
  let fontSize = 16;
  ctx.font = font(fontSize);
  while (ctx.measureText(errorMsg).width > maxWidth) {
    fontSize -= 1;
    ctx.font = font(fontSize);
  }

  ctx.fillStyle = txtColor;
  ctx.textAlign = 'center';
  ctx.fillText(errorMsg, centerX, centerY);

  ctx.restore();
}

export default writeError;