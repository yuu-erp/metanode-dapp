---
trigger: glob
globs: **/*.tsx
---

# React Component Rules

## Rules (EN)

- All components MUST be functional components.
- Components MUST follow single responsibility principle.
- Component files MUST NOT exceed 300 lines.
- Business logic MUST NOT live inside JSX.

## Giải thích (VI)

- Component nhỏ, dễ test, dễ tái sử dụng
- JSX chỉ để render, không xử lý logic phức tạp
