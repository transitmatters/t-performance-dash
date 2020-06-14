import React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import LegendAlerts from './LegendAlerts';


function BoxSection(props) {

  return (
    <Tippy content={props.title}>
        <div style={
          {
            "width": `${props.width}%`,
            "height": "100%",
            "backgroundColor": props.color,
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
  const alerts = props.alerts;

  if (alerts === null || alerts === undefined) {
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

    boxes.push(<BoxSection title={tooltip} border={true} width={width} left={left_pos} color={"#e53a0b"} />);
  }

    return (
      <div className="alerts">
        <div className="alerts-bar-container">
          <div className="alerts-bar">
            {boxes}
          </div>
        </div>
          <LegendAlerts />
      </div>
    );
}