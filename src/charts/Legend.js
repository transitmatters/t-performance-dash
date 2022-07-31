const onTimeStyle = {"backgroundColor": "#64b96a"};
const twentyFivePercentStyle = {"backgroundColor": "#f5ed00"};
const fiftyPercentStyle = {"backgroundColor": "#c33149"};
const oneHundredPercentStyle = {"backgroundColor": "#bb5cc1"};

function Legend() {
    return (
      <div className="legend">
        <p><span className="legend-dot" style={onTimeStyle}></span> On time</p>
        <p><span className="legend-dot" style={twentyFivePercentStyle}></span> {">25% longer than benchmark"}</p>
        <p><span className="legend-dot" style={fiftyPercentStyle}></span> {">50% longer than benchmark"}</p>
        <p><span className="legend-dot" style={oneHundredPercentStyle}></span> {">100% longer than benchmark"}</p>
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
