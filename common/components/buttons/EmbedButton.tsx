import { faCode } from '@fortawesome/free-solid-svg-icons';
import { CopyButton } from './CopyLinkButton';

interface EmbedButtonProps {
  /** Builds the `<iframe>` snippet at click time. */
  getSnippet: () => string;
}

export const EmbedButton = ({ getSnippet }: EmbedButtonProps) => (
  <CopyButton
    getText={getSnippet}
    label="Embed"
    icon={faCode}
    ariaLabel="Copy embed code for this chart"
    failedMessage="Could not copy the embed code"
  />
);
