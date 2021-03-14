import React from "react";
import './ProgressBar.css';

const ProgressBar = (props) => {
  const { progress } = props;
  if (!(progress >= 0 && progress < 100)) {
    return (null);
  }

  return (
    <div className="progress-bar" style={{
      width: `${progress}%`,
      backgroundColor: props.color || "grey",
      visibility: progress < 100 && "visible",
    }} />
  );
};

export default ProgressBar;
