import React from 'react';

export default function legend() {
    return (
      <div className="legend">
        <p><span className="legend-dot" style={{"backgroundColor": "#75c400"}}></span> On time</p>
        <p><span className="legend-dot" style={{"backgroundColor": "#e5a70b"}}></span> >25% longer than benchmark</p>
        <p><span className="legend-dot" style={{"backgroundColor": "#e53a0b"}}></span> >50% longer than benchmark</p>
        <p><span className="legend-line"></span> MBTA benchmark</p>
      </div>
    );
}