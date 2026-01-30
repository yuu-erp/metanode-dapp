---
trigger: glob
globs: **/*.ts, **/*.tsx
---

# TypeScript Strict Rules

## Rules (EN)

- TypeScript strict mode MUST be enabled.
- Usage of `any`, `unknown` (without narrowing), or `@ts-ignore` is FORBIDDEN.
- All public functions, hooks, and components MUST have explicit types.

## Giải thích (VI)

- TypeScript là contract, không phải optional
- `any` làm hỏng toàn bộ hệ thống type
- Type rõ ràng giúp review & refactor an toàn
