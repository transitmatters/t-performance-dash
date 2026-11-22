import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';
import classNames from 'classnames';
import { ArrowLeftIcon, XIcon } from 'lucide-react';
import { Button } from '../../common/components/ui/button';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { usePageControls } from '../../common/hooks/usePageControls';
import { useBetaNoticeStore } from '../../common/state/betaNoticeStore';
import { isBetaHost } from '../../common/utils/constants';
import { useDelimitatedRoute } from '../../common/utils/router';
import { GuideCharacter } from './GuideCharacter';
import { GuideSpotlight } from './GuideSpotlight';
import { useGuideStore } from './store';
import { GUIDE_NAME, GUIDE_TREE, pageNode } from './tree';
import { useGuideChoice } from './useGuideChoice';

/** How long a first-time visitor sees the page before Dash says hello. */
const GREETING_DELAY_MS = 1500;
const BUBBLE =
  'relative w-80 max-w-[calc(100vw-2rem)] rounded-xl bg-popover text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10';

/** The bubble's tail, pointing down at Dash. */
const Tail = () => (
  <span
    aria-hidden
    className="absolute right-6 -bottom-1.5 size-3 rotate-45 border-r border-b border-foreground/10 bg-popover"
  />
);

const GuideBubble = ({ launcherRef }: { launcherRef: RefObject<HTMLButtonElement | null> }) => {
  const node = useGuideStore((state) => state.node);
  const canGoBack = useGuideStore((state) => state.history.length > 0);
  const back = useGuideStore((state) => state.back);
  const close = useGuideStore((state) => state.close);
  const goTo = useGuideStore((state) => state.goTo);
  const choose = useGuideChoice();
  const speechRef = useRef<HTMLDivElement>(null);
  const { say, choices } = GUIDE_TREE[node];

  // Each node replaces the choice that led to it, so keyboard and screen reader users would lose
  // their place. Move focus to what Dash says instead; Tab then reaches the new choices.
  useEffect(() => {
    speechRef.current?.focus({ preventScroll: true });
  }, [node]);

  const closeToLauncher = () => {
    close();
    launcherRef.current?.focus();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') closeToLauncher();
  };

  return (
    <section
      id="tm-guide"
      role="dialog"
      aria-labelledby="tm-guide-name"
      onKeyDown={onKeyDown}
      className={classNames(BUBBLE, 'tm-guide-pop flex max-h-[calc(100dvh-8rem)] flex-col p-4')}
    >
      <Tail />
      <header className="-mt-1.5 -mr-1.5 mb-1.5 flex items-center gap-0.5">
        <h2 id="tm-guide-name" className="flex-1 font-semibold">
          {GUIDE_NAME} <span className="font-normal text-muted-foreground">· Dashboard guide</span>
        </h2>
        {canGoBack && (
          <Button variant="ghost" size="icon-sm" onClick={back} aria-label="Back">
            <ArrowLeftIcon />
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" onClick={closeToLauncher} aria-label="Close">
          <XIcon />
        </Button>
      </header>
      <div className="-mx-1 overflow-y-auto px-1">
        <div
          key={node}
          ref={speechRef}
          tabIndex={-1}
          aria-live="polite"
          className="tm-fade-in flex flex-col gap-2 outline-none"
        >
          {say.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <ul className="mt-3 flex flex-col gap-1.5">
          {choices.map((choice) => (
            <li key={choice.label}>
              <Button
                variant="outline"
                onClick={() => choose(choice)}
                className="h-auto w-full justify-start py-1.5 text-left whitespace-normal"
              >
                {choice.label}
              </Button>
            </li>
          ))}
        </ul>
      </div>
      {node !== 'goodbye' && (
        <button
          type="button"
          onClick={() => goTo('goodbye')}
          className="mt-3 self-start text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          Don&apos;t show {GUIDE_NAME}
        </button>
      )}
    </section>
  );
};

/** Once, on a first visit: a small hello that waits to be answered rather than taking over. */
const GuideGreeting = () => {
  const openAt = useGuideStore((state) => state.openAt);
  const markGreeted = useGuideStore((state) => state.markGreeted);
  return (
    <div role="status" className={classNames(BUBBLE, 'tm-guide-pop p-3')}>
      <Tail />
      <p>Hi, I&apos;m {GUIDE_NAME}! New to the dashboard? I can show you around.</p>
      <div className="mt-2.5 flex gap-1.5">
        <Button size="sm" onClick={() => openAt('welcome')}>
          Show me around
        </Button>
        <Button size="sm" variant="ghost" onClick={markGreeted}>
          No thanks
        </Button>
      </div>
    </div>
  );
};

/** Waits a moment before saying hello, so the page gets seen first. */
const useGreetingDue = (wanted: boolean) => {
  const [due, setDue] = useState(false);
  useEffect(() => {
    if (!wanted) return;
    const timer = setTimeout(() => setDue(true), GREETING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [wanted]);
  return wanted && due;
};

/**
 * Dash, the dashboard's guide: a character in the corner who walks people through the dashboard
 * with a fixed set of choices (see tree.ts). Opens on what the current page shows.
 */
export const Guide = () => {
  const { page, line, color } = useDelimitatedRoute();
  const { open, node, greeted, hidden, openAt, close } = useGuideStore();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const isMobile = !useBreakpoint('md');
  const { visible: mobileControlBar } = usePageControls();
  // The beta notice sits at the bottom of the screen too; one floating message at a time.
  const betaNoticeShowing = useBetaNoticeStore(
    (state) => isBetaHost() && !(state.rumNoticeDismissed && state.feedbackNoticeDismissed)
  );
  const greet = useGreetingDue(!greeted && !hidden && !open && !betaNoticeShowing);

  if (hidden) return null;

  return (
    <>
      {/* Lets the footer scroll clear of Dash, so its Donate button isn't covered. */}
      <div aria-hidden className="h-20 shrink-0" />
      {open && <GuideSpotlight anchor={GUIDE_TREE[node].point} />}
      <div
        className={classNames(
          'pointer-events-none fixed right-4 z-40 flex flex-col items-end gap-3 *:pointer-events-auto',
          // Clear the control bar pinned to the bottom of line pages on phones.
          isMobile && mobileControlBar ? 'bottom-20' : 'bottom-4'
        )}
      >
        {open ? <GuideBubble launcherRef={launcherRef} /> : greet && <GuideGreeting />}
        <button
          ref={launcherRef}
          type="button"
          onClick={() => (open ? close() : openAt(pageNode(page, line)))}
          aria-expanded={open}
          aria-controls={open ? 'tm-guide' : undefined}
          aria-label={open ? `Close ${GUIDE_NAME}` : `Ask ${GUIDE_NAME}, the dashboard guide`}
          title={open ? undefined : `Ask ${GUIDE_NAME}`}
          className="size-14 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5"
        >
          {/* Re-keyed per node, so Dash hops each time it has something new to say. */}
          <span key={open ? node : 'idle'} className={classNames('block', open && 'tm-guide-hop')}>
            <GuideCharacter color={color} className="size-14 drop-shadow-md" />
          </span>
        </button>
      </div>
    </>
  );
};
