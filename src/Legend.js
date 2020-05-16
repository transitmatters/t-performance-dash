import React from 'react';

export default function legend() {
    return (
      <div class="legend">
        <p><span className="legend-dot" style={{"background-color": "#75c400"}}></span> On time</p>
        <p><span className="legend-dot" style={{"background-color": "#e5a70b"}}></span> >25% longer than benchmark</p>
        <p><span className="legend-dot" style={{"background-color": "#e53a0b"}}></span> >50% longer than benchmark</p>
        <p><span className="legend-line"></span> MBTA benchmark</p>
      </div>
    );
}