import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faLink } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

/** `navigator.clipboard` is unavailable over plain http on a non-localhost host, so fall back. */
async function copyToClipboard(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    // Fall through to the legacy path below.
  }
  try {
    const field = document.createElement('textarea');
    field.value = url;
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

/**
 * Copies the current URL, chart view state and all. The dashboard's charts are made to be posted
 * alongside a claim, so the link that backs the claim needs to be one click away — previously the
 * only way to share a view was to select the address bar by hand.
 */
export const CopyLinkButton: React.FC = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = useCallback(async () => {
    const ok = await copyToClipboard(window.location.href);
    setState(ok ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2000);
  }, []);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      aria-label={t('buttons.copyLink.label')}
    >
      <FontAwesomeIcon icon={state === 'copied' ? faCheck : faLink} aria-hidden />
      {state === 'copied'
        ? t('buttons.copyLink.copied')
        : state === 'failed'
          ? t('buttons.copyLink.failed')
          : t('buttons.copyLink.idle')}
      {/* Announced without stealing focus, so keyboard and screen-reader users get the same
          confirmation the label change gives everyone else. */}
      <span aria-live="polite" className="sr-only">
        {state === 'copied'
          ? t('buttons.copyLink.copiedAnnouncement')
          : state === 'failed'
            ? t('buttons.copyLink.failedAnnouncement')
            : ''}
      </span>
    </Button>
  );
};
