import React from 'react';

export default function legend_alerts() {
  return (
    <div className="legend">
      <p>
        <span className="legend-line"></span> No incident
        <span className="legend-line" style={{
          "backgroundColor": "#e53a0b",
          "marginLeft": "3px"
        }}></span> MBTA incident
      </p>
    </div>
  );
}