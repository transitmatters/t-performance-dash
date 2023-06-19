import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { mbtaTextConfig } from '../inputs/styles/tailwind';

interface ErrorNoticeProps {
  isWidget?: boolean;
  inverse?: boolean;
}

export const ErrorNotice: React.FC<ErrorNoticeProps> = ({ isWidget, inverse }) => {
  const { line } = useDelimitatedRoute();

  const color = !inverse && line ? mbtaTextConfig[line] : undefined;
  return (
    <div
      className={classNames(
        'flex h-full flex-col content-center items-center justify-center rounded-lg text-center',
        isWidget ? 'bg-white p-2 shadow-dataBox' : ''
      )}
    >
      <FontAwesomeIcon size={'3x'} icon={faTriangleExclamation} className={color} />
      <>An error has occurred</>
    </div>
  );
};
