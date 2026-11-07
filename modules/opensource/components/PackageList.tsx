import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../../../common/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../../../common/components/ui/input-group';
import { ToggleGroup, ToggleGroupItem } from '../../../common/components/ui/toggle-group';
import type { OssPackage } from '../packages';
import { countByLicense, filterPackages } from '../packages';
import { PackageRow } from './PackageRow';

const ALL = '__all__';

const Section = ({ title, packages }: { title: string; packages: OssPackage[] }) => {
  if (!packages.length) return null;
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">
        {title} <span className="font-normal text-muted-foreground">({packages.length})</span>
      </h3>
      <ul className="overflow-hidden rounded-xl bg-card text-sm ring-1 ring-foreground/10">
        {packages.map((pkg) => (
          <PackageRow key={pkg.name} pkg={pkg} />
        ))}
      </ul>
    </section>
  );
};

interface PackageListProps {
  packages: OssPackage[];
  /** What the transitive section holds, e.g. "Transitive & build tooling". */
  indirectTitle: string;
}

export const PackageList = ({ packages, indirectTitle }: PackageListProps) => {
  const [query, setQuery] = useState('');
  const [license, setLicense] = useState(ALL);

  const licenseCounts = countByLicense(packages);
  const matches = filterPackages(packages, query, license === ALL ? undefined : license);
  const clear = () => {
    setQuery('');
    setLicense(ALL);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <InputGroup className="h-9 bg-background sm:max-w-sm">
          <InputGroupAddon>
            <Search aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, author, or license"
            aria-label="Search packages"
          />
        </InputGroup>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={license}
          // Radix clears the value when the active chip is pressed again; treat that as "All".
          onValueChange={(value) => setLicense(value || ALL)}
          aria-label="Filter by license"
          // The shadcn gap utility doesn't resolve in this Tailwind build (see ButtonGroup).
          className="flex-wrap justify-start gap-1.5"
        >
          {[[ALL, packages.length] as const, ...licenseCounts].map(([name, count]) => (
            <ToggleGroupItem
              key={name}
              value={name}
              className="data-[state=on]:border-foreground/40"
            >
              {name === ALL ? 'All' : name}
              <span className="text-muted-foreground tabular-nums">{count}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {matches.length ? (
        <>
          <Section title="Direct dependencies" packages={matches.filter((pkg) => pkg.direct)} />
          <Section title={indirectTitle} packages={matches.filter((pkg) => !pkg.direct)} />
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl py-10 text-sm text-muted-foreground ring-1 ring-foreground/10">
          No packages match.
          <Button variant="outline" size="sm" onClick={clear}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};
