import { NoDataNotice } from '../notices/NoDataNotice';

interface NoDataPlaceholder {
  isInverse?: boolean;
}

export const NoDataPlaceholder = ({ isInverse: inverse = false }: NoDataPlaceholder) => {
  return (
    <div className="relative flex h-60 w-full items-center justify-center">
      <NoDataNotice inverse={inverse} />
    </div>
  );
};
