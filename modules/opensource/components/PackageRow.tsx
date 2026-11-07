import { ChevronDown, ExternalLink } from 'lucide-react';
import { Badge } from '../../../common/components/ui/badge';
import { Button } from '../../../common/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../../common/components/ui/collapsible';
import type { OssPackage } from '../packages';

export const PackageRow = ({ pkg }: { pkg: OssPackage }) => (
  <Collapsible asChild>
    <li className="group/row border-b border-border last:border-0">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 items-baseline gap-2">
            <a
              href={pkg.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-0 items-center gap-1 font-medium hover:underline"
            >
              <span className="truncate">{pkg.name}</span>
              <ExternalLink className="size-3 shrink-0 text-muted-foreground" aria-hidden />
            </a>
            <span className="font-mono shrink-0 text-xs text-muted-foreground">{pkg.version}</span>
          </div>
          {pkg.author && (
            <span className="truncate text-xs text-muted-foreground">{pkg.author}</span>
          )}
        </div>
        <Badge variant="outline" className="max-w-32 truncate sm:max-w-56" title={pkg.license}>
          <span className="truncate">{pkg.license}</span>
        </Badge>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" aria-label={`${pkg.name} license text`}>
            <span className="hidden sm:inline">License</span>
            <ChevronDown
              className="transition-transform group-data-[state=open]/row:rotate-180 motion-reduce:transition-none"
              aria-hidden
            />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        {pkg.licenseText ? (
          <pre className="font-mono mx-4 mb-3 max-h-80 overflow-auto rounded-lg bg-muted p-3 text-xs whitespace-pre-wrap text-muted-foreground">
            {pkg.licenseText}
          </pre>
        ) : (
          <p className="mx-4 mb-3 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            No license file shipped with this package. See the project page for its terms.
          </p>
        )}
      </CollapsibleContent>
    </li>
  </Collapsible>
);
