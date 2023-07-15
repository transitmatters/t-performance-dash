import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { mbtaTextConfig } from '../../styles/general';

interface NoDataNoticeProps {
  isWidget?: boolean;
  inverse?: boolean;
  isLineMetric?: boolean;
}

export const NoDataNotice: React.FC<NoDataNoticeProps> = ({
  isWidget,
  inverse,
  isLineMetric: isLineWide = false,
}) => {
  const { line } = useDelimitatedRoute();

  const color = !inverse && line ? mbtaTextConfig[line] : undefined;
  return (
    <div className="relative flex h-60 w-full items-center justify-center">
      <div
        className={classNames(
          'flex h-full flex-col content-center items-center justify-center rounded-lg text-center',
          isWidget ? 'bg-white p-2 shadow-dataBox' : ''
        )}
      >
        <FontAwesomeIcon size={'3x'} icon={faTriangleExclamation} className={color} />
        <p className="text-stone-900">No data available.</p>
        <p className="text-stone-600">
          {isLineWide ? 'Try another date range.' : 'Try another station or date range.'}
        </p>
      </div>
    </div>
  );
};
