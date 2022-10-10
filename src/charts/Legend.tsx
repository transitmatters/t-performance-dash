import './legend.css'
import React from 'react';

export const Legend: React.FC = () => {
    return (
      <div className="legend">
        <p><span className="legend-dot on-time"></span> On time</p>
        <p><span className="legend-dot twenty-five-percent"></span> {">25% longer than benchmark"}</p>
        <p><span className="legend-dot fifty-percent"></span> {">50% longer than benchmark"}</p>
        <p><span className="legend-dot hundred-percent"></span> {">100% longer than benchmark"}</p>
        <p><span className="legend-line"></span> MBTA benchmark</p>
      </div>
    );
}

export const LegendLongTerm: React.FC = () => {
  return (
    <div className="legend">
      <p><span className="legend-dot" style={{"backgroundColor": "black"}}></span> Median</p>
      <p><span className="legend-dot" style={{"backgroundColor": "#C8CCD2"}}></span> Interquartile range</p>
    </div>
  );
}
