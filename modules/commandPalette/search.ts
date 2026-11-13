import type { Line } from '../../common/types/lines';
import type { Command, CommandGroup } from './commandIndex';
import { toWords } from './commandIndex';

const PER_GROUP = 6;
const isNumeric = (word: string) => /^\d+$/.test(word);

/**
 * How well one query word matches a command's terms: 3 for a whole word, 2 for a prefix, 0 for
 * no match. Numbers only match whole words, so "1" finds Route 1 but not Route 10 or 111.
 */
const wordScore = (token: string, terms: string[]) => {
  let best = 0;
  for (const term of terms) {
    if (term === token) return 3;
    if (!isNumeric(token) && term.startsWith(token)) best = 2;
  }
  return best;
};

interface Scored {
  command: Command;
  score: number;
}

const scoreCommand = (command: Command, tokens: string[], line: Line | undefined) => {
  let score = 0;
  for (const token of tokens) {
    const tokenScore = wordScore(token, command.terms);
    if (!tokenScore) return undefined;
    score += tokenScore;
  }
  // "Harvard" over "Harvard Avenue": every word of the label was asked for.
  if (command.labelTerms.every((term) => tokens.some((token) => term.startsWith(token)))) {
    score += 2;
  }
  // "Park Street" over "Mission Park" for "park".
  if (command.labelTerms[0]?.startsWith(tokens[0])) score += 1;
  if (line && command.line === line) score += 0.5;
  return score;
};

const compare = (a: Scored, b: Scored) =>
  b.score - a.score ||
  a.command.rank - b.command.rank ||
  a.command.terms.length - b.command.terms.length ||
  a.command.label.localeCompare(b.command.label);

/** Commands matching every word of the query, best first. An empty query matches nothing. */
export const searchCommands = (
  index: Command[],
  query: string,
  { line }: { line?: Line } = {}
): Command[] => {
  const tokens = toWords(query);
  if (!tokens.length) return [];
  const scored: Scored[] = [];
  for (const command of index) {
    const score = scoreCommand(command, tokens, line);
    if (score !== undefined) scored.push({ command, score });
  }
  return scored.sort(compare).map(({ command }) => command);
};

export interface CommandSection {
  group: CommandGroup;
  commands: Command[];
}

/** Ranked results split into their groups, in the order of each group's best match. */
export const groupResults = (results: Command[], perGroup = PER_GROUP): CommandSection[] => {
  const sections: CommandSection[] = [];
  for (const command of results) {
    let section = sections.find((candidate) => candidate.group === command.group);
    if (!section) {
      section = { group: command.group, commands: [] };
      sections.push(section);
    }
    if (section.commands.length < perGroup) section.commands.push(command);
  }
  return sections;
};
