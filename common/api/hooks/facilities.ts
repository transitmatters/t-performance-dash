import { useQuery } from '@tanstack/react-query';
import { fetchAllElevatorsAndEscalators } from '../facilities';
import type { LineShort } from '../../types/lines';

export const useElevatorsAndEscalators = (line: LineShort) => {
  return useQuery(['elevAndEsc', line], () => fetchAllElevatorsAndEscalators(line));
};
