import React from 'react';

function Legend() {
    return (
      <div className="legend">
        <p><span className="legend-dot" style={{"backgroundColor": "#64b96a"}}></span> On time</p>
        <p><span className="legend-dot" style={{"backgroundColor": "#f5ed00"}}></span> >25% longer than benchmark</p>
        <p><span className="legend-dot" style={{"backgroundColor": "#c33149"}}></span> >50% longer than benchmark</p>
        <p><span className="legend-dot" style={{"backgroundColor": "#bb5cc1"}}></span> >100% longer than benchmark</p>
        <p><span className="legend-line"></span> MBTA benchmark</p>
      </div>
    );
}

function LegendLongTerm() {
  return (
    <div className="legend">
      <p><span className="legend-dot" style={{"backgroundColor": "black"}}></span> Median</p>
      <p><span className="legend-dot" style={{"backgroundColor": "#C8CCD2"}}></span> Interquartile range</p>
    </div>
  );
}

export {
  Legend,
  LegendLongTerm,
};
