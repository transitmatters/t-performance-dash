import classNames from "classnames";
import { optionsForSelect } from "./SlowZones";
import { ChartView, Direction } from "./types";

interface SlowZoneNavProps {
  chartView: ChartView;
  setChartView: Function;
  direction: Direction;
  setDireciton: Function;
  selectedLines: string[];
  toggleLine: (value: string) => void;
}
const SlowZoneNav = ({
  chartView,
  setChartView,
  direction,
  selectedLines,
  toggleLine,
  setDireciton,
}: SlowZoneNavProps) => {
  const getIsChecked = (value: string) => {
    return selectedLines.includes(value);
  };
  return (
    <div className="station-configuration-wrapper">
      <div className="slow-zone station-configuration  main-column">
        <div className="line-toggle">
          <div className="option ">
            {optionsForSelect().map((opt, index) => (
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
            <span className="switch-label">Total Slow Time</span>
            <label className="option switch">
              <input
                type="checkbox"
                checked={chartView === "xrange"}
                onChange={() => {
                  if (chartView === "line") setChartView("xrange");
                  else {
                    setChartView("line");
                  }
                }}
              />
              <span className="slider"></span>
            </label>
            <span className="switch-label">Line Segments</span>
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
      </div>
    </div>
  );
};

export default SlowZoneNav;
