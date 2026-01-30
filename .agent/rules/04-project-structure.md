---
trigger: always_on
---

# Project Structure Rules

## Rules (EN)

- Modules MUST have clear ownership and boundaries.
- Cross-feature imports are FORBIDDEN unless explicitly allowed.
- UI layer MUST NOT depend on data-access or infra details.

## Giải thích (VI)

- Structure tốt giúp scale team
- Boundary rõ ràng giúp tránh circular dependency
