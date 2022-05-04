import { useEffect, useMemo, useState } from "react";
import { ChartView, Direction, SlowZone } from "./types";
import { useHistory, useLocation } from "react-router-dom";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import xrange from "highcharts/modules/xrange";
import exporting from "highcharts/modules/exporting";
import annotations from "highcharts/modules/annotations";
import {
  formatSlowZones,
  generateLineOptions,
  generateXrangeOptions,
} from "./formattingUtils";
import SlowZoneNav from "./SlowZoneNav";
import { line_name, subway_lines } from "../stations";
import { getDateThreeMonthsAgo } from "../constants";
import moment from "moment";

xrange(Highcharts);
exporting(Highcharts);
annotations(Highcharts);

export const optionsForSelect = () => {
  const lines = subway_lines();
  return lines.map((line) => {
    return {
      value: line,
      label: line_name(line),
      disabled: line_name(line) === "Green Line",
    };
  });
};

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

export const SlowZones = () => {
  const params = useQuery();
  const history = useHistory();
  const [options, setOptions] = useState<Highcharts.Options>();
  const [chartView, setChartView] = useState<ChartView>(
    (params.get("chartView") as ChartView) || "line"
  );
  const [direction, setDirection] = useState<Direction>(
    (params.get("direction") as Direction) || "southbound"
  );
  const [selectedLines, setSelectedLines] = useState<any[]>(
    params.get("selectedLines")?.split(",") || ["Red", "Orange", "Blue"]
  );
  const [totalDelays, setTotalDelays] = useState<any>();
  const [allSlow, setAllSlow] = useState<any>();
  const [startDate, setStartDate] = useState(() => {
    if (params.get("startDate")) {
      return moment(params.get("startDate"));
    } else return getDateThreeMonthsAgo();
  });
  const [endDate, setEndDate] = useState(() => {
    if (params.get("endDate")) {
      return moment(params.get("endDate"));
    } else return moment();
  });

  const setTotalDelaysOptions = (data: any) => {
    const filteredData = data.filter((d: any) => {
      return moment(d.date)
        .add(5, "hours")
        .isBetween(startDate, endDate, undefined, "[]");
    });
    const options = generateLineOptions(filteredData, selectedLines, startDate);
    setOptions(options);
  };

  const setAllSlowOptions = (data: any) => {
    const formattedData = formatSlowZones(data);
    const filteredData = formattedData.filter(
      (d: SlowZone) =>
        (d.start.isBetween(startDate, endDate, undefined, "[]") ||
          d.end.isBetween(startDate, endDate, undefined, "[]") ||
          (d.start.isBefore(startDate) && d.end.isAfter(endDate))) &&
        selectedLines.includes(d.color) &&
        d.direction === direction
    );

    const options = generateXrangeOptions(filteredData, direction, startDate);
    setOptions(options);
  };

  useEffect(() => {
    history.replace({ search: params.toString() });

    if (chartView === "line") {
      if (totalDelays) {
        // We only want to fetch each dataset once
        setTotalDelaysOptions(totalDelays);
      } else {
        const url = new URL(
          `/static/slowzones/delay_totals.json`,
          window.location.origin
        );
        fetch(url.toString())
          .then((resp) => resp.json())
          .then((data) => {
            setTotalDelays(data);
            setTotalDelaysOptions(data);
          });
      }
    } else {
      if (allSlow) {
        setAllSlowOptions(allSlow);
      } else {
        const url = new URL(
          `/static/slowzones/all_slow.json`,
          window.location.origin
        );
        fetch(url.toString())
          .then((resp) => resp.json())
          .then((data) => {
            setAllSlow(data);
            setAllSlowOptions(data);
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartView, direction, selectedLines, startDate, endDate]);

  const toggleLine = (line: string) => {
    if (selectedLines.includes(line)) {
      const filteredLines = selectedLines.filter((value) => value !== line);
      setSelectedLines(filteredLines);
      params.set("selectedLines", filteredLines.join(","));
    } else {
      const lines = [...selectedLines, line];
      setSelectedLines(lines);
      params.set("selectedLines", lines.join(","));
    }
  };

  return (
    <>
      <SlowZoneNav
        chartView={chartView}
        setChartView={setChartView}
        direction={direction}
        setDireciton={setDirection}
        selectedLines={selectedLines}
        toggleLine={toggleLine}
        startDate={startDate}
        endDate={endDate}
        setStartDate={(date: any) => {
          setStartDate(moment(date));
          params.set("startDate", date);
        }}
        setEndDate={(date: any) => {
          setEndDate(moment(date));
          params.set("endDate", date);
        }}
        params={params}
      />
      {options && (
        <HighchartsReact
          containerProps={{
            style: { "min-height": "83vh", paddingTop: "1em" },
          }}
          options={options}
          highcharts={Highcharts}
          immutable={true}
        />
      )}
      {chartView === "xrange" && (
        <div className="derailment-footer">
          <img
            aria-label="Warning emoji"
            height="25px"
            width="25px"
            src="warning-emoji.png"
          />
          <span className="derailment-footer-text">
            = Affected by a derailment
          </span>
        </div>
      )}

      <div className="faq">
        <div className="faq-title">F.A.Q</div>
        <hr className="faq-hr"></hr>

        <div className="faq-content">
          <div className="faq-question">
            <input id="q1" type="checkbox" className="panel" />
            <div className="plus">+</div>
            <label htmlFor="q1" className="panel-title">
              What is this?
            </label>
            <div className="panel-content">
              This is a tool to help find and track slow zones. That is, areas
              where trains have lower-than-usual speeds due to track conditions,
              signal issues, or other infrastructure problems.
            </div>
          </div>

          <div className="faq-question">
            <input id="q2" type="checkbox" className="panel" />
            <div className="plus">+</div>
            <label htmlFor="q2" className="panel-title">
              How do we calculate this?
            </label>
            <div className="panel-content">
              We look at the daily median travel time + dwell time for each
              segment along a route. Whenever that trip time is at least 10%
              slower than the baseline for 3 or more days in a row, it gets
              flagged as a slow zone. Currently, our baseline is the median
              value in our data, which goes back to 2016. It’s not a perfect
              system, but various algorithmic improvements are in the works.
            </div>
          </div>

          <div className="faq-question">
            <input id="q3" type="checkbox" className="panel" />
            <div className="plus">+</div>
            <label htmlFor="q3" className="panel-title">
              Why did we build this?
            </label>
            <div className="panel-content">
              There’s power in data, but it’s only useful when you can tell a
              story. Slow zones are a nice story to tell: they tie our
              observable results to a cause. With so much data available, it can
              be difficult to find the interesting bits. So we’ve built this
              tool to help us locate and track this type of issue (slow zones),
              and monitor the severity over time.
            </div>
          </div>
          <div className="faq-question">
            <input id="q4" type="checkbox" className="panel" />
            <div className="plus">+</div>
            <label htmlFor="q4" className="panel-title">
              How can you use this?
            </label>
            <div className="panel-content">
              Share it. Bring the data to public meetings. Pressure the T to do
              better, but also give them credit where it’s due.
            </div>
          </div>
          <div className="faq-question">
            <input id="q5" type="checkbox" className="panel" />
            <div className="plus">+</div>
            <label htmlFor="q5" className="panel-title">
              What about the Green Line?
            </label>
            <div className="panel-content">
              Due to variable traffic, much of the Green Line doesn’t have
              consistent enough trip times to measure. As for the main trunk and
              the D line? Coming “soon”.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
