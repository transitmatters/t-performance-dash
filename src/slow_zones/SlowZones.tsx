import { useEffect, useState } from "react";
import { ChartView, SlowZone } from "./types";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import xrange from "highcharts/modules/xrange";
import exporting from "highcharts/modules/exporting";

import {
  formatSlowZones,
  generateLineOptions,
  generateXrangeOptions,
} from "./formattingUtils";
import { APP_DATA_BASE_PATH } from "../App";
xrange(Highcharts);
exporting(Highcharts);

export const SlowZones = () => {
  const [options, setOptions] = useState<Highcharts.Options>();
  const [chartView, setChartView] = useState<ChartView>("line");
  const [data, setData] = useState();
  const xmin = new Date(2021, 1, 1);

  useEffect(() => {
    const url = new URL(
      `${APP_DATA_BASE_PATH}/static/slow-zones/all_slow.json`,
      window.location.origin
    );
    fetch(url.toString())
      .then((resp) => resp.json())
      .then((data) => setData(data));
  }, []);

  useEffect(() => {
    if (data) {
      const formattedData = formatSlowZones(data);
      const filteredData: any = formattedData.filter(
        (d: SlowZone) => d.start > xmin
      );
      const options =
        chartView === "line"
          ? generateLineOptions(filteredData, setChartView)
          : generateXrangeOptions(filteredData, setChartView);
      setOptions(options);
    }
  }, [data, chartView]);

  return (
    <HighchartsReact
      options={options}
      highcharts={Highcharts}
      immutable={true}
    />
  );
};
