import classNames from "classnames";
import DatePicker from "../inputs/date";
import { optionsForSelect } from "./SlowZones";
import { ChartView, Direction } from "./types";
import { getDateThreeMonthsAgo, trainDateRange } from "../constants";
import moment, { Moment } from "moment";
import { useMemo } from "react";

interface SlowZoneNavProps {
  chartView: ChartView;
  setChartView: Function;
  direction: Direction;
  setDireciton: Function;
  selectedLines: string[];
  toggleLine: (value: string) => void;
  startDate: Moment;
  endDate: Moment;
  setStartDate: Function;
  setEndDate: Function;
}

const SlowZoneNav = ({
  chartView,
  setChartView,
  direction,
  selectedLines,
  toggleLine,
  setDireciton,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: SlowZoneNavProps) => {
  const getIsChecked = (value: string) => {
    return selectedLines.includes(value);
  };
  const clear = () => {
    setStartDate(getDateThreeMonthsAgo());
    setEndDate(moment().endOf("day"));
  };

  const startMoment = useMemo(() => startDate.format("YYYY-MM-DD"), [
    startDate,
  ]);
  const endMoment = useMemo(() => endDate.format("YYYY-MM-DD"), [endDate]);

  return (
    <div className="station-configuration-wrapper">
      <div className="slow-zone station-configuration main-column">
        <div className="line-toggle">
          <div className="option mode">
            {optionsForSelect().map((opt) => (
              <div
                key={opt.value}
                className={classNames("button-toggle", opt.value)}
              >
                <label>
                  <input
                    type="checkbox"
                    disabled={opt.disabled}
                    value={opt.value}
                    onChange={({ target: { value } }) => toggleLine(value)}
                    checked={getIsChecked(opt.value) && !opt.disabled}
                  />
                  <span>{opt.value}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="chart-toggle">
          <div className="option option-mode">
            <span className="switch-label">Total slow time</span>
            <label className="option switch">
              <input
                type="checkbox"
                checked={chartView === "xrange"}
                onChange={() => {
                  if (chartView === "line") {
                    setChartView("xrange");
                  } else {
                    setChartView("line");
                  }
                }}
              />
              <span className="slider"></span>
            </label>
            <span className="switch-label">Line segments</span>
          </div>
        </div>

        {chartView === "xrange" && (
          <div className="direction-toggle">
            <div className="option option-mode">
              <span className="switch-label">Southbound</span>
              <label className="option switch">
                <input
                  type="checkbox"
                  checked={direction === "northbound"}
                  onChange={() => {
                    if (direction === "northbound") setDireciton("southbound");
                    else {
                      setDireciton("northbound");
                    }
                  }}
                />
                <span className="slider"></span>
              </label>
              <span className="switch-label">Northbound</span>
            </div>
          </div>
        )}
        <div className="option option-date">
          <span className="date-label">Date</span>
          <DatePicker
            value={startMoment}
            onChange={setStartDate}
            options={{ maxDate: endMoment, minDate: trainDateRange.minDate }}
            maxDate={endMoment}
            placeholder="Select date..."
          />

          <span className="date-label end-date-label">to</span>
          <DatePicker
            value={endMoment}
            onChange={setEndDate}
            options={{ minDate: startMoment, maxDate: trainDateRange.maxDate }}
            placeholder="Select date..."
          />
          <button className="clear-button" onClick={clear}>
            🅧
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlowZoneNav;
