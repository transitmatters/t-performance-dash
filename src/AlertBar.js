import React from 'react';
import LegendAlerts from './LegendAlerts';

const BAR_STEPS = 200;

function BoxSection(props) {

  return (
    <div title={props.title} style={
      {
        "width": "0.5%",
        "height": "100%",
        "backgroundColor": props.color,
        "float": "left",
        "borderLeft": props.border && "0.1px solid white",
      }
    }></div>
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
  for(let i = 0; i < BAR_STEPS; i++) {
    const time_pos = ((i/BAR_STEPS) * duration + start);

    let found_alert = null;
    for (const alert of alerts) {
      const alert_start = new Date(alert.valid_from).getTime();
      const alert_end = new Date(alert.valid_to).getTime();
      if (time_pos > alert_start && time_pos < alert_end) {
        found_alert = alert;
      }
    }

    let color = "#8c8c8c";
    let tooltip = "";
    if (found_alert) {
      color = "#e53a0b";
      tooltip = `${new Date(found_alert.valid_from).toLocaleTimeString('en-US')} - ${new Date(found_alert.valid_to).toLocaleTimeString('en-US')}\n${found_alert.text}`;
    }

    const border = i > 0 && boxes[i - 1][1] !== found_alert;
    boxes.push([<BoxSection title={tooltip} border={border} color={color} />, found_alert]);
  }

    return (
      <div className="alerts">
        <div className="alerts-bar-container">
          <div className="alerts-bar">
            {boxes.map(x => x[0])}
          </div>
        </div>
          <LegendAlerts />
      </div>
    );
}