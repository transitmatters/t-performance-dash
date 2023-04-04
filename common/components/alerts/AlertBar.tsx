import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Tippy from '@tippyjs/react';
import type { OldAlert } from '../../types/alerts';
import { LegendAlerts } from './LegendAlerts';
import { findMatch } from './AlertFilter';
import 'tippy.js/dist/tippy.css'; // optional

function chartTimeframe(start_date: string) {
  // Set alert-bar interval to be 5:30am today to 1am tomorrow.
  const today = `${start_date}T00:00:00`;

  const low = new Date(today);
  low.setHours(5, 30);

  const high = new Date(today);
  high.setDate(high.getDate() + 1);
  high.setHours(1, 0);

  return [low, high];
}

interface BoxSectionProps {
  title: string;
  width: number;
  left: number;
  border: boolean;
}

const BoxSection: React.FC<BoxSectionProps> = ({ title, width, left, border }) => {
  const toBorderOrNotToBorder = border ? '0.1px solid white' : undefined;

  // TODO: Make this work. next.js seems to be getting in the way
  return (
    <Tippy content={title}>
      <div
        className="incident-section"
        style={{
          width: `${width}%`,
          height: '100%',
          float: 'left',
          position: 'absolute',
          left: `${left}%`,
          borderLeft: toBorderOrNotToBorder,
          borderRight: toBorderOrNotToBorder,
        }}
      ></div>
    </Tippy>
  );
};
interface AlertBarProps {
  alerts: OldAlert[];
  today: string;
  isLoading: boolean;
  isHidden?: boolean;
}

export const AlertBar: React.FC<AlertBarProps> = ({
  alerts,
  today,
  isLoading,
  isHidden = false,
}) => {
  const renderBoxes = () => {
    if (isLoading) {
      return null;
    }

    if (!alerts) {
      return <div>Unable to retrieve this day's MBTA incidents.</div>;
    }
    const recognized_alerts = alerts?.filter(findMatch);

    const [start, end] = chartTimeframe(today);
    const duration = end.getTime() - start.getTime();

    const boxes: ReactElement[] = [];
    let idx = 0;
    for (const alert of recognized_alerts) {
      const alert_start = Math.max(start.getTime(), new Date(alert.valid_from).getTime());
      const alert_end = Math.min(end.getTime(), new Date(alert.valid_to).getTime());
      const width = ((alert_end - alert_start) / duration) * 100;

      const left_pos = ((alert_start - start.getTime()) / duration) * 100;
      const tooltip =
        `${new Date(alert.valid_from).toLocaleTimeString('en-US')}` +
        ` - ${new Date(alert.valid_to).toLocaleTimeString('en-US')}\n${alert.text}`;

      boxes.push(
        <BoxSection title={tooltip} border={true} width={width} left={left_pos} key={idx} />
      );
      ++idx;
    }

    if (boxes.length > 0) {
      return boxes;
    }
    return <div>No MBTA incidents on this day.</div>;
  };

  return (
    <div className={classNames('alerts-wrapper', isHidden && 'hidden')}>
      <div className="alerts main-column">
        <div className="alerts-bar">
          {isLoading && <div className="loading-text">Loading incidents...</div>}
          {renderBoxes()}
        </div>
        <LegendAlerts />
      </div>
    </div>
  );
};
