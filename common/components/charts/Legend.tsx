import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { CHART_COLORS } from '../../constants/colors';

interface LegendProps {
  showUnderRatio?: boolean;
  usingTmBenchmark?: boolean;
}

interface LegendLongTermProps {
  isTrendlineVisible: boolean;
  onToggleTrendline: () => void;
}

// The Commuter Rail data caveat lives once at the page level (BetaDataNotice),
// so it is intentionally not repeated inside every chart legend here.
export const LegendSingleDay: React.FC<LegendProps> = ({ showUnderRatio, usingTmBenchmark }) => {
  return (
    <div className="flex min-w-0 flex-col gap-y-1 text-muted-foreground">
      <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <LegendSingle showUnderRatio={showUnderRatio} usingTmBenchmark={usingTmBenchmark} />
      </div>
    </div>
  );
};

const SEVERITY_LEGEND = [
  { key: 'onTime', color: CHART_COLORS.GREEN },
  { key: 'off25', color: CHART_COLORS.YELLOW },
  { key: 'off50', color: CHART_COLORS.RED },
  { key: 'off100', color: CHART_COLORS.PURPLE },
] as const;

const LegendSingle: React.FC<LegendProps> = ({ usingTmBenchmark = false }) => {
  const { t } = useTranslation();
  return (
    <>
      <p className="flex flex-row items-center gap-x-1 italic">
        <Trans
          i18nKey={usingTmBenchmark ? 'charts.legend.compareToTm' : 'charts.legend.compareToMbta'}
          components={{
            line: (
              <span className="inline-block h-0 w-3 border-t-2 border-muted-foreground align-middle" />
            ),
          }}
        />
      </p>
      {SEVERITY_LEGEND.map(({ key, color }) => (
        <p key={key} className="flex flex-row items-center gap-x-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-foreground/25"
            style={{ backgroundColor: color }}
          />
          {t(`charts.legend.severity.${key}`)}
        </p>
      ))}
    </>
  );
};

export const LegendLongTerm: React.FC<LegendLongTermProps> = ({
  isTrendlineVisible,
  onToggleTrendline,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-row items-baseline gap-2 p-1 text-left text-xs text-muted-foreground sm:gap-4">
      <p>
        <span className={'mr-1 inline-block h-2.5 w-2.5 rounded-full bg-foreground'}></span>{' '}
        {t('charts.legend.median')}
      </p>
      <p>
        <span className={'mr-1 inline-block h-2.5 w-2.5 rounded-xs bg-muted-foreground/50'}></span>{' '}
        {t('charts.legend.interquartileRange')}
      </p>
      <button onClick={onToggleTrendline} className="flex items-center hover:opacity-80">
        <span
          className={`mr-1 inline-block h-2.5 w-2.5 border-2 border-dashed ${isTrendlineVisible ? `border-tm-red` : 'border-muted-foreground/50'}`}
        />
        {t('charts.legend.trendline')}
      </button>
    </div>
  );
};
