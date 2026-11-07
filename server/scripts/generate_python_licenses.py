"""List the backend's runtime Python dependencies and their licenses for the Attributions page.

    cd server && uv run python -m scripts.generate_python_licenses

Runs as part of `npm run generate-oss-list`. Reads metadata from the installed packages, so run
`uv sync` first. Dev-only tools (ruff, pytest, chalice) are left out, matching what we deploy.
"""

import json
import re
import subprocess
import tomllib
from importlib.metadata import Distribution, PackageNotFoundError, distribution
from pathlib import Path

SERVER_DIR = Path(__file__).resolve().parents[1]
OUTPUT = SERVER_DIR.parent / "common" / "constants" / "licenses" / "pythonLicenseInfos.json"

LICENSE_FILE = re.compile(r"^(LICEN[CS]E|COPYING|NOTICE)", re.IGNORECASE)
URL_PREFERENCE = ("source", "repository", "code", "github", "homepage", "home")
# Dual-licensed packages whose metadata names only a file or "Dual License".
LICENSE_OVERRIDES = {
    "ddtrace": "BSD-3-Clause OR Apache-2.0",
    "python-dateutil": "Apache-2.0 AND BSD-3-Clause",
}
SPDX_EXPRESSION = re.compile(r"^[\w.+-]+( (AND|OR) [\w.+-]+)+$")
# Free-text license names (from the License field, a classifier, or a license file's first line) to SPDX ids.
LICENSE_ALIASES = {
    "mit": "MIT",
    "mit license": "MIT",
    "isc": "ISC",
    "isc license (iscl)": "ISC",
    "apache-2.0": "Apache-2.0",
    "apache 2.0": "Apache-2.0",
    "apache license 2.0": "Apache-2.0",
    "apache license, version 2.0": "Apache-2.0",
    "apache software license 2.0": "Apache-2.0",
    "bsd-2-clause": "BSD-2-Clause",
    "bsd-3-clause": "BSD-3-Clause",
    "bsd 3-clause license": "BSD-3-Clause",
    "3-clause bsd license": "BSD-3-Clause",
    "mpl-2.0": "MPL-2.0",
    "mozilla public license 2.0 (mpl 2.0)": "MPL-2.0",
    "mozilla public license version 2.0": "MPL-2.0",
    "psf-2.0": "PSF-2.0",
    "python software foundation license": "PSF-2.0",
}


def normalize_name(name: str) -> str:
    return re.sub(r"[-_.]+", "-", name).lower()


def runtime_requirements() -> dict[str, str]:
    """Name to pinned version for everything `uv sync --no-dev` would install."""
    exported = subprocess.run(
        ["uv", "export", "--frozen", "--no-dev", "--no-hashes", "--no-emit-project", "--format", "requirements-txt"],
        cwd=SERVER_DIR,
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    pins = re.findall(r"^([A-Za-z0-9._-]+)==([^\s;\\]+)", exported, re.MULTILINE)
    return {normalize_name(name): version for name, version in pins}


def direct_requirements() -> set[str]:
    pyproject = tomllib.loads((SERVER_DIR / "pyproject.toml").read_text())
    names = (re.match(r"[A-Za-z0-9._-]+", spec) for spec in pyproject["project"]["dependencies"])
    return {normalize_name(match.group(0)) for match in names if match}


def first_line(text: str) -> str:
    return text.strip().split("\n", 1)[0].strip()


def license_name(dist: Distribution, name: str, text: str) -> str:
    meta = dist.metadata
    if name in LICENSE_OVERRIDES:
        return LICENSE_OVERRIDES[name]
    if expression := meta.get("License-Expression"):
        return expression
    # The License field is free text: sometimes an SPDX id, sometimes a whole license or a file name.
    candidates = [first_line(meta.get("License") or "")]
    candidates += [c.split(" :: ")[-1] for c in meta.get_all("Classifier") or [] if c.startswith("License ::")]
    candidates.append(first_line(text))
    for candidate in candidates:
        if spdx := LICENSE_ALIASES.get(candidate.lower()):
            return spdx
        if SPDX_EXPRESSION.match(candidate):
            return candidate
    return "Unknown"


def authors(dist: Distribution) -> str:
    meta = dist.metadata
    for field in ("Author", "Author-email", "Maintainer", "Maintainer-email"):
        # Drop email addresses: the page shows names, and the JSON ships to every visitor.
        value = re.sub(r"<[^>]*>|\S+@\S+", "", meta.get(field) or "").replace('"', "")
        names = [part.strip() for part in value.split(",")]
        if value := ", ".join(part for part in names if part):
            return value
    return ""


def project_url(dist: Distribution, name: str) -> str:
    urls = {}
    for entry in dist.metadata.get_all("Project-URL") or []:
        label, _, url = entry.partition(",")
        urls[label.strip().lower()] = url.strip()
    for preferred in URL_PREFERENCE:
        for label, url in urls.items():
            if preferred in label:
                return url.removesuffix(".git")
    return dist.metadata.get("Home-page") or f"https://pypi.org/project/{name}/"


def license_text(dist: Distribution) -> str:
    files = [
        file for file in dist.files or [] if file.parts[0].endswith(".dist-info") and LICENSE_FILE.match(file.name)
    ]
    texts = [file.locate().read_text(encoding="utf-8", errors="replace").strip() for file in sorted(files, key=str)]
    return "\n\n".join(text for text in texts if text)


def main():
    pins = runtime_requirements()
    direct = direct_requirements()
    packages = {}
    for name in sorted(pins):
        try:
            dist = distribution(name)
        except PackageNotFoundError:
            # Platform-specific dependencies (e.g. Windows-only) aren't installed here.
            print(f"Skipping {name}: not installed")
            continue
        text = license_text(dist)
        packages[name] = {
            "name": name,
            "version": pins[name],
            "authors": authors(dist),
            "url": project_url(dist, name),
            "license": license_name(dist, name, text),
            "licenseText": text,
            "direct": name in direct,
        }
    OUTPUT.write_text(json.dumps(packages, indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {len(packages)} packages to {OUTPUT.relative_to(SERVER_DIR.parent)}")


if __name__ == "__main__":
    main()
