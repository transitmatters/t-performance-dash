import { useThemeStore } from '../../state/themeStore';
import { SEVERITY_COLORS } from '../../utils/chartTheme';
import type { SeverityTone } from '../../utils/chartTheme';
import { cn } from '../../utils/cn';

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
export const LegendSingleDay = ({ showUnderRatio, usingTmBenchmark }: LegendProps) => {
  return (
    <div className="flex min-w-0 flex-col gap-y-1 text-muted-foreground">
      <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <LegendSingle showUnderRatio={showUnderRatio} usingTmBenchmark={usingTmBenchmark} />
      </div>
    </div>
  );
};

const SEVERITY_LEGEND: { label: string; tone: SeverityTone }[] = [
  { label: 'On time', tone: 'onTime' },
  { label: '25%+ off', tone: 'off25' },
  { label: '50%+ off', tone: 'off50' },
  { label: '100%+ off', tone: 'off100' },
];

// The CSS twin of severityPointStyle, so the legend shows the shapes colorblind mode draws.
const SEVERITY_SWATCH_SHAPE: Record<SeverityTone, string> = {
  onTime: 'rounded-full',
  off25: '[clip-path:polygon(50%_0,100%_100%,0_100%)]',
  off50: 'rotate-45 scale-90',
  off100: '',
};

const LegendSingle = ({ usingTmBenchmark = false }: LegendProps) => {
  const colorblind = useThemeStore((state) => state.colorblind);
  return (
    <>
      <p className="flex flex-row items-center gap-x-1 italic">
        Compare to
        <span className="inline-block h-0 w-3 border-t-2 border-muted-foreground align-middle" />
        {usingTmBenchmark ? 'TransitMatters' : 'MBTA'} benchmark:
      </p>
      {SEVERITY_LEGEND.map(({ label, tone }) => (
        <p key={label} className="flex flex-row items-center gap-x-1.5">
          <span
            className={cn(
              'inline-block h-2.5 w-2.5',
              colorblind ? SEVERITY_SWATCH_SHAPE[tone] : 'rounded-full ring-1 ring-foreground/25'
            )}
            style={{ backgroundColor: SEVERITY_COLORS[tone] }}
          />
          {label}
        </p>
      ))}
    </>
  );
};

export const LegendLongTerm = ({ isTrendlineVisible, onToggleTrendline }: LegendLongTermProps) => {
  return (
    <div className="flex w-full flex-row items-baseline gap-2 p-1 text-left text-xs text-muted-foreground sm:gap-4">
      <p>
        <span className={'mr-1 inline-block h-2.5 w-2.5 rounded-full bg-foreground'}></span> Median
      </p>
      <p>
        <span className={'mr-1 inline-block h-2.5 w-2.5 rounded-xs bg-muted-foreground/50'}></span>{' '}
        Interquartile range
      </p>
      <button onClick={onToggleTrendline} className="flex items-center hover:opacity-80">
        <span
          className={`mr-1 inline-block h-2.5 w-2.5 border-2 border-dashed ${isTrendlineVisible ? `border-tm-red` : 'border-muted-foreground/50'}`}
        />
        Trendline
      </button>
    </div>
  );
};
