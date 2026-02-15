import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSnowflake } from '@fortawesome/free-solid-svg-icons';
import { LINE_COLORS } from '../../common/constants/colors';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { hexWithAlpha } from '../../common/utils/general';
import type { Line } from '../../common/types/lines';
import type { LineGradeResult } from './grading';

interface LineGradeCardProps {
  line: Line;
  grade?: LineGradeResult;
}

const COMPONENT_LABELS: { key: keyof LineGradeResult['components']; label: string }[] = [
  { key: 'service', label: 'Service' },
  { key: 'speed', label: 'Speed' },
  { key: 'slowZones', label: 'Slow Zones' },
  { key: 'delays', label: 'Delays' },
  { key: 'ridership', label: 'Ridership' },
];

// Use the line's own color at varying opacity to indicate grade quality
function getGradeOpacity(letter: string): number {
  if (letter.startsWith('A')) return 1;
  if (letter.startsWith('B')) return 0.8;
  if (letter.startsWith('C')) return 0.55;
  if (letter.startsWith('D')) return 0.35;
  return 0.25;
}

function getComponentOpacity(score: number): number {
  if (score >= 90) return 1;
  if (score >= 75) return 0.8;
  if (score >= 60) return 0.6;
  if (score >= 40) return 0.4;
  return 0.25;
}

function isFerryOffSeason(): boolean {
  const month = new Date().getMonth(); // 0-indexed
  // October (9) through April (3)
  return month >= 9 || month <= 3;
}

export const LineGradeCard: React.FC<LineGradeCardProps> = ({ line, grade }) => {
  const lineColor = LINE_COLORS[line];
  const lineName = LINE_OBJECTS[line].name;
  const seasonal = line === 'line-ferry' && isFerryOffSeason();

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-stone-300 bg-white shadow-sm">
      <div className="h-2" style={{ backgroundColor: lineColor }} />
      <div className="flex flex-col items-center gap-2 px-4 py-4">
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
            <p
              className="text-5xl font-bold"
              style={{ color: hexWithAlpha(lineColor, getGradeOpacity(grade.letter)) }}
            >
              {grade.letter}
            </p>
            <p className="text-lg font-medium text-stone-500">{grade.score}</p>
            <div className="mt-1 flex w-full flex-col gap-1">
              {COMPONENT_LABELS.map(({ key, label }) => {
                const value = grade.components[key];
                // Skip slow zones row for lines that don't have slow zone data
                if (value === -1) return null;
                return (
                  <div key={key} className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="w-16 shrink-0 text-right">{label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, value)}%`,
                          backgroundColor: hexWithAlpha(lineColor, getComponentOpacity(value)),
                        }}
                      />
                    </div>
                    <span className="w-6 text-right">{value}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="py-4 text-sm italic text-stone-400">Coming soon</p>
        )}
      </div>
    </div>
  );
};
