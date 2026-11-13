import { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import {
  Command as CommandRoot,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '../../common/components/ui/command';
import { LINE_COLORS } from '../../common/constants/colors';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { useThemeStore } from '../../common/state/themeStore';
import type { Line } from '../../common/types/lines';
import { readableOn } from '../../common/utils/general';
import { useDelimitatedRoute } from '../../common/utils/router';
import type { Command } from './commandIndex';
import { getCommandById, getCommandIndex } from './commandIndex';
import { groupResults, searchCommands } from './search';
import { useCommandPaletteStore, useRecentCommandsStore } from './store';
import { useRunCommand } from './useRunCommand';

interface Section {
  heading: string;
  commands: Command[];
  /** The heading already names the line, so the rows don't repeat it. */
  hideBadges?: boolean;
}

/** What the palette shows before anything is typed: recents, then the current line's pages. */
const emptySections = (line: Line | undefined, recentIds: string[]): Section[] => {
  const index = getCommandIndex();
  const sections: Section[] = [
    {
      heading: 'Recent',
      commands: recentIds.map(getCommandById).filter((command) => command !== undefined),
    },
  ];
  if (line) {
    sections.push({
      heading: `On ${LINE_OBJECTS[line].name}`,
      commands: index.filter((command) => command.id.startsWith(`page:${line}:`)),
      hideBadges: true,
    });
  }
  sections.push(
    { heading: 'Lines', commands: index.filter(({ target }) => target.kind === 'line') },
    { heading: 'System', commands: index.filter(({ id }) => id.startsWith('system:')) },
    { heading: 'Actions', commands: index.filter(({ group }) => group === 'Actions') }
  );
  return sections.filter((section) => section.commands.length > 0);
};

const LineBadge = ({ line, text }: { line?: Line; text: string }) => {
  if (!line) {
    return (
      <span className="shrink-0 rounded-full bg-muted px-1.5 py-px text-[11px] font-semibold text-muted-foreground">
        {text}
      </span>
    );
  }
  const color = LINE_COLORS[line];
  return (
    <span
      style={{ backgroundColor: color }}
      className={classNames(
        'max-w-40 shrink-0 truncate rounded-full px-1.5 py-px text-[11px] font-semibold',
        readableOn(color) === 'dark' ? 'text-stone-900' : 'text-white'
      )}
    >
      {text}
    </span>
  );
};

interface CommandRowProps {
  command: Command;
  /** cmdk tracks the highlighted row by value, so a command listed in two sections needs two. */
  value: string;
  hideBadge?: boolean;
  onSelect: () => void;
}

const CommandRow = ({ command, value, hideBadge, onSelect }: CommandRowProps) => {
  const theme = useThemeStore((state) => state.theme);
  const label =
    command.id === 'action:theme'
      ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`
      : command.label;
  return (
    <CommandItem value={value} onSelect={onSelect} className="gap-2.5 py-2">
      <FontAwesomeIcon icon={command.icon} className="size-3.5! text-muted-foreground" />
      <span className="min-w-0 truncate">{label}</span>
      {command.badge && !hideBadge && <LineBadge line={command.line} text={command.badge} />}
      {command.hint && (
        <CommandShortcut
          className={classNames(
            'shrink-0 pl-2 tracking-normal max-sm:hidden',
            command.hint.startsWith('/') && 'font-mono text-[11px]'
          )}
        >
          {command.hint}
        </CommandShortcut>
      )}
    </CommandItem>
  );
};

const Kbd = ({ children }: { children: string }) => (
  <kbd className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded border border-border px-1 font-sans text-[11px]">
    {children}
  </kbd>
);

export const CommandPalette = () => {
  const open = useCommandPaletteStore((state) => state.open);
  const setOpen = useCommandPaletteStore((state) => state.setOpen);
  const recentIds = useRecentCommandsStore((state) => state.ids);
  const { line } = useDelimitatedRoute();
  const runCommand = useRunCommand();
  const query = useCommandPaletteStore((state) => state.query);
  const setQuery = useCommandPaletteStore((state) => state.setQuery);

  const sections = useMemo<Section[]>(
    () =>
      query.trim()
        ? groupResults(searchCommands(getCommandIndex(), query, { line })).map(
            ({ group, commands }) => ({ heading: group, commands })
          )
        : emptySections(line, recentIds),
    [query, line, recentIds]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Quick navigation"
      description="Jump to a line, route, station or page"
      className="top-[12vh] sm:max-w-xl"
    >
      <CommandRoot shouldFilter={false} loop>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search lines, routes, stations…"
        />
        <CommandList className="max-h-[min(26rem,60vh)]">
          <CommandEmpty>No matches. Try a route number or a station name.</CommandEmpty>
          {sections.map((section) => (
            <CommandGroup key={section.heading} heading={section.heading}>
              {section.commands.map((command) => (
                <CommandRow
                  key={command.id}
                  command={command}
                  value={`${section.heading}:${command.id}`}
                  hideBadge={section.hideBadges}
                  onSelect={() => runCommand(command)}
                />
              ))}
            </CommandGroup>
          ))}
        </CommandList>
        <div className="flex items-center gap-4 border-t px-3 pt-2 pb-1 text-xs text-muted-foreground max-sm:hidden">
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> Navigate
          </span>
          <span className="flex items-center gap-1">
            <Kbd>↵</Kbd> Open
          </span>
          <span className="flex items-center gap-1">
            <Kbd>esc</Kbd> Close
          </span>
          <span className="ml-auto">Try “66” or “Harvard”</span>
        </div>
      </CommandRoot>
    </CommandDialog>
  );
};
