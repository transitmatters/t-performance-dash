import React from 'react';
import styles from './styles/Legend.module.css';

export const Legend: React.FC = () => {
  return (
    <div className={`legend`}>
      <p>
        <span className={`legend-dot ${styles['on-time']}`}></span> On time
      </p>
      <p>
        <span className={`legend-dot ${styles['twenty-five-percent']}`}></span>{' '}
        {'>25% longer than benchmark'}
      </p>
      <p>
        <span className={`legend-dot ${styles['fifty-percent']}`}></span>{' '}
        {'>50% longer than benchmark'}
      </p>
      <p>
        <span className={`legend-dot ${styles['hundred-percent']}`}></span>{' '}
        {'>100% longer than benchmark'}
      </p>
      <p>
        <span className={'legend-line'}></span> MBTA benchmark
      </p>
    </div>
  );
};

export const LegendLongTerm: React.FC = () => {
  return (
    <div className={`legend ${styles['legend']}`}>
      <p>
        <span className={'legend-dot'} style={{ backgroundColor: 'black' }}></span> Median
      </p>
      <p>
        <span className={'legend-dot'} style={{ backgroundColor: '#C8CCD2' }}></span> Interquartile
        range
      </p>
    </div>
  );
};
