# Testing

## Frontend Tests

### Running Tests

```bash
npm test
```

This runs the React/Jest test suite.

### Test Framework

- **Jest** — test runner
- **React Testing Library** — component testing (if applicable)

### Test Location

Tests are co-located with their source files or in `__tests__/` directories.

---

## Backend Tests

### Running Tests

```bash
cd server && uv run pytest
```

Or from the project root:

```bash
npm run test-python  # if configured
```

### Test Framework

- **pytest** ~9.0.2

### Test Location

Tests are in the `server/tests/` directory.

### Writing Backend Tests

Tests can import from `chalicelib` directly:

```python
from chalicelib import aggregation, sampling

def test_resample_daily():
    values = {"2024-01-01": 10, "2024-01-02": 20, "2024-01-03": 30}
    result = sampling.resample_and_aggregate(values, "daily", "mean")
    assert result == values
```

---

## CI Testing

Tests are run automatically in CI via GitHub Actions:

- **`build.yml`**: Runs `npm run build` to verify the frontend builds without errors
- **`lint.yml`**: Runs both frontend and backend linters

!!! note
    The CI pipeline currently focuses on build verification and linting. Test coverage may vary across the codebase.

---

## Linting as Testing

The strict linting configuration serves as a first line of defense:

| Check | Tool | What It Catches |
|-------|------|-----------------|
| Import errors | ESLint | Missing/unused imports, circular dependencies |
| Type errors | TypeScript | Type mismatches (with `strictNullChecks`) |
| Code style | Prettier + Ruff | Formatting inconsistencies |
| Dead code | `unused-imports` plugin | Unused imports and variables |
| Console usage | ESLint `no-console` | Accidental debug output |

```bash
# Run all lints
npm run lint
```
