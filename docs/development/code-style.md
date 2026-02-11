# Code Style

## Frontend (TypeScript/JavaScript)

### Linting

**Tools**: ESLint + Prettier

```bash
npm run lint-frontend       # Check for issues
npm run lint-frontend-fix   # Auto-fix
```

### ESLint Rules

**Config**: `.eslintrc.js`

| Rule | Level | Description |
|------|-------|-------------|
| `import/order` | error | Enforce import ordering (external first, then internal, alphabetized) |
| `import/newline-after-import` | error | Blank line after imports |
| `import/max-dependencies` | warn | Max 20 imports per file |
| `import/no-self-import` | error | No circular self-imports |
| `import/no-default-export` | warn | Prefer named exports (except pages and stories) |
| `@typescript-eslint/consistent-type-imports` | error | Use `import type { Foo }` for type-only imports |
| `no-console` | error | No `console.log` in production code |
| `unused-imports/no-unused-imports` | error | Remove unused imports |
| `react-hooks/exhaustive-deps` | warn | React hook dependency arrays |

### Import Ordering

Imports must be ordered:

1. External packages (e.g., `react`, `zustand`, `chart.js`)
2. Internal modules (e.g., `../common/`, `../../modules/`)
3. Alphabetized within each group

```typescript
// Correct
import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { COLORS } from '../constants/colors';
import type { Line } from '../types/lines';
```

### Type Imports

Always use `import type` for type-only imports:

```typescript
// Correct
import type { Line, LineShort } from '../types/lines';

// Incorrect
import { Line, LineShort } from '../types/lines';
```

### Prettier Configuration

**Config**: `.prettierrc`

| Setting | Value |
|---------|-------|
| `printWidth` | 100 |
| `tabWidth` | 2 |
| `singleQuote` | `true` |
| `trailingComma` | `es5` |
| Tailwind class sorting | Enabled via plugin |

### TypeScript Configuration

**Config**: `tsconfig.json`

| Setting | Value | Note |
|---------|-------|------|
| `strict` | `false` | Overall strict mode off |
| `strictNullChecks` | `true` | Null checks enforced |
| `noImplicitAny` | `false` | Implicit `any` allowed |
| `target` | `es6` | ES6 output |
| `jsx` | `preserve` | Next.js handles JSX |

---

## Backend (Python)

### Linting

**Tool**: [Ruff](https://docs.astral.sh/ruff/)

```bash
npm run lint-backend        # Check for issues
npm run lint-backend-fix    # Auto-fix
```

### Ruff Configuration

**Config**: `server/pyproject.toml` (via `[tool.ruff]`)

| Setting | Value |
|---------|-------|
| Line length | 120 characters |
| Python version | 3.12 |
| Format | Ruff's built-in formatter |

### Python Conventions

- **Type hints**: Used throughout, especially in function signatures
- **Pydantic models**: Used for all API request/response validation
- **f-strings**: Preferred for string formatting
- **Docstrings**: Not required but encouraged for complex functions

### Import Organization

1. Standard library imports
2. Third-party imports
3. Local imports (`from chalicelib import ...`)

```python
# Correct
from datetime import date
from typing import Dict, List

import pandas as pd
from pydantic import BaseModel

from chalicelib import config, data_funcs
```

---

## Pre-Commit Hooks

The project uses `pre-commit` for automated code quality checks before commits. Backend hooks are configured via `pre-commit` in the `server/` directory.

---

## Editor Setup

### Recommended Extensions (VSCode)

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Python (Pylance)
- Ruff

### Settings

The TypeScript config includes the `typescript-plugin-css-modules` plugin for CSS module IntelliSense.
