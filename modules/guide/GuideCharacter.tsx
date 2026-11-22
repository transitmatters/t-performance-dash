import classNames from 'classnames';

interface GuideCharacterProps {
  /** The car's paint: the line on screen, so Dash rides whichever line you're looking at. */
  color: string;
  className?: string;
}

/**
 * Dash: the front of a subway car, with its eyes in the windshield. Drawn from rounded rectangles
 * rather than circles, which this design system keeps for stops and lines.
 */
export const GuideCharacter = ({ color, className }: GuideCharacterProps) => (
  <svg viewBox="0 0 48 56" aria-hidden className={classNames('tm-guide-character', className)}>
    {/* Wheels */}
    <rect x="11" y="48" width="9" height="5" rx="1.5" fill="#2e2d2c" />
    <rect x="28" y="48" width="9" height="5" rx="1.5" fill="#2e2d2c" />
    {/* Body */}
    <rect x="5" y="3" width="38" height="47" rx="11" fill={color} />
    {/* Destination sign */}
    <rect x="15" y="6.5" width="18" height="4" rx="2" fill="#fff" fillOpacity="0.55" />
    {/* Windshield */}
    <rect x="10" y="13" width="28" height="17" rx="5" fill="#fff" />
    {/* Eyes: they blink, unless motion is reduced */}
    <g className="tm-guide-eyes" fill="#2e2d2c">
      <rect x="17" y="16.5" width="4.5" height="8" rx="2.25" />
      <rect x="26.5" y="16.5" width="4.5" height="8" rx="2.25" />
    </g>
    {/* Headlights and smile */}
    <rect x="10" y="34" width="7" height="4" rx="2" fill="#fff" fillOpacity="0.9" />
    <rect x="31" y="34" width="7" height="4" rx="2" fill="#fff" fillOpacity="0.9" />
    <path d="M20 36.5q4 3.5 8 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    {/* Bumper */}
    <rect x="9" y="42.5" width="30" height="3" rx="1.5" fill="#000" fillOpacity="0.22" />
  </svg>
);
