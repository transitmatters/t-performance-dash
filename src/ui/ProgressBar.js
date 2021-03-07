import React from "react";
import './ProgressBar.css';

const ProgressBar = (props) => {
  const { rate } = props;
  const [progress, setProgress] = React.useState(0);

  if (rate === null) {
    return (null);
  }

  setTimeout(() => {
    if (progress < 100) {
      // This trips a re-render, so you get the future for free.
      setProgress(progress + rate);
    }
  }, 1000);

  return (
    <div className="progress-bar" style={{
      width: `${progress}%`,
      backgroundColor: props.color || "grey",
      visibility: progress < 100 && "visible",
    }} />
  );
};

export default ProgressBar;
