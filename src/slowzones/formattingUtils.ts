import { SeriesOptionsType } from 'highcharts';
import moment, { Moment } from 'moment';
import { colorsForLine, majorEvents } from '../constants';
import { lookup_station_by_id } from '../stations';
import { Day, Direction, SlowZone } from './types';

const ua = window.navigator.userAgent;
const isMobile = /Android|webOS|iPhone|iPad|BlackBerry|IEMobile|Opera Mini/i.test(ua);
const textSize = isMobile ? '11' : '14';

const DAY_MS = 1000 * 60 * 60 * 24;

export const EMOJI = {
  derailment: ` 🚨`,
  construction: ` 🚧`,
  shutdown: ` ⚠️`,
};

const getFootnoteIcon = (start: Moment, end: Moment, color: string) => {
  if (color === 'Blue') return '';

  if (color === 'Red') {
    const event = majorEvents.RedDerailment;
    if (start.isBetween(moment(event.start), moment(event.end), undefined, '[]')) {
      return EMOJI.derailment;
    }
    return '';
  }
  if (color === 'Orange') {
    let event = majorEvents.OrangeDerailment;
    if (start.isBetween(moment(event.start), moment(event.end), undefined, '[]')) {
      return EMOJI.derailment;
    }
    event = majorEvents.OrangeShutdown;
    if (start.isBetween(moment(event.start), moment(event.end), undefined, '[]')) {
      return EMOJI.shutdown;
    }
    if (moment(event.start).isBetween(start, end)) {
      return EMOJI.construction;
    }
    return '';
  }
};

const capitalize = (s: string) => {
  return s && s[0].toUpperCase() + s.slice(1);
};

const getDashUrl = (d: any) => {
  const dateDiff = moment(d.custom.startDate).diff(d.x2, 'months');
  let then;
  if (dateDiff <= -18) {
    then = moment(d.x2).subtract(18, 'months').toISOString().split('T')[0];
  } else {
    then = new Date(d.custom.startDate);
    then.setDate(then.getDate() - 14); // two weeks of baseline for comparison
    then = then.toISOString().split('T')[0];
  }

  let now: any = new Date(d.x2);
  now.setDate(now.getDate() + 14); // two weeks after for comparison.
  const today = new Date();
  if (today < now) {
    now = today;
  }
  now = now.toISOString().split('T')[0];

  return `https://dashboard.transitmatters.org/rapidtransit?config=${d.custom.color},${d.custom.fr_id},${d.custom.to_id},${then},${now}`;
};

const getDirection = (to: any, from: any) => {
  const toOrder = to.order;
  const fromOrder = from.order;
  return toOrder > fromOrder ? 'southbound' : 'northbound';
};

// Data formatting & cleanup
export const formatSlowZones = (data: any) =>
  data.map((x: any) => {
    const from = lookup_station_by_id(x.color, x.fr_id);
    const to = lookup_station_by_id(x.color, x.to_id);
    const direction = getDirection(to, from);
    return {
      order: from.order,
      start: moment(x.start),
      end: moment(x.end),
      from: from.stop_name,
      to: to.stop_name,
      uid: +x.id,
      id: from.stop_name + '-' + to.stop_name,
      delay: +x.delay,
      duration: +x.duration,
      color: x.color,
      fr_id: x.fr_id,
      to_id: x.to_id,
      direction,
    };
  });

export const groupByRoute = (data: SlowZone[]) =>
  data.reduce((series: Record<string, SlowZone[]>, sz: SlowZone) => {
    const key = sz.id;
    const s = (series[key] || []).concat(sz);
    series[key] = s;
    return series;
  }, {});

export const groupByLine = (data: SlowZone[]) =>
  data.reduce((series: Record<string, SlowZone[]>, sz: any) => {
    const key = sz.color;
    const s = (series[key] || []).concat(sz);
    series[key] = s;
    return series;
  }, {});

export const getRoutes = (data: SlowZone[], direction: Direction) => {
  // group by line, sort by order , flatten, get ids, filter out duplicates
  const routes = Object.values(groupByLine(data))
    .map((sz: SlowZone[]) =>
      sz.sort((a, b) => (direction === 'southbound' ? a.order - b.order : b.order - a.order))
    )
    .flat()
    .map((sz: SlowZone) => sz.id);
  return [...new Set(routes)];
};

