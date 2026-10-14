import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../common/components/ui/table';
import type { CommuterRailRoute } from '../../../common/types/lines';
import { COMMUTER_RAIL_LINE_NAMES } from '../../../common/types/lines';
import type { CrScorecardEntry } from '../../../common/types/dataPoints';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { cn } from '../../../common/utils/cn';
import {
  SPAN_HOURS,
  TONE_CHIP,
  clockFaceTone,
  formatCount,
  formatMinutes,
  formatShare,
  getScorecardStats,
  hoursTone,
  waitTone,
} from './utils';
import type { Tone } from './utils';

const Toned: React.FC<{
  value: number | undefined;
  tone: (value: number) => Tone;
  children: React.ReactNode;
}> = ({ value, tone, children }) => (
  <TableCell className="text-right tabular-nums">
    <span className={cn('rounded-md px-1.5 py-0.5', value != null && TONE_CHIP[tone(value)])}>
      {children}
    </span>
  </TableCell>
);

const Swatch: React.FC<{ tone: Tone; children: React.ReactNode }> = ({ tone, children }) => (
  <span className={cn('rounded-md px-1 py-0.5 font-medium', TONE_CHIP[tone])}>{children}</span>
);

interface ScorecardTableProps {
  data: CrScorecardEntry[];
}

/** Every line side by side, closest to Regional Rail first. */
export const ScorecardTable: React.FC<ScorecardTableProps> = ({ data }) => {
  const { t } = useTranslation('service');
  const rows = data
    // Lines the dashboard knows about; leaves out event-only service like Foxboro
    .filter((entry) => entry.routeId && entry.routeId in COMMUTER_RAIL_LINE_NAMES)
    .map((entry) => ({
      routeId: entry.routeId as CommuterRailRoute,
      ...getScorecardStats([entry]),
    }))
    .sort(
      (a, b) =>
        (b.hoursAtTarget ?? 0) - (a.hoursAtTarget ?? 0) ||
        (a.maxGapMidday ?? Infinity) - (b.maxGapMidday ?? Infinity)
    );
  if (rows.length === 0) {
    return <NoDataNotice isLineMetric />;
  }
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('regionalRail.table.columns.line')}</TableHead>
            <TableHead className="text-right">
              {t('regionalRail.table.columns.trainsPerDay')}
            </TableHead>
            <TableHead className="text-right">
              {t('regionalRail.table.columns.hoursAtTarget')}
            </TableHead>
            <TableHead className="text-right">{t('regionalRail.middayWait')}</TableHead>
            <TableHead className="text-right">{t('regionalRail.eveningWait')}</TableHead>
            <TableHead className="text-right">
              {t('regionalRail.table.columns.clockFace')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.routeId}>
              <TableCell className="font-medium">{COMMUTER_RAIL_LINE_NAMES[row.routeId]}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCount(row.tripsPerDay)}
              </TableCell>
              <Toned value={row.hoursAtTarget} tone={hoursTone}>
                {t('regionalRail.table.hoursOf', {
                  value: formatCount(row.hoursAtTarget),
                  total: SPAN_HOURS,
                })}
              </Toned>
              <Toned value={row.maxGapMidday} tone={waitTone}>
                {formatMinutes(row.maxGapMidday)}
              </Toned>
              <Toned value={row.maxGapEvening} tone={waitTone}>
                {formatMinutes(row.maxGapEvening)}
              </Toned>
              <Toned value={row.clockFaceShare} tone={clockFaceTone}>
                {formatShare(row.clockFaceShare)}
              </Toned>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="mt-3 text-xs leading-6 text-muted-foreground">
        <Trans
          t={t}
          i18nKey="regionalRail.table.legend"
          values={{ hours: SPAN_HOURS }}
          components={{
            meets: <Swatch tone="meets">{null}</Swatch>,
            partway: <Swatch tone="partway">{null}</Swatch>,
            far: <Swatch tone="far">{null}</Swatch>,
          }}
        />
      </p>
    </>
  );
};
