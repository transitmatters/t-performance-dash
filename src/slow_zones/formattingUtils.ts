import STATIONS from "./stations";
import ABBREVS from "./stop_abbreviations";
import { SlowZone } from "./types";

const colorsForLine: any = {
  Red: "#d13434",
  Orange: "#e66f00",
  Blue: "#0e3d8c",
  Green: "#159765",
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

  return `https://dashboard.transitmatters.org/rapidtransit?config=${d.color},${d.fr_id},${d.to_id},${then},${now}`;
};

export const formatSlowZones = (data: any) =>
  data.map((x: any) => {
    // @ts-ignore
    const from = STATIONS[x.color].find((st) =>
      [...st.stops.northbound, ...st.stops.southbound].includes("" + x.fr_id)
    ).stop_name;
    // @ts-ignore
    const to = STATIONS[x.color].find((st) =>
      [...st.stops.northbound, ...st.stops.southbound].includes("" + x.to_id)
    ).stop_name;

    return {
      start: new Date(x.start),
      end: new Date(x.end),
      from,
      to,
      uid: +x.id,
      id: from + "-" + to,
      delay: +x.delay,
      duration: +x.duration,
      //@ts-ignore
      fr_short: ABBREVS[from],
      //@ts-ignore
      to_short: ABBREVS[to],
      color: x.color,
      fr_id: x.fr_id,
      to_id: x.to_id,
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
  const groupObj: any = groupByRoute(data);
  return Object.keys(groupObj);
};

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
        ...d,
      })),
      dataLabels: {
        enabled: true,
        // @ts-ignore
        formatter: function () {
          // @ts-ignore
          return `${this.point.delay.toFixed(1)} s`;
        },
      },
    };
  });
};

const getMaxDate = (data: SlowZone[]) =>
  data.reduce((max: any, curr: any) => {
    if (
      curr.end.getTime() > max.end.getTime() ||
      curr.start.getTime() > max.end.getTime()
    ) {
      return curr;
    } else return max;
  });

const getNumberOfWeeks = (date1: Date, date2: Date) => {
  const WEEK = 1000 * 60 * 60 * 24 * 7;

  const date1ms = date1.getTime();
  const date2ms = date2.getTime();

  const diff = Math.abs(date2ms - date1ms);

  return Math.floor(diff / WEEK);
};

const groupByMonth = (data: SlowZone[], maxDate: any, minDate: any) => {
  const numberOfWeeks = getNumberOfWeeks(new Date(2021, 1, 1), maxDate.end);
  const dateMs = new Date(2021, 1, 1).getTime();
  const weekData = new Array(Math.ceil(numberOfWeeks));
  for (let x = 0; x <= numberOfWeeks; x++) {
    const weekStart = dateMs + 604800000 * x;
    const weekEnd = weekStart + 604800000;
    weekData[x] = data.reduce((prev, curr) => {
      if (
        curr.start.getTime() >= weekStart &&
        curr.start.getTime() <= weekEnd
      ) {
        return prev + Number(curr.delay.toFixed(1));
      } else if (
        curr.start.getTime() <= weekStart &&
        curr.end.getTime() >= weekEnd
      ) {
        return prev + Number(curr.delay.toFixed(1));
      }
      return prev;
    }, 0);
  }
  return weekData;
};

export const generateLineSeries = (data: any) => {
  const groupedByLine = groupByLine(data);
  const maxDate = getMaxDate(data);
  const minDate = new Date(2021, 1, 1);
  return Object.entries(groupedByLine).map((line: any) => {
    return {
      name: line[0],
      color: colorsForLine[line[0]],
      data: groupByMonth(line[1], maxDate, minDate),
    };
  });
};
export const generateXrangeOptions = (
  data: SlowZone[],
  setChartView: Function
): any => ({
  chart: {
    type: "xrange",
  },
  credits: {
    enabled: false,
  },
  title: {
    text: "Slow Zone Details",
  },
  xAxis: {
    type: "datetime",
    title: {
      text: "Date",
    },
  },

  yAxis: {
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
      pointWidth: "12",
    },
  },
  series: generateXrangeSeries(data),
  exporting: {
    buttons: {
      customButton: {
        text: "Regular View",
        onclick: function () {
          setChartView("line");
        },
      },
    },
  },
});

export const generateLineOptions = (
  data: SlowZone[],
  setChartView: Function
): any => ({
  title: {
    text: "Slow Zone Aggregation",
  },
  xAxis: { type: "datetime", title: { text: "Date" } },
  yAxis: {
    title: {
      text: "Slow Time Per Week (s)",
    },
  },
  series: generateLineSeries(data),
  plotOptions: {
    series: {
      pointStart: Date.UTC(2021, 1, 1),
      pointInterval: 604800000,
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
