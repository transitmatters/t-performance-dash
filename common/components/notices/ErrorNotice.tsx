import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useDelimitatedRoute } from '../../utils/router';
import { mbtaTextConfig } from '../../styles/general';

interface ErrorNoticeProps {
  query?: UseQueryResult<unknown>;
  isWidget?: boolean;
  inverse?: boolean;
}

export const ErrorNotice: React.FC<ErrorNoticeProps> = ({ isWidget, inverse, query }) => {
  const { line } = useDelimitatedRoute();

  const errorMessage = query?.error?.['message'];
  const timeout = errorMessage === 'network request failed';

  const color = !inverse && line ? mbtaTextConfig[line] : undefined;
  return (
    <div
      className={classNames(
        'flex h-full flex-col content-center items-center justify-center rounded-lg text-center',
        isWidget ? 'bg-white p-2 shadow-dataBox' : ''
      )}
    >
      <FontAwesomeIcon size={'3x'} icon={faTriangleExclamation} className={color} />
      {timeout ? (
        <>
          <p>The response took too long</p>
          <p>Try shrinking the date range and try again</p>
        </>
      ) : (
        <p>An error has occurred</p>
      )}
    </div>
  );
};