// Xrange options
export const generateXrangeSeries = (
  data: any,
  startDate: Moment,
  direciton: Direction
): SeriesOptionsType[] => {
  const routes = getRoutes(data, direciton);
  const groupedByLine = groupByLine(data);
  return Object.entries(groupedByLine).map((line) => {
    const [name, data] = line;
    return {
      name: name,
      color: colorsForLine[line[0]],
      type: 'xrange',
      data: data.map((d) => {
        return {
          x: d.start.isBefore(startDate) ? startDate.utc().valueOf() : d.start.utc().valueOf(),
          x2: d.end.utc().valueOf(),
          y: routes.indexOf(d.id),
          custom: {
            ...d,
            startDate: d.start.utc().valueOf(),
            tooltipFootnote: getFootnoteIcon(d.start, d.end, d.color),
          },
        };
      }),
      dataLabels: {
        enabled: true,
        formatter: function () {
          // @ts-expect-error appears that this is always undefined
          return `${this.point.custom.delay.toFixed(0)} s${this.point.custom.tooltipFootnote}`;
        },
      },
    };
  });
};

export const generateXrangeOptions = (
  data: SlowZone[],
  direction: Direction,
  startDate: Moment,
  endDate: Moment
): any => ({
  annotations: [
    {
      labels: [
        {
          point: 'red-derailment-start',
          text: 'Derailment',
        },
        {
          point: 'red-derailment-end',
          text: 'Signals restored',
        },
        {
          point: 'orange-derailment-start',
          text: 'Derailment',
        },
        {
          point: 'orange-derailment-end',
          text: 'Tracks restored',
        },
        {
          point: 'orange-shutdown-start',
          text: 'Shutdown',
        },
        {
          point: 'orange-shutdown-end',
          text: 'Service restored',
        },
      ],
    },
  ],
  chart: {
    type: 'xrange',
  },
  credits: {
    enabled: false,
  },
  title: {
    text: `${capitalize(direction)} slow zones`,
    style: {
      fontSize: '24px',
    },
  },
  xAxis: {
    type: 'datetime',
    title: {
      text: 'Date',
      style: {
        fontSize: textSize,
      },
    },
    labels: {
      style: {
        fontSize: textSize,
      },
    },
    min: startDate.valueOf(),
    max: endDate.valueOf(),
    dateTimeLabelFormats: {
      day: '%e %b',
      week: '%e %b',
    },
    plotLines: [
      {
        width: 2,
        zIndex: 5,
        value: moment().startOf('day').subtract(28, 'hours').valueOf(),
      },
      {
        color: colorsForLine.Orange,
        width: 2,
        dashStyle: 'Dot',
        zIndex: 3,
        value: moment.utc(majorEvents.OrangeShutdown.start).valueOf(),
        label: { text: 'Orange line shutdown', align: 'left', rotation: 0, y: -10 },
      },
      {
        color: colorsForLine.Orange,
        width: 2,
        dashStyle: 'Dot',
        zIndex: 3,
        value: moment.utc(majorEvents.OrangeShutdown.end).valueOf(),
      },
    ],
  },
  legend: {
    enabled: false,
  },
  yAxis: {
    type: 'category',
    title: {
      text: 'Line Segments',
      style: {
        fontSize: textSize,
      },
    },
    categories: getRoutes(data, direction),
    reversed: true,
    labels: {
      style: {
        fontSize: textSize,
      },
    },
  },
  tooltip: {
    formatter: function (this: any) {
      return (
        `<div><span style="font-size: 10px">` +
        `${moment(this.point.custom.startDate).utc().format('MMMM Do YYYY')} - ` +
        `${moment(this.point.x2).utc().format('MMMM Do YYYY')}` +
        `</span><br/> <span style="color:${this.point.color}">●</span> ${this.point.series.name}: <b>${this.point.yCategory}</b><br/></div>`
      );
    },
  },
  plotOptions: {
    series: {
      cursor: 'pointer',
      events: {
        click: function (event: any) {
          window.open(getDashUrl(event.point), '_blank');
        },
      },
      grouping: false,
      pointPadding: 0.15,
      groupPadding: 0,
      colorByPoint: false,
      animation: false,
    },
  },
  series: generateXrangeSeries(data, startDate, direction),
});

