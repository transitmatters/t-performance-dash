import React from 'react';
import { CHART_COLORS } from '../../constants/colors';

interface LegendProps {
  showUnderRatio?: boolean;
}

interface LegendLongTermProps {
  isTrendlineVisible: boolean;
  onToggleTrendline: () => void;
}

// The Commuter Rail data caveat lives once at the page level (BetaDataNotice),
// so it is intentionally not repeated inside every chart legend here.
export const LegendSingleDay: React.FC<LegendProps> = ({ showUnderRatio }) => {
  return (
    <div className="flex min-w-0 flex-col gap-y-1 text-stone-600">
      <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <LegendSingle showUnderRatio={showUnderRatio} />
      </div>
    </div>
  );
};

const SEVERITY_LEGEND = [
  { label: 'On time', color: CHART_COLORS.GREEN },
  { label: '25%+ off', color: CHART_COLORS.YELLOW },
  { label: '50%+ off', color: CHART_COLORS.RED },
  { label: '100%+ off', color: CHART_COLORS.PURPLE },
];

const LegendSingle: React.FC<LegendProps> = () => {
  return (
    <>
      <p className="flex flex-row items-center gap-x-1 italic">
        Compare to
        <span className="inline-block h-0 w-3 border-t-2 border-[#bbb] align-middle" />
        MBTA benchmark:
      </p>
      {SEVERITY_LEGEND.map(({ label, color }) => (
        <p key={label} className="flex flex-row items-center gap-x-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-black/20"
            style={{ backgroundColor: color }}
          />
          {label}
        </p>
      ))}
    </>
  );
};

export const LegendLongTerm: React.FC<LegendLongTermProps> = ({
  isTrendlineVisible,
  onToggleTrendline,
}) => {
  return (
    <div className="flex w-full flex-row items-baseline gap-2 p-1 text-left text-xs sm:gap-4">
      <p>
        <span className={'mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[#000]'}></span> Median
      </p>
      <p>
        <span className={'mr-1 inline-block h-2.5 w-2.5 rounded-xs bg-[#C8CCD2]'}></span>{' '}
        Interquartile range
      </p>
      <button onClick={onToggleTrendline} className="flex items-center hover:opacity-80">
        <span
          className={`mr-1 inline-block h-2.5 w-2.5 border-2 border-dashed ${isTrendlineVisible ? `border-tm-red` : 'border-gray-300'}`}
        />
        Trendline
      </button>
    </div>
  );
};
