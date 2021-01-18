import React from 'react';

function Legend() {
    return (
      <div className="legend">
        <p><span className="legend-dot" style={{"backgroundColor": "#75c400"}}></span> On time</p>
        <p><span className="legend-dot" style={{"backgroundColor": "#e5a70b"}}></span> >25% longer than benchmark</p>
        <p><span className="legend-dot" style={{"backgroundColor": "#e53a0b"}}></span> >50% longer than benchmark</p>
        <p><span className="legend-line"></span> MBTA benchmark</p>
      </div>
    );
}

function LegendLongTerm() {
  return (
    <div className="legend">
      <p><span className="legend-dot" style={{"backgroundColor": "#f4ef8b"}}></span> Interquartile range</p>
      <p><span className="legend-dot" style={{"backgroundColor": "black"}}></span> Median</p>
    </div>
  );
}

export {
  Legend,
  LegendLongTerm,
};
