import { describe, expect, it } from 'vitest';
import type { OssPackage, RawLicenseInfo } from './packages';
import {
  cleanAuthor,
  cleanLicense,
  cleanUrl,
  countByLicense,
  filterPackages,
  toPackages,
} from './packages';

const info = (overrides: Partial<RawLicenseInfo> = {}): RawLicenseInfo => ({
  name: 'pkg',
  version: '1.0.0',
  license: 'MIT',
  licenseText: 'MIT License',
  url: 'https://github.com/example/pkg',
  ...overrides,
});

const pkg = (overrides: Partial<OssPackage> = {}): OssPackage => ({
  name: 'pkg',
  version: '1.0.0',
  license: 'MIT',
  author: '',
  url: 'https://github.com/example/pkg',
  licenseText: '',
  direct: false,
  ...overrides,
});

describe('cleanAuthor', () => {
  it('drops emails and URLs', () => {
    expect(cleanAuthor('Sindre Sorhus <sindresorhus@gmail.com>')).toBe('Sindre Sorhus');
    expect(cleanAuthor('The Babel Team (https://babel.dev/team)')).toBe('The Babel Team');
    expect(cleanAuthor('Paco <https://github.com/pacocoursey>')).toBe('Paco');
    expect(cleanAuthor('A <a@x.com>, B <b@x.com>')).toBe('A, B');
  });

  it('handles a missing author', () => {
    expect(cleanAuthor(undefined)).toBe('');
  });
});

describe('cleanUrl', () => {
  it('turns git remotes into browsable URLs', () => {
    expect(cleanUrl('git://git@github.com/EventSource/eventsource', 'eventsource', 'npm')).toBe(
      'https://github.com/EventSource/eventsource'
    );
    expect(cleanUrl('git+https://github.com/a/b.git', 'b', 'npm')).toBe('https://github.com/a/b');
  });

  it('falls back to the registry page', () => {
    expect(cleanUrl('', 'left-pad', 'npm')).toBe('https://www.npmjs.com/package/left-pad');
    expect(cleanUrl(undefined, 'boto3', 'python')).toBe('https://pypi.org/project/boto3/');
  });
});

describe('cleanLicense', () => {
  it('drops parentheses around the whole expression', () => {
    expect(cleanLicense('(MIT OR Apache-2.0)')).toBe('MIT OR Apache-2.0');
    expect(cleanLicense('(MIT AND Zlib) OR (Apache-2.0)')).toBe('(MIT AND Zlib) OR (Apache-2.0)');
    expect(cleanLicense('')).toBe('Unknown');
  });
});

describe('toPackages', () => {
  it('lists direct dependencies first, then alphabetically, and skips ignored entries', () => {
    const raw = {
      zod: info({ name: 'zod' }),
      react: info({ name: 'react' }),
      ajv: info({ name: 'ajv' }),
      internal: info({ name: 'internal', ignore: true }),
    };
    const packages = toPackages(raw, 'npm', (name) => name === 'zod');
    expect(packages.map((p) => [p.name, p.direct])).toEqual([
      ['zod', true],
      ['ajv', false],
      ['react', false],
    ]);
  });

  it('reads the direct flag from the entry by default', () => {
    const raw = { boto3: info({ name: 'boto3', direct: true }), six: info({ name: 'six' }) };
    expect(toPackages(raw, 'python').map((p) => p.direct)).toEqual([true, false]);
  });
});

describe('countByLicense', () => {
  it('counts packages per license, most common first', () => {
    const packages = [
      pkg({ license: 'ISC' }),
      pkg({ license: 'MIT' }),
      pkg({ license: 'MIT' }),
      pkg({ license: 'Apache-2.0' }),
    ];
    expect(countByLicense(packages)).toEqual([
      ['MIT', 2],
      ['Apache-2.0', 1],
      ['ISC', 1],
    ]);
  });
});

describe('filterPackages', () => {
  const packages = [
    pkg({ name: 'react', author: 'Meta' }),
    pkg({ name: 'boto3', author: 'Amazon Web Services', license: 'Apache-2.0' }),
  ];

  it('matches name, author, or license, ignoring case', () => {
    expect(filterPackages(packages, 'REACT').map((p) => p.name)).toEqual(['react']);
    expect(filterPackages(packages, 'amazon').map((p) => p.name)).toEqual(['boto3']);
    expect(filterPackages(packages, 'apache').map((p) => p.name)).toEqual(['boto3']);
  });

  it('narrows to one license', () => {
    expect(filterPackages(packages, '', 'MIT').map((p) => p.name)).toEqual(['react']);
  });
});
