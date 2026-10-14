import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { buttonHighlightFocus, lineColorDarkBorder } from '../../../styles/general';
import { useDelimitatedRoute } from '../../../utils/router';

interface RangeButtonProps extends React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> {
  children: string | React.ReactNode;
}

export const RangeButton: React.FC<RangeButtonProps> = ({ children, ...props }) => {
  const { t } = useTranslation();
  const { line } = useDelimitatedRoute();

  return (
    <button
      type="button"
      title={t('dateSelection.range')}
      className={classNames(
        'inline-flex items-center self-stretch rounded-r-[calc(var(--radius-md)-1px)] border-l bg-white/50 px-3 py-1 text-sm font-medium text-white/90 shadow-xs hover:bg-white focus-visible:bg-white focus-visible:ring-2 focus-visible:outline-hidden',
        line && buttonHighlightFocus[line],
        lineColorDarkBorder[line ?? 'DEFAULT']
      )}
      {...props}
    >
      {children}
    </button>
  );
};
