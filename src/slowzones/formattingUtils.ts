import moment, { Moment } from "moment";
import { colorsForLine } from "../constants";
import { lookup_station_by_id } from "../stations";
import { Direction, SlowZone } from "./types";

const DAY_MS = 1000 * 60 * 60 * 24;

const capitalize = (s: string) => {
  return s && s[0].toUpperCase() + s.slice(1);
};

const getDashUrl = (d: any) => {
  let then: any = new Date(d.x);
  then.setDate(then.getDate() - 14); // two weeks of baseline for comparison
  then = then.toISOString().split("T")[0];

  let now: any = new Date(d.x2);
  now.setDate(now.getDate() + 14); // two weeks after for comparison.
  const today = new Date();
  if (today < now) {
    now = today;
  }
  now = now.toISOString().split("T")[0];

  return `https://dashboard.transitmatters.org/rapidtransit?config=${d.custom.color},${d.custom.fr_id},${d.custom.to_id},${then},${now}`;
};

const getDirection = (to: any, from: any) => {
  const toOrder = to.order;
  const fromOrder = from.order;
  return toOrder > fromOrder ? "southbound" : "northbound";
};

// Data formatting & cleanup
export const formatSlowZones = (data: any) =>
  data.map((x: any) => {
    const from = lookup_station_by_id(x.color, x.fr_id);
    const to = lookup_station_by_id(x.color, x.to_id);
    const direction = getDirection(to, from);
    return {
      start: moment(x.start),
      end: moment(x.end),
      from: from.stop_name,
      to: to.stop_name,
      uid: +x.id,
      id: from.stop_name + "-" + to.stop_name,
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

export const getRoutes = (data: SlowZone[]) => {
  const groupObj = groupByRoute(data);
  return Object.keys(groupObj);
};

// Xrange options
export const generateXrangeSeries = (data: any) => {
  const routes = getRoutes(data);
  const groupedByLine = groupByLine(data);
  return Object.entries(groupedByLine).map((line) => {
    const [name, data] = line;
    return {
      name: name,
      color: colorsForLine[line[0]],
      data: data.map((d) => ({
        x: d.start.utc().valueOf(),
        x2: d.end.utc().valueOf(),
        y: routes.indexOf(d.id),
        custom: { ...d },
      })),
      dataLabels: {
        enabled: true,
        // @ts-ignore
        formatter: function () {
          // @ts-ignore
          return `${this.point.custom.delay.toFixed(0)} s`;
        },
      },
    };
  });
};

export const generateXrangeOptions = (
  data: SlowZone[],
  direction: Direction
): any => ({
  chart: {
    type: "xrange",
  },
  credits: {
    enabled: false,
  },
  title: {
    text: `${capitalize(direction)} slow zones`,
  },
  xAxis: {
    type: "datetime",
    title: {
      text: "Date",
    },
  },
  legend: {
    enabled: false,
  },
  time: {
    timezone: "America/New_York",
  },
  yAxis: {
    type: "category",
    title: {
      text: "Line Segments",
    },
    categories: getRoutes(data),
    reversed: true,
  },
  plotOptions: {
    series: {
      cursor: "pointer",
      events: {
        click: function (event: any) {
          window.open(getDashUrl(event.point), "_blank");
        },
      },
      borderRadius: 0,
      borderWidth: 1,
      grouping: false,
      pointPadding: 0.15,
      groupPadding: 0,
      showInLegend: true,
      colorByPoint: false,
      animation: false,
    },
  },
  series: generateXrangeSeries(data),
});

// Line options
export const groupByLineDailyTotals = (data: any, selectedLines: string[]) => {
  const RED_LINE = data.map((day: any) => Number((day.Red / 60).toFixed(2)));
  const BLUE_LINE = data.map((day: any) => Number((day.Blue / 60).toFixed(2)));
  const ORANGE_LINE = data.map((day: any) =>
    Number((day.Orange / 60).toFixed(2))
  );
  return [
    selectedLines.includes("Red") && {
      name: "Red",
      color: colorsForLine["Red"],
      data: RED_LINE,
    },
    selectedLines.includes("Blue") && {
      name: "Blue",
      color: colorsForLine["Blue"],
      data: BLUE_LINE,
    },
    selectedLines.includes("Orange") && {
      name: "Orange",
      color: colorsForLine["Orange"],
      data: ORANGE_LINE,
    },
  ];
};

export const generateLineOptions = (
  data: SlowZone[],
  selectedLines: string[],
  startDate: Moment
): any => ({
  credits: { enabled: false },
  title: {
    text: `Slow zones`,
  },
  xAxis: {
    type: "datetime",
    title: { text: "Date" },
  },
  yAxis: {
    title: {
      text: "Slow time per day (minutes)",
    },
  },
  time: {
    timezone: "America/New_York",
  },
  series: groupByLineDailyTotals(data, selectedLines),
  plotOptions: {
    series: {
      pointStart: startDate.valueOf(),
      pointInterval: DAY_MS,
      animation: false,
    },
  },
  legend: {
    enabled: false,
  },
});
