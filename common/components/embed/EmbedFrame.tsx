import type { ReactNode } from 'react';
import { Link } from '../general/Link';

interface EmbedFrameProps {
  title: string;
  subtitle: ReactNode;
  /** The dashboard page this chart comes from. */
  href: string;
  children: ReactNode;
}

/** The title, chart and dashboard link that every iframe-able chart page shares. */
export const EmbedFrame = ({ title, subtitle, href, children }: EmbedFrameProps) => (
  <div className="flex h-full flex-col gap-2 bg-card p-3 text-card-foreground">
    <title>{`${title} | Data Dashboard`}</title>
    <meta name="robots" content="noindex" />
    <div className="flex flex-col gap-0.5">
      <h1 className="text-base leading-snug font-semibold">{title}</h1>
      <p className="text-[13px] leading-tight text-muted-foreground">{subtitle}</p>
    </div>
    <div className="min-h-0 flex-1">{children}</div>
    <Link
      href={href}
      target="_blank"
      rel="noopener"
      className="self-end text-xs text-muted-foreground hover:underline"
    >
      View on the TransitMatters Data Dashboard ↗
    </Link>
  </div>
);
