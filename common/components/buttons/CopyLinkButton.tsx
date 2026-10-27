import { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faCheck, faLink } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../ui/button';

/** `navigator.clipboard` is unavailable over plain http on a non-localhost host, so fall back. */
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fall through to the legacy path below.
  }
  try {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(field);
    return copied;
  } catch {
    return false;
  }
}

interface CopyButtonProps {
  /** Read at click time, so it reflects whatever the page shows then. */
  getText: () => string;
  label: string;
  icon: IconDefinition;
  ariaLabel: string;
  /** Announced to screen readers when the copy fails. */
  failedMessage: string;
}

export const CopyButton = ({ getText, label, icon, ariaLabel, failedMessage }: CopyButtonProps) => {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = useCallback(async () => {
    const ok = await copyToClipboard(getText());
    setState(ok ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2000);
  }, [getText]);

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} aria-label={ariaLabel}>
      <FontAwesomeIcon icon={state === 'copied' ? faCheck : icon} aria-hidden />
      {state === 'copied' ? 'Copied' : state === 'failed' ? "Couldn't copy" : label}
      {/* Announced without stealing focus, so keyboard and screen-reader users get the same
          confirmation the label change gives everyone else. */}
      <span aria-live="polite" className="sr-only">
        {state === 'copied' ? 'Copied to clipboard' : state === 'failed' ? failedMessage : ''}
      </span>
    </Button>
  );
};

const getCurrentUrl = () => window.location.href;

/**
 * Copies the current URL, chart view state and all. The dashboard's charts are made to be posted
 * alongside a claim, so the link that backs the claim needs to be one click away — previously the
 * only way to share a view was to select the address bar by hand.
 */
export const CopyLinkButton = () => (
  <CopyButton
    getText={getCurrentUrl}
    label="Copy link"
    icon={faLink}
    ariaLabel="Copy a link to this chart's current view"
    failedMessage="Could not copy the link; copy it from the address bar instead"
  />
);
