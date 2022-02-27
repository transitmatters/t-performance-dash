import { useEffect, useRef, useState } from "react";
import { ChartView, Direction, SlowZone } from "./types";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import xrange from "highcharts/modules/xrange";
import exporting from "highcharts/modules/exporting";

import {
  formatSlowZones,
  generateLineOptions,
  generateXrangeOptions,
  X_MIN,
} from "./formattingUtils";
import SlowZoneNav from "./SlowZoneNav";
import { line_name, subway_lines } from "../stations";
xrange(Highcharts);
exporting(Highcharts);

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

export const SlowZones = () => {
  const [options, setOptions] = useState<Highcharts.Options>();
  const [chartView, setChartView] = useState<ChartView>("line");
  const [direction, setDirection] = useState<Direction>("southbound");
  const [selectedLines, setSelectedLines] = useState<any[]>([
    "Red",
    "Orange",
    "Blue",
  ]);
  const [totalDelays, setTotalDelays] = useState<any>();
  const [allSlow, setAllSlow] = useState<any>();

  const setTotalDelaysOptions = (data: any) => {
    const filteredData = data.filter((d: any) => new Date(d.date) > X_MIN);
    const options = generateLineOptions(filteredData, selectedLines);
    setOptions(options);
  };

  const setAllSlowOptions = (data: any) => {
    const formattedData = formatSlowZones(data);
    const filteredData = formattedData.filter(
      (d: SlowZone) =>
        d.start > X_MIN &&
        selectedLines.includes(d.color) &&
        d.direction === direction
    );

    const options = generateXrangeOptions(filteredData, direction);
    setOptions(options);
  };

  useEffect(() => {
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
  }, [chartView, direction, selectedLines]);

  const toggleLine = (line: string) => {
    if (selectedLines.includes(line)) {
      setSelectedLines(selectedLines.filter((value) => value !== line));
    } else {
      setSelectedLines([...selectedLines, line]);
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
      />
      {options && (
        <HighchartsReact
          containerProps={{ style: { height: "75vh", paddingTop: "5px" } }}
          options={options}
          highcharts={Highcharts}
          immutable={true}
        />
      )}
    </>
  );
};
