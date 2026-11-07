import React, { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSnowflake,
  faTrophy,
  faThumbsUp,
  faWrench,
  faTriangleExclamation,
  faCircleXmark,
  faArrowRight,
  faArrowTrendUp,
  faMinus,
  faAsterisk,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { LINE_COLORS } from '../../common/constants/colors';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { hexWithAlpha } from '../../common/utils/general';
import type { Line } from '../../common/types/lines';
import type { AlertsResponse } from '../../common/types/alerts';
import { AlertEffect } from '../../common/types/alerts';
import {
  BUS_DEFAULTS,
  COMMUTER_RAIL_DEFAULTS,
  FERRY_DEFAULTS,
} from '../../common/state/defaults/dateDefaults';
import { scoreToRating } from './grading';
import type { LineGradeResult } from './grading';

interface Disruption {
  label: string;
  emoji: string;
  headers: string[];
}

const DISRUPTION_TYPES: Record<string, { label: string; emoji: string }> = {
  [AlertEffect.SUSPENSION]: { label: 'Suspended', emoji: '⛔️' },
  [AlertEffect.SHUTTLE]: { label: 'Shuttling', emoji: '🚌' },
};

function getActiveDisruptions(alerts?: AlertsResponse[]): Disruption[] {
  if (!alerts) return [];
  const byType: Record<string, { label: string; emoji: string; headers: string[] }> = {};
  for (const alert of alerts) {
    const isCurrent = alert.active_period.some((p) => p.current);
    if (!isCurrent) continue;
    const disruption = DISRUPTION_TYPES[alert.type];
    if (!disruption) continue;
    if (!byType[alert.type]) {
      byType[alert.type] = { ...disruption, headers: [] };
    }
    if (alert.header) {
      byType[alert.type].headers.push(alert.header);
    }
  }
  return Object.values(byType);
}

interface LineGradeCardProps {
  line: Line;
  grade?: LineGradeResult;
  alerts?: AlertsResponse[];
}

const COMPONENT_LABELS: { key: keyof LineGradeResult['components']; label: string }[] = [
  { key: 'service', label: 'Service' },
  { key: 'speed', label: 'Speed' },
  { key: 'slowZones', label: 'Slow Zones' },
  { key: 'delays', label: 'Delays' },
  { key: 'ridership', label: 'Ridership' },
  { key: 'fleetAge', label: 'Fleet Age' },
  { key: 'electrification', label: 'Electric' },
];

function getRatingIcon(rating: string): IconDefinition {
  if (rating === 'World Class') return faTrophy;
  if (rating === 'Good') return faThumbsUp;
  if (rating === 'Almost Good') return faArrowTrendUp;
  if (rating === 'Needs Work') return faWrench;
  if (rating === 'Poor') return faTriangleExclamation;
  return faCircleXmark;
}

function getRatingOpacity(rating: string): number {
  if (rating === 'World Class') return 1;
  if (rating === 'Good') return 0.85;
  if (rating === 'Almost Good') return 0.65;
  if (rating === 'Needs Work') return 0.5;
  if (rating === 'Poor') return 0.35;

  return 0.25;
}

function getComponentOpacity(score: number): number {
  if (score >= 95) return 1;
  if (score >= 85) return 0.85;
  if (score >= 75) return 0.65;
  if (score >= 60) return 0.5;
  if (score >= 40) return 0.35;
  return 0.25;
}

function isFerryOffSeason(): boolean {
  const month = new Date().getMonth(); // 0-indexed
  // October (9) through April (3)
  return month >= 9 || month <= 3;
}

function getLineHref(line: Line): string {
  const { path } = LINE_OBJECTS[line];
  if (line === 'line-commuter-rail') {
    return `/${path}/trips/single?crRoute=CR-Fairmount&date=${COMMUTER_RAIL_DEFAULTS.singleTripConfig.date}`;
  }
  if (line === 'line-bus') {
    return `/${path}?busRoute=1&date=${BUS_DEFAULTS.singleTripConfig.date}`;
  }
  if (line === 'line-ferry') {
    return `/${path}?ferryRoute=Boat-F1&date=${FERRY_DEFAULTS.singleTripConfig.date}`;
  }
  return `/${path}`;
}

function findLowestComponentScore(components: LineGradeResult['components']): number {
  let lowest = Infinity;
  for (const comp of Object.values(components)) {
    if (comp.score !== -1 && comp.score < lowest) {
      lowest = comp.score;
    }
  }
  return lowest === Infinity ? -1 : lowest;
}

export const LineGradeCard: React.FC<LineGradeCardProps> = ({ line, grade, alerts }) => {
  const lineColor = LINE_COLORS[line];
  const lineName = LINE_OBJECTS[line].name;
  const seasonal = line === 'line-ferry' && isFerryOffSeason();
  const lowestScore = grade ? findLowestComponentScore(grade.components) : -1;
  const disruptions = getActiveDisruptions(alerts);
  const [disruptionExpanded, setDisruptionExpanded] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-stone-300 bg-white shadow-sm">
      <div className="h-2" style={{ backgroundColor: lineColor }} />
      <div className="flex flex-1 flex-col items-center gap-2 px-4 py-4">
        <p className="text-sm font-semibold text-stone-600">{lineName}</p>
        {seasonal ? (
          <div className="flex flex-col items-center gap-1 py-2">
            <FontAwesomeIcon
              icon={faSnowflake}
              className="text-5xl"
              style={{ color: hexWithAlpha(lineColor, 0.6) }}
            />
            <p className="mt-1 text-center text-xs italic text-stone-400">
              Seasonal — limited winter service
            </p>
          </div>
        ) : grade && grade.score > 0 ? (
          <>
            {disruptions.length > 0 ? (
              <div
                className="group/status relative flex min-h-[4.5rem] w-full cursor-default items-center justify-center"
                onClick={() => setDisruptionExpanded((v) => !v)}
              >
                {/* Normal state: icon + emoji + rating label */}
                <div
                  className={`flex flex-col items-center gap-1 transition-all duration-300 ease-in-out group-hover/status:scale-90 group-hover/status:opacity-0 ${disruptionExpanded ? 'scale-90 opacity-0' : ''}`}
                >
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={getRatingIcon(grade.rating)}
                      className="text-4xl"
                      style={{ color: hexWithAlpha(lineColor, getRatingOpacity(grade.rating)) }}
                    />
                    <span className="absolute -right-5 top-1/2 -translate-y-1/2 text-xs">
                      {disruptions[0].emoji}
                    </span>
                  </div>
                  <p
                    className="relative text-lg font-bold"
                    style={{ color: hexWithAlpha(lineColor, getRatingOpacity(grade.rating)) }}
                  >
                    {grade.rating}
                    <FontAwesomeIcon
                      icon={faAsterisk}
                      className="absolute -right-3 top-1.5 text-[8px]"
                    />
                  </p>
                </div>
                {/* Hover/tap state: disruption info pill */}
                <div
                  className={`pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 ease-in-out group-hover/status:pointer-events-auto group-hover/status:opacity-100 ${disruptionExpanded ? 'pointer-events-auto opacity-100' : ''}`}
                >
                  <div
                    className="flex max-w-full flex-col items-center gap-1 rounded-lg px-3 py-2 text-center shadow-sm"
                    style={{ backgroundColor: hexWithAlpha(lineColor, 0.08) }}
                  >
                    {disruptions.map((d, i) => (
                      <div key={i}>
                        <p className="text-xs font-semibold text-stone-700">
                          {d.emoji} {d.label}
                        </p>
                        {d.headers.map((h, j) => (
                          <p key={j} className="mt-0.5 text-[10px] leading-tight text-stone-500">
                            {h}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="relative flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={getRatingIcon(grade.rating)}
                    className="text-4xl"
                    style={{ color: hexWithAlpha(lineColor, getRatingOpacity(grade.rating)) }}
                  />
                  <span className="absolute -right-5 text-sm">
                    {grade.trend === 'up' ? (
                      <span className="text-green-600">↑</span>
                    ) : grade.trend === 'down' ? (
                      <span className="text-red-500">↓</span>
                    ) : (
                      <FontAwesomeIcon icon={faMinus} className="text-xs text-stone-300" />
                    )}
                  </span>
                </div>
                <p
                  className="text-lg font-bold"
                  style={{ color: hexWithAlpha(lineColor, getRatingOpacity(grade.rating)) }}
                >
                  {grade.rating}
                </p>
              </>
            )}
            <div className="mt-1 flex w-full flex-col gap-1">
              {COMPONENT_LABELS.map(({ key, label }) => {
                const comp = grade.components[key];
                if (comp.score === -1) return null;
                const isWeakest = comp.score === lowestScore;
                return (
                  <div key={key} className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="w-[4.5rem] shrink-0 text-right">
                      {isWeakest && (
                        <FontAwesomeIcon
                          icon={faTriangleExclamation}
                          className="mr-0.5 text-[9px] text-stone-400"
                          title="Lowest scoring metric — biggest area for improvement"
                        />
                      )}
                      {label}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, comp.score)}%`,
                          backgroundColor: hexWithAlpha(lineColor, getComponentOpacity(comp.score)),
                        }}
                      />
                    </div>
                    <FontAwesomeIcon
                      icon={getRatingIcon(scoreToRating(comp.score))}
                      className="w-4 shrink-0 text-[10px]"
                      style={{ color: hexWithAlpha(lineColor, getComponentOpacity(comp.score)) }}
                      title={scoreToRating(comp.score)}
                    />
                    <span className="w-4 text-center">
                      {comp.trend === 'up' && <span className="text-green-600">↑</span>}
                      {comp.trend === 'down' && <span className="text-red-500">↓</span>}
                    </span>
                  </div>
                );
              })}
            </div>
            <Link
              href={getLineHref(line)}
              className="mt-auto flex items-center gap-1 pt-2 text-xs font-medium text-stone-400 hover:text-stone-600"
            >
              See details <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
            </Link>
          </>
        ) : (
          <p className="py-4 text-sm italic text-stone-400">Coming soon</p>
        )}
      </div>
    </div>
  );
};
