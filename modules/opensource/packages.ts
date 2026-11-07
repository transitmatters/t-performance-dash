export type Ecosystem = 'npm' | 'python';

export interface OssPackage {
  name: string;
  version: string;
  license: string;
  author: string;
  url: string;
  licenseText: string;
  direct: boolean;
}

/** One entry of a generated license file (`common/constants/licenses/*.json`). */
export interface RawLicenseInfo {
  name: string;
  version: string;
  license: string;
  licenseText: string;
  url?: string;
  authors?: string;
  ignore?: boolean;
  direct?: boolean;
}

/** "Jane Doe <jane@example.com> (https://jane.dev)" -> "Jane Doe" */
export const cleanAuthor = (author: string | undefined) =>
  (author ?? '')
    .replace(/<[^>]*>|\([^)]*\)/g, '')
    .replace(/\s+,/g, ',')
    .replace(/\s+/g, ' ')
    .trim();

const REGISTRY_URL: Record<Ecosystem, (name: string) => string> = {
  npm: (name) => `https://www.npmjs.com/package/${name}`,
  python: (name) => `https://pypi.org/project/${name}/`,
};

/** Repository URLs in package metadata can be git remotes; turn them into something a browser opens. */
export const cleanUrl = (url: string | undefined, name: string, ecosystem: Ecosystem) => {
  const cleaned = (url ?? '')
    .trim()
    .replace(/^git\+/, '')
    .replace(/^git:\/\/(git@)?/, 'https://')
    .replace(/\.git$/, '');
  return /^https?:\/\//.test(cleaned) ? cleaned : REGISTRY_URL[ecosystem](name);
};

/** "(MIT OR Apache-2.0)" -> "MIT OR Apache-2.0"; only strips parentheses that wrap the whole expression. */
export const cleanLicense = (license: string) => {
  const trimmed = license.trim();
  const inner = trimmed.slice(1, -1);
  const wrapped = trimmed.startsWith('(') && trimmed.endsWith(')') && !/[()]/.test(inner);
  return (wrapped ? inner : trimmed) || 'Unknown';
};

const byDirectThenName = (a: OssPackage, b: OssPackage) =>
  Number(b.direct) - Number(a.direct) || a.name.localeCompare(b.name);

export const toPackages = (
  raw: Record<string, RawLicenseInfo>,
  ecosystem: Ecosystem,
  isDirect: (name: string) => boolean = (name) => Boolean(raw[name]?.direct)
): OssPackage[] =>
  Object.values(raw)
    .filter((info) => !info.ignore)
    .map((info) => ({
      name: info.name,
      version: info.version,
      license: cleanLicense(info.license),
      author: cleanAuthor(info.authors),
      url: cleanUrl(info.url, info.name, ecosystem),
      licenseText: info.licenseText.trim(),
      direct: isDirect(info.name),
    }))
    .sort(byDirectThenName);

/** License name to package count, most common first. */
export const countByLicense = (packages: OssPackage[]): [string, number][] => {
  const counts = new Map<string, number>();
  for (const pkg of packages) counts.set(pkg.license, (counts.get(pkg.license) ?? 0) + 1);
  return [...counts].sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b));
};

export const filterPackages = (packages: OssPackage[], query: string, license?: string) => {
  const needle = query.trim().toLowerCase();
  return packages.filter(
    (pkg) =>
      (!license || pkg.license === license) &&
      (!needle ||
        pkg.name.toLowerCase().includes(needle) ||
        pkg.author.toLowerCase().includes(needle) ||
        pkg.license.toLowerCase().includes(needle))
  );
};
