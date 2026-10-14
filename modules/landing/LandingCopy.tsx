import React from 'react';
import { useTranslation } from 'react-i18next';
import type { LandingCharts } from './types';

// Copy originally from: https://docs.google.com/document/d/1kpJqbsNrJpW8gqfeuIjd2KplDacQyorAKE2w5wB6HUY/edit

const DESCRIPTION_STYLE = 'text-stone-900 text-lg';
const BASELINE_STYLE = 'text-stone-900 italic text-xs text-center';

/** The caption under each landing chart. */
export const LandingBaseline: React.FC = () => {
  const { t } = useTranslation('landing');
  return <p className={BASELINE_STYLE}>{t('baseline')}</p>;
};

/** The question a landing chart answers, and how it's measured. */
export const LandingChartDescription: React.FC<{ chart: LandingCharts }> = ({ chart }) => {
  const { t } = useTranslation('landing');
  return (
    <p className={DESCRIPTION_STYLE}>
      {t(`charts.${chart}.question`)}
      <br />
      <span className="text-sm text-stone-800">{t(`charts.${chart}.description`)}</span>
    </p>
  );
};
