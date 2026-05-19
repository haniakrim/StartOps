```markdown
# StartOps Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the StartOps TypeScript codebase. It covers file naming, import/export styles, commit message habits, and testing patterns, providing clear examples and step-by-step workflow instructions to help you contribute effectively.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `userProfile.ts`, `dataFetcher.ts`

### Import Style
- Use **relative imports** for modules within the project.
  - Example:
    ```typescript
    import { fetchData } from './dataFetcher';
    ```

### Export Style
- Use **named exports** rather than default exports.
  - Example:
    ```typescript
    // In userProfile.ts
    export function getUserProfile(id: string) { ... }
    ```
    ```typescript
    // In another file
    import { getUserProfile } from './userProfile';
    ```

### Commit Messages
- Freeform commit messages, typically around 57 characters.
- No enforced prefix or format.

## Workflows

_No automated workflows detected in this repository. All workflows are manual and developer-driven._

## Testing Patterns

- Test files use the `*.test.*` naming pattern.
  - Example: `userProfile.test.ts`
- The testing framework is **unknown**; check the project documentation or dependencies for specifics.
- Example test file structure:
    ```typescript
    // userProfile.test.ts
    import { getUserProfile } from './userProfile';

    describe('getUserProfile', () => {
      it('should return user data for a valid ID', () => {
        // test implementation
      });
    });
    ```

## Commands

| Command | Purpose |
|---------|---------|
| /test   | Run all test files matching `*.test.*` |
| /lint   | Lint the codebase (if linter is configured) |
| /build  | Build the TypeScript project (if build script exists) |

```