import { useEffect, useMemo, useState } from 'react';
import { ChartView, Direction, SlowZone } from './types';
import { Link, useHistory, useLocation } from 'react-router-dom';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import xrange from 'highcharts/modules/xrange';
import exporting from 'highcharts/modules/exporting';
import annotations from 'highcharts/modules/annotations';
import { formatSlowZones, generateLineOptions, generateXrangeOptions, EMOJI } from './formattingUtils';
import { goatcount } from '../analytics';
import { getDateThreeMonthsAgo } from '../constants';
import { SlowZoneNav } from './SlowZoneNav';
import { line_name, subway_lines } from '../stations';
import moment from 'moment';

xrange(Highcharts);
exporting(Highcharts);
annotations(Highcharts);

export const optionsForSelect = () => {
  const lines = subway_lines();
  return lines.map((line) => {
    return {
      value: line,
      label: line_name(line),
      disabled: line_name(line) === 'Green Line',
    };
  });
};

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

export const SlowZones = () => {
  document.title = 'Data Dashboard - Slow zones';
  const params = useQuery();
  const history = useHistory();
  const [options, setOptions] = useState<Highcharts.Options>();
  const [chartView, setChartView] = useState<ChartView>(
    (params.get('chartView') as ChartView) || 'line'
  );
  const [direction, setDirection] = useState<Direction>(
    (params.get('direction') as Direction) || 'southbound'
  );
  const [selectedLines, setSelectedLines] = useState<any[]>(
    params.get('selectedLines')?.split(',') || ['Red', 'Orange', 'Blue']
  );
  const [totalDelays, setTotalDelays] = useState<any>();
  const [allSlow, setAllSlow] = useState<any>();
  const [startDate, setStartDate] = useState(() => {
    if (params.get('startDate')) {
      return moment.utc(params.get('startDate'));
    } else return getDateThreeMonthsAgo();
  });
  const [endDate, setEndDate] = useState(() => {
    if (params.get('endDate')) {
      return moment.utc(params.get('endDate'));
    } else return moment();
  });

  const setTotalDelaysOptions = (data: any) => {
    const filteredData = data.filter((d: any) => {
      return moment.utc(d.date).isBetween(startDate, endDate, undefined, '[]');
    });
    const options = generateLineOptions(filteredData, selectedLines, startDate, endDate);
    setOptions(options);
  };

  const setAllSlowOptions = (data: any) => {
    const formattedData = formatSlowZones(data);
    const filteredData = formattedData.filter(
      (d: SlowZone) =>
        (d.start.isBetween(startDate, endDate, undefined, '[]') ||
          d.end.isBetween(startDate, endDate, undefined, '[]') ||
          (d.start.isBefore(startDate) && d.end.isAfter(endDate))) &&
        selectedLines.includes(d.color) &&
        d.direction === direction
    );

    const options = generateXrangeOptions(filteredData, direction, startDate, endDate);
    setOptions(options);
  };

  useEffect(() => {
    history.replace({ search: params.toString() });

    goatcount();

    if (chartView === 'line') {
      if (totalDelays) {
        // We only want to fetch each dataset once
        setTotalDelaysOptions(totalDelays);
      } else {
        const url = new URL(`/static/slowzones/delay_totals.json`, window.location.origin);
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
        const url = new URL(`/static/slowzones/all_slow.json`, window.location.origin);
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
      params.set('selectedLines', filteredLines.join(','));
    } else {
      const lines = [...selectedLines, line];
      setSelectedLines(lines);
      params.set('selectedLines', lines.join(','));
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
          setStartDate(moment.utc(date));
          params.set('startDate', date);
        }}
        setEndDate={(date: any) => {
          setEndDate(moment.utc(date));
          params.set('endDate', date);
        }}
        params={params}
      />
      {options && (
        <HighchartsReact
          containerProps={{
            style: { 'min-height': '83vh', paddingTop: '1em' },
          }}
          options={options}
          highcharts={Highcharts}
          immutable={true}
        />
      )}
      {chartView === 'xrange' && (
        <div className="event-footer">
          <span className="event-footer-text">{`${EMOJI.derailment} = Affected by a derailment`}</span>
          <span className="event-footer-text">{`${EMOJI.construction} = To be fixed by shutdown`}</span>
          <span className="event-footer-text">{`${EMOJI.shutdown} = Began after shutdown`}</span>
        </div>
      )}

      <div className="accordion">
        <li className="accordion-item" id="what-is-this">
          <a className="accordion-item-header" href="#what-is-this">
            What is this?
          </a>
          <div className="accordion-text">
            <p>
              This is a tool to help find and track slow zones. That is, areas where trains have
              lower-than-usual speeds due to track conditions, signal issues, or other
              infrastructure problems.
            </p>
          </div>
        </li>
        <li className="accordion-item" id="how-do-we-calculate-this">
          <a className="accordion-item-header" href="#how-do-we-calculate-this">
            How do we calculate this?
          </a>
          <div className="accordion-text">
            <p>
              We look at the daily median travel time + dwell time for each segment along a route.
              Whenever that trip time is at least 10% slower than the baseline for 4 or more days in
              a row, it gets flagged as a slow zone. Currently, our baseline is the median value in
              our data, which goes back to 2016. It’s not a perfect system: you may find some
              anomalies, but we think it works pretty well.
            </p>
          </div>
        </li>
        <li className="accordion-item" id="what-does-the-line-graph-mean">
          <a className="accordion-item-header" href="#what-does-the-line-graph-mean">
            What does the line graph mean?
          </a>
          <div className="accordion-text">
            <p>
              The line graph sums all the slow zone delays by color. In other words, it shows the
              amount of delay time due to slow zones on one round trip of each route. The numbers
              are approximate due to averaging.
            </p>
          </div>
        </li>
        <li className="accordion-item" id="how-did-we-build-this">
          <a className="accordion-item-header" href="#how-did-we-build-this">
            How did we build this?
          </a>
          <div className="accordion-text">
            <p>
              ReactJS + HighchartsJS and Highcharts Gantt from
              <a href="highcharts.com"> Highcharts</a> <br />
              See our <Link to="/opensource"> Attribution</Link> page for more information.
            </p>
          </div>
        </li>
        <li className="accordion-item" id="why-did-we-build-this">
          <a className="accordion-item-header" href="#why-did-we-build-this">
            Why did we build this?
          </a>
          <div className="accordion-text">
            <p>
              There’s power in data, but it’s only useful when you can tell a story. Slow zones are
              a nice story to tell: they tie our observable results to a cause. With so much data
              available, it can be difficult to find the interesting bits. So we’ve built this tool
              to help us locate and track this type of issue (slow zones), and monitor the severity
              over time.
            </p>
          </div>
        </li>
        <li className="accordion-item" id="how-can-you-use-this">
          <a className="accordion-item-header" href="#how-can-you-use-this">
            How can you use this?
          </a>
          <div className="accordion-text">
            <p>
              Share it. Bring the data to public meetings. Pressure the T to do better, but also
              give them credit where it’s due.
            </p>
          </div>
        </li>
        <li className="accordion-item" id="green-line">
          <a className="accordion-item-header" href="#green-line">
            What about the Green Line?
          </a>
          <div className="accordion-text">
            <p>
              Due to variable traffic, much of the Green Line doesn’t have consistent enough trip
              times to measure. As for the main trunk and the D line? Coming “soon”.
            </p>
          </div>
        </li>
      </div>
    </>
  );
};
