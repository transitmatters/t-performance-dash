import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { Link } from '../../common/components/general/Link';
import { BETA_FEEDBACK_URL, isBetaHost } from '../../common/utils/constants';

const LINKS = [
  { name: 'About', href: 'https://transitmatters.org/transitmatters-labs' },
  { name: 'Join us', href: 'https://transitmatters.org/join' },
  {
    name: 'Feedback',
    href: isBetaHost() ? BETA_FEEDBACK_URL : 'https://forms.gle/SKYtxgKSyCrYxM1v7',
  },
  { name: 'Source', href: 'https://github.com/transitmatters/t-performance-dash' },
  { name: 'Attributions', href: '/opensource' },
];

/** Utility links live here rather than in the sidebar, where they pushed lines below the fold. */
export const SiteFooter = () => {
  return (
    <footer className="flex flex-row flex-wrap items-center gap-x-4 gap-y-1 border-t border-stone-200 px-4 py-3 text-xs text-stone-500 md:px-6 dark:border-stone-800 dark:text-stone-400">
      <ul className="flex flex-row flex-wrap gap-x-4 gap-y-1">
        {LINKS.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              className="hover:text-stone-900 hover:underline dark:hover:text-stone-100"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
      <div className="ml-auto flex flex-row flex-wrap items-center gap-x-4 gap-y-1">
        {isBetaHost() && <p>Beta: usage data collected via Datadog</p>}
        <Link
          href="https://transitmatters.org/donate"
          className="flex items-center rounded-md bg-tm-red px-3 py-1.5 font-semibold hover:bg-tm-red/85"
        >
          {/* The global `a { color: inherit }` beats a text color set on the link itself. */}
          <span className="flex items-center gap-x-1.5 text-white">
            <FontAwesomeIcon icon={faHeart} className="size-3" aria-hidden />
            Donate
          </span>
        </Link>
      </div>
    </footer>
  );
};
