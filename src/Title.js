const get_line_color = (line) => {
  let line_color = 'grey';

  switch(line) {
    case 'Red':
      line_color = '#d13434';
      break;
    case 'Orange':
      line_color = '#e66f00';
      break;
    case 'Blue':
      line_color = '#0e3d8c';
      break;
    case 'Green':
      line_color = '#159765';
      break;
    default:
      break;
    }

  return line_color;
}

const parse_location_description = (location) => {
  var result = [];

  var line_color = get_line_color(location['line']);

  result.push([location['from'], line_color]);

  if (location['bothStops']) {
    result.push([' to ', 'grey']);
    result.push([location['to'], line_color]);
  } else {
    result.push([` ${location['direction']}`, 'grey']);
  }
  return result;
};

const drawTitle = (title, location, chart) => {
  var ctx = chart.chart.ctx;
  ctx.save();

  const left_buffer = 50;
  const midspace = 10;
  const vpos_row1 = 25;
  const vpos_row2 = 50;

  var position;

  var title_width = ctx.measureText(title).width;
  var location_width = parse_location_description(location)
      .map(x => ctx.measureText(x[0]).width)
      .reduce((a,b) => a + b, 0);

  if ((left_buffer + title_width + midspace + location_width) > chart.chart.width) {
    // small screen: centered title stacks vertically
    ctx.textAlign = 'center';
    ctx.fillStyle = 'grey';
    ctx.fillText(title, chart.chart.width/2, vpos_row1);

    ctx.textAlign = 'left';
    position = chart.chart.width/2 - location_width/2;

    for (const [word, color] of parse_location_description(location)) {
      ctx.fillStyle = color;
      ctx.fillText(word, position, vpos_row2);
      position += ctx.measureText(word).width;
    }

  } else {
    // larger screen
    // Primary chart title, grey and left
    ctx.textAlign = 'left';
    ctx.fillStyle = 'gray';
    ctx.fillText(title, left_buffer, vpos_row2);

    // location components are aligned right
    ctx.textAlign = 'right';
    position = chart.chart.width;
    for (const [word, color] of parse_location_description(location).reverse()) {
      ctx.fillStyle = color;
      ctx.fillText(word, position, vpos_row2);
      position -= ctx.measureText(word).width;
    }
  }
  ctx.restore();
}

export default drawTitle;
