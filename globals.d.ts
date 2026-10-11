/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

// Set by deploy.sh at build time; unset in local builds.
interface ImportMetaEnv {
  readonly VITE_GIT_VERSION?: string;
  readonly VITE_DD_RUM_APPLICATION_ID?: string;
  readonly VITE_DD_RUM_CLIENT_TOKEN?: string;
}
