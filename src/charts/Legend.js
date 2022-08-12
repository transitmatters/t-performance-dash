import './legend.css'

function Legend() {
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
