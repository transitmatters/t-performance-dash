import { dependencies } from '../../package.json';
import npmLicenses from '../../common/constants/licenses/licenseInfos.json';
import pythonLicenses from '../../common/constants/licenses/pythonLicenseInfos.json';
import { toPackages } from './packages';

export const NPM_PACKAGES = toPackages(npmLicenses, 'npm', (name) => name in dependencies);

export const PYTHON_PACKAGES = toPackages(pythonLicenses, 'python');
