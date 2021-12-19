const writeError = (chart) => {
  const ctx = chart.chart.ctx;
  ctx.save();

  ctx.font = `16px bold "Helvetica Neue", "Helvetica", "Arial", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText("No data available. Try another stop/date.",
               chart.chart.width / 2,
               chart.chart.height / 2);

  ctx.restore();

}

export default writeError;