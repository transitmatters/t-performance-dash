import React from 'react';
import classNames from 'classnames';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import LegendAlerts from './LegendAlerts';


function chartTimeframe(start_date) {
  // Set alert-bar interval to be 5:30am today to 1am tomorrow.
  const today = `${start_date}T00:00:00`;

  const low = new Date(today);
  low.setHours(5, 30);

  const high = new Date(today);
  high.setDate(high.getDate() + 1);
  high.setHours(1,0);

  return [low, high];
}


function BoxSection(props) {

  return (
    <Tippy content={props.title}>
      <div className="incident-section" style={
        {
          "width": `${props.width}%`,
          "height": "100%",
          "float": "left",
          "position": "absolute",
          "left": `${props.left}%`,
          "borderLeft": props.border && "0.1px solid white",
          "borderRight": props.border && "0.1px solid white",
        }
      }>
      </div>
    </Tippy>

  );
}

export default function AlertBar(props) {
  const { alerts, today, isLoading, isHidden } = props;


  const renderBoxes = () => {
    if (isLoading || !alerts) {
      return null;
    }

    const [start, end] = chartTimeframe(today);
    const duration = (end - start);


    const boxes = [];
    let idx = 0;
    for (const alert of alerts) {
      const alert_start = Math.max(start, new Date(alert.valid_from).getTime());
      const alert_end = Math.min(end, new Date(alert.valid_to).getTime());
      const width = (alert_end - alert_start) / duration * 100;

      const left_pos = (alert_start - start) / (duration) * 100;
      const tooltip = `${new Date(alert.valid_from).toLocaleTimeString('en-US')} - ${new Date(alert.valid_to).toLocaleTimeString('en-US')}\n${alert.text}`;

      boxes.push(<BoxSection title={tooltip} border={true} width={width} left={left_pos} key={idx} />);
      ++idx;
    }

    if (boxes.length > 0) {
      return boxes;
    }
    return <div>No MBTA incidents on this day.</div>
  }

  return (
    <div className={classNames('alerts-wrapper', isHidden && 'hidden')}>
      <div className="alerts main-column">
        <div className="alerts-bar">
          {isLoading && <div className="loading-text">Loading incidents...</div>}
          {renderBoxes()}
        </div>
        <LegendAlerts />
      </div>
    </div>
  );
}