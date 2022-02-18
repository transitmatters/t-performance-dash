import { colorsForLine } from "../constants";
import { lookup_station_by_id } from "../stations";
import { Direction, SlowZone } from "./types";

export const X_MIN = new Date(2021, 0, 0);
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
    // @ts-ignore
    const from = lookup_station_by_id(x.color, x.fr_id);
    // @ts-ignore
    const to = lookup_station_by_id(x.color, x.to_id);
    const direction = getDirection(to, from);
    return {
      start: new Date(x.start),
      end: new Date(x.end),
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
  data.reduce((series: any, sz: SlowZone) => {
    const key = sz.id;
    const s = (series[key] || []).concat(sz);
    series[key] = s;
    return series;
  }, {});

export const groupByLine = (data: SlowZone[]) =>
  data.reduce((series: any, sz: any) => {
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
  return Object.entries(groupedByLine).map((line: any) => {
    return {
      name: line[0],
      color: colorsForLine[line[0]],
      data: line[1].map((d: SlowZone) => ({
        x: Date.UTC(
          d.start.getUTCFullYear(),
          d.start.getUTCMonth(),
          d.start.getUTCDate()
        ),
        x2: Date.UTC(
          d.end.getUTCFullYear(),
          d.end.getUTCMonth(),
          d.end.getUTCDate()
        ),
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
  setChartView: Function,
  direction: Direction,
  setDirection: Function
): any => ({
  chart: {
    type: "xrange",
  },
  credits: {
    enabled: false,
  },
  title: {
    text: `${capitalize(direction)} Slow Zones`,
  },

  xAxis: {
    type: "datetime",
    title: {
      text: "Date",
    },
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
        // @ts-ignore
        click: function (event) {
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
    },
  },
  series: generateXrangeSeries(data),
  exporting: {
    scale: "1",
    width: "1500px",
    height: "1500px",
    buttons: {
      customButton: {
        text: "Regular View",
        onclick: function () {
          setChartView("line");
        },
      },
      button2: {
        text: "Change Direction",
        onclick: function () {
          setDirection(
            direction === "southbound" ? "northbound" : "southbound"
          );
        },
      },
    },
  },
});

// Line options
export const groupByLineDailyTotals = (data: any) => {
  const RED_LINE = data.map((day: any) => Number((day.Red / 60).toFixed(2)));
  const BLUE_LINE = data.map((day: any) => Number((day.Blue / 60).toFixed(2)));
  const ORANGE_LINE = data.map((day: any) => Number((day.Orange/60).toFixed(2)));
  return [
    { name: "Red", color: colorsForLine["Red"], data: RED_LINE },
    { name: "Blue", color: colorsForLine["Blue"], data: BLUE_LINE },
    { name: "Orange", color: colorsForLine["Orange"], data: ORANGE_LINE },
  ];
};

export const generateLineOptions = (
  data: SlowZone[],
  setChartView: Function
): any => ({
  title: {
    text: `Slow Zones`,
  },
  xAxis: { type: "datetime", title: { text: "Date" } },
  yAxis: {
    title: {
      text: "Slow Time Per Day (minutes)",
    },
  },
  series: groupByLineDailyTotals(data),
  plotOptions: {
    series: {
      pointStart: Date.UTC(
        2021,0,1
      ),
      pointInterval: DAY_MS,
    },
  },
  exporting: {
    buttons: {
      customButton: {
        text: "Detailed View",
        onclick: () => {
          setChartView("xrange");
        },
      },
    },
  },
});
