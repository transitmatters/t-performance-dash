const get_line_color = (line) => {
  var line_color = 'grey';

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

  result.push([location['from'], line_color])

  if (location['bothStops']) {
    result.push([' to ', 'grey'])
    result.push([location['to'], line_color])
  } else {
    result.push([` ${location['direction']}`, 'grey'])
  }
  return result;
};

const drawTitle = (title, location, chart) => {
  var ctx = chart.chart.ctx;
  ctx.save();

  const left_buffer = 50;
  const vpos_row1 = 25;
  const vpos_row2 = 50;

  var title_width = ctx.measureText(title).width
  var location_width = parse_location_description(location).map(x => ctx.measureText(x[0]).width).reduce((a,b) => {return a+b;}, 0)

  if ((title_width + location_width + left_buffer) > chart.chart.width) {
    // small screen: centered title stacks vertically
    ctx.textAlign = 'center';
    ctx.fillStyle = 'grey';
    ctx.fillText(title, chart.chart.width/2, vpos_row1);

    ctx.textAlign = 'left';
    var position = chart.chart.width/2 - location_width/2;
    parse_location_description(location).forEach(
      tuple => {
        ctx.fillStyle = tuple[1];
        ctx.fillText(tuple[0], position, vpos_row2);
        position += ctx.measureText(tuple[0]).width;
      }
    )
  } else {
    // larger screen
    // Primary chart title, grey and left
    ctx.textAlign = 'left';
    ctx.fillStyle = 'gray';
    ctx.fillText(title, left_buffer, vpos_row2);

    // location components are aligned right
    ctx.textAlign = 'right';
    var position = chart.chart.width;
    parse_location_description(location).reverse().forEach(
      tuple => {
        ctx.fillStyle = tuple[1];
        ctx.fillText(tuple[0], position, vpos_row2);
        position -= ctx.measureText(tuple[0]).width;
      }
    )
  }
  ctx.restore();
}

export default drawTitle;
