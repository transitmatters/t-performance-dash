import classNames from 'classnames';
import { DatePicker } from '../inputs/date';
import { optionsForSelect } from './SlowZones';
import { ChartView, Direction } from './types';
import { getDateThreeMonthsAgo, trainDateRange } from '../constants';
import moment, { Moment } from 'moment';
import { useMemo } from 'react';

interface SlowZoneNavProps {
  chartView: ChartView;
  setChartView: (chartView: ChartView) => void;
  direction: Direction;
  setDireciton: (direction: Direction) => void;
  selectedLines: string[];
  toggleLine: (value: string) => void;
  startDate: Moment;
  endDate: Moment;
  setStartDate: (date: Date | string | Moment) => void;
  setEndDate: (date: Date | string | Moment) => void;
  params: URLSearchParams;
}

export const SlowZoneNav = ({
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
  params,
}: SlowZoneNavProps) => {
  const getIsChecked = (value: string) => {
    return selectedLines.includes(value);
  };
  const clear = () => {
    const threeMonthsAgo = getDateThreeMonthsAgo();
    setStartDate(threeMonthsAgo);
    params.set('startDate', threeMonthsAgo.format('YYYY-MM-DD'));
    const EOD = moment().endOf('day');
    params.set('endDate', EOD.format('YYYY-MM-DD'));
    setEndDate(EOD);
  };

  const startMoment = useMemo(() => startDate.format('YYYY-MM-DD'), [startDate]);
  const endMoment = useMemo(() => endDate.format('YYYY-MM-DD'), [endDate]);

  return (
    <div className="station-configuration-wrapper">
      <div className="slow-zone station-configuration main-column">
        <div className="line-toggle">
          <div className="option mode">
            {optionsForSelect().map((opt) => (
              <div key={opt.value} className={classNames('button-toggle', opt.value)}>
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
            <span className="switch-label slowzones-switch-label">Total slow time</span>
            <label className="option switch">
              <input
                type="checkbox"
                checked={chartView === 'xrange'}
                onChange={() => {
                  if (chartView === 'line') {
                    setChartView('xrange');
                    params.set('chartView', 'xrange');
                  } else {
                    setChartView('line');
                    params.set('chartView', 'line');
                  }
                }}
              />
              <span className="slider"></span>
            </label>
            <span className="switch-label slowzones-switch-label">Line segments</span>
          </div>
        </div>
        <div className="direction-toggle">
          <div
            className="option option-mode"
            style={{
              // Disable the northbound/southbound slider in "total slow time" mode
              opacity: chartView === 'xrange' ? 1.0 : 0.5,
              pointerEvents: chartView === 'xrange' ? 'auto' : 'none',
            }}
          >
            <span className="switch-label">Southbound</span>
            <label className="option switch">
              <input
                type="checkbox"
                checked={direction === 'northbound'}
                onChange={() => {
                  if (direction === 'northbound') {
                    setDireciton('southbound');
                    params.set('direction', 'southbound');
                  } else {
                    setDireciton('northbound');
                    params.set('direction', 'northbound');
                  }
                }}
              />
              <span className="slider"></span>
            </label>
            <span className="switch-label">Northbound</span>
          </div>
        </div>
        <div className="option option-date">
          <span className="date-label">Date</span>
          <DatePicker
            value={startMoment}
            onChange={setStartDate}
            options={{ maxDate: endMoment, minDate: trainDateRange.minDate }}
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
