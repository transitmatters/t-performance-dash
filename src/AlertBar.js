import React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import LegendAlerts from './LegendAlerts';


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
  const { alerts, isLoading } = props;


  const renderBoxes = () => {
    if (isLoading || !alerts) {
      return null;
    }

    const start = props.timeframe[0]?.getTime();
    const end = props.timeframe[1]?.getTime();
    const duration = (end - start);


    const boxes = [];
    for (const alert of alerts) {
      const alert_start = new Date(alert.valid_from).getTime();
      const alert_end = new Date(alert.valid_to).getTime();
      const width = (alert_end - alert_start) / duration * 100;

      const left_pos = (alert_start - start) / (duration) * 100;
      const tooltip = `${new Date(alert.valid_from).toLocaleTimeString('en-US')} - ${new Date(alert.valid_to).toLocaleTimeString('en-US')}\n${alert.text}`;

      boxes.push(<BoxSection title={tooltip} border={true} width={width} left={left_pos} />);
    }

    if (boxes.length > 0) {
      return boxes;
    }
    return <div>No MBTA incidents on this day.</div>
  }

  return (
    <div className="alerts-wrapper">
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