// Line options
export const groupByLineDailyTotals = (data: any, selectedLines: string[]) => {
  const RED_LINE = data.map((day: any) => {
    const y = Number((day.Red / 60).toFixed(2));
    if (majorEvents.RedDerailment.start === day.date) {
      return { id: 'red-derailment-start', y };
    }
    if (majorEvents.RedDerailment.end === day.date) {
      return { id: 'red-derailment-end', y };
    } else {
      return y;
    }
  });
  const BLUE_LINE = data.map((day: Day) => Number((day.Blue / 60).toFixed(2)));
  const ORANGE_LINE = data.map((day: Day) => {
    const y = Number((day.Orange / 60).toFixed(2));
    if (majorEvents.OrangeDerailment.start === day.date) {
      return { id: 'orange-derailment-start', y };
    }
    if (majorEvents.OrangeDerailment.end === day.date) {
      return { id: 'orange-derailment-end', y };
    }
    if (majorEvents.OrangeShutdown.start === day.date) {
      return { id: 'orange-shutdown-start', y };
    }
    if (majorEvents.OrangeShutdown.end === day.date) {
      return { id: 'orange-shutdown-end', y };
    } else {
      return y;
    }
  });
  return [
    selectedLines.includes('Red') && {
      name: 'Red',
      color: colorsForLine['Red'],
      data: RED_LINE,
    },
    selectedLines.includes('Blue') && {
      name: 'Blue',
      color: colorsForLine['Blue'],
      data: BLUE_LINE,
    },
    selectedLines.includes('Orange') && {
      name: 'Orange',
      color: colorsForLine['Orange'],
      data: ORANGE_LINE,
    },
  ];
};

export const generateLineOptions = (
  data: SlowZone[],
  selectedLines: string[],
  startDate: Moment,
  endDate: Moment
): any => ({
  exporting: {
    csv: {
      itemDelimiter: ';',
    },
  },
  credits: { enabled: false },
  title: {
    text: `Total delay from slow zones over time`,
    style: {
      fontSize: '24px',
    },
  },
  xAxis: {
    type: 'datetime',
    title: {
      text: 'Date',
      style: {
        fontSize: textSize,
      },
    },
    min: startDate.valueOf(),
    max: endDate.valueOf(),
    labels: {
      style: {
        fontSize: textSize,
      },
    },
    dateTimeLabelFormats: {
      day: '%e %b',
      week: '%e %b',
    },
  },
  yAxis: {
    title: {
      text: 'Amount of delay (minutes)',
      style: {
        fontSize: textSize,
      },
    },
    labels: {
      style: {
        fontSize: textSize,
      },
    },
    min: 0,
  },
  series: groupByLineDailyTotals(data, selectedLines),
  plotOptions: {
    series: {
      pointStart: startDate.valueOf(),
      pointInterval: DAY_MS,
      animation: false,
    },
  },
  tooltip: {
    formatter: function (this: any) {
      return `<div><span style="font-size: 10px">${moment
        .utc(this.point.x)
        .format('MMMM Do YYYY')}</span><br/> <span style="color:${this.point.color}">●</span> ${
        this.point.series.name
      }: <b>${this.point.y}</b><br/></div>`;
    },
  },
  legend: {
    enabled: false,
  },
  annotations: [
    {
      labels: [
        {
          point: 'red-derailment-start',
          text: 'Derailment',
        },
        {
          point: 'red-derailment-end',
          text: 'Signals restored',
        },
        {
          point: 'orange-derailment-start',
          text: 'Derailment',
        },
        {
          point: 'orange-derailment-end',
          text: 'Tracks restored',
        },
        {
          point: 'orange-shutdown-start',
          text: 'Shutdown',
        },
        {
          point: 'orange-shutdown-end',
          text: 'Service restored',
        },
      ],
    },
  ],
});
