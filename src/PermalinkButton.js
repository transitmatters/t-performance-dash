import React from 'react';

export default function PermalinkButton() {

  const copy = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <span>
      <button onClick={copy}>Copy permalink</button>
    </span>
  );
}