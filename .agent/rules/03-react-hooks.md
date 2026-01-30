---
trigger: glob
globs: **/*.tsx
---

# React Hooks Rules

## Rules (EN)

- Hooks MUST follow the Rules of Hooks.
- Custom hooks MUST start with `use`.
- Hooks MUST NOT perform direct side effects outside of React lifecycle.
- Data fetching logic SHOULD live in hooks, not components.

## Giải thích (VI)

- Hooks là abstraction cho logic, không phải magic
- Tách hook giúp component clean & testable
