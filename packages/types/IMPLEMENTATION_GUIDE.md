# Types Package Implementation Guide

## Overview

The `@repo/types` package is a shared TypeScript types library that provides centralized type definitions, interfaces, enums, and constants for the entire NinjaNotes application ecosystem. This package ensures type safety and consistency across both frontend and backend applications.

## Package Structure

```
packages/types/
├── src/
│   ├── action-items/          # Action item related types
│   ├── auth/                  # Authentication types
│   ├── calendar/              # Calendar integration types
│   ├── contacts/              # Contact management types
│   ├── events/                # Event related types
│   ├── folders/               # Folder organization types
│   ├── notes/                 # Note taking types
│   ├── search/                # Search functionality types
│   ├── summary/               # Summary generation types
│   ├── tags/                  # Tagging system types
│   ├── transcripts/           # Audio transcript types
│   ├── voice-sample/          # Voice sample types
│   └── index.ts               # Main export file
├── dist/                      # Compiled output (CJS & ESM)
├── package.json
├── tsconfig.json
├── tsconfig.cjs.json
├── tsconfig.esm.json
└── IMPLEMENTATION_GUIDE.md
```

## Module Organization Pattern

Each module follows a consistent structure with four main file types:

### 1. `index.ts` - Module Entry Point
- Exports all types, enums, and constants from the module
- Provides a clean API for consuming the module
- Example structure:
```typescript
// Enums
export * from "./enums";

// Constants
export * from "./constants";

// Interfaces
export * from "./interfaces";
```

### 2. `interfaces.ts` - Type Definitions
- Contains all TypeScript interfaces for the module
- Includes base interfaces, response interfaces, and payload interfaces
- Follows naming conventions:
  - `I[EntityName]` - Base entity interface
  - `I[EntityName]Response` - API response interface
  - `ICreate[EntityName]` - Creation payload interface
  - `IUpdate[EntityName]` - Update payload interface
  - `I[EntityName]QueryOptions` - Query/filtering options

### 3. `enums.ts` - Enumeration Definitions
- Contains all enums for the module
- Uses descriptive names and numeric values
- Includes comprehensive JSDoc comments

### 4. `constants.ts` - Constant Values
- Contains constant values, labels, and messages
- Includes success/error messages for API responses
- Uses `as const` for type safety

## Build Configuration

The package supports dual module formats:

### CommonJS (CJS)
- Output directory: `dist/cjs/`
- Module format: CommonJS
- Target: Node.js environments

### ES Modules (ESM)
- Output directory: `dist/esm/`
- Module format: ES2022
- Target: Modern bundlers and browsers

### Package.json Exports
```json
{
  "exports": {
    ".": {
      "import": {
        "types": "./dist/esm/index.d.ts",
        "default": "./dist/esm/index.js"
      },
      "require": {
        "types": "./dist/cjs/index.d.ts",
        "default": "./dist/cjs/index.js"
      }
    }
  }
}
```

## Usage Patterns

### 1. Base Entity Interface
```typescript
export interface IActionItem {
  id: string;
  description: string;
  date: Date | null;
  status: ActionItemStatus;
  priority: ActionItemPriority;
  // ... other fields
}
```

### 2. API Response Interface
```typescript
export interface IActionItemResponse extends IActionItem {
  // Can be extended with additional fields for responses
  // e.g., populated relations, computed fields, etc.
}
```

### 3. Payload Interfaces
```typescript
// Creation payload
export interface ICreateActionItem {
  description: string;
  date?: string | null;
  assignee?: string | null;
  // ... other optional fields
}

// Update payload
export interface IUpdateActionItem {
  description?: string;
  date?: string | null;
  // ... all fields optional for updates
}
```

### 4. Query Options
```typescript
export interface IActionItemQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  status?: ActionItemStatus;
  priority?: ActionItemPriority;
  // ... filtering options
}
```

### 5. Pagination Interface
```typescript
export interface IPaginatedActionItems<T = IActionItemResponse> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  links?: {
    first?: string;
    previous?: string;
    next?: string;
    last?: string;
  };
}
```

## Constants and Messages

### Status Labels
```typescript
export const ACTION_ITEM_STATUS_LABELS = {
  [ActionItemStatus.TODO]: "To Do",
  [ActionItemStatus.INPROGRESS]: "In Progress",
  [ActionItemStatus.COMPLETED]: "Completed",
  [ActionItemStatus.OVERDUE]: "Overdue",
} as const;
```

### Success Messages
```typescript
export const ACTION_ITEM_MESSAGES = {
  CREATED_SUCCESSFULLY: "Action item created successfully",
  RETRIEVED_SUCCESSFULLY: "Action items retrieved successfully",
  UPDATED_SUCCESSFULLY: "Action item updated successfully",
  DELETED_SUCCESSFULLY: "Action item deleted successfully",
} as const;
```

### Error Messages
```typescript
export const ACTION_ITEM_ERRORS = {
  NOT_FOUND: "Action item not found",
  UNAUTHORIZED: "Unauthorized",
  BAD_REQUEST: "Bad request",
  VALIDATION_ERROR: "Validation error",
} as const;
```

## Development Workflow

### 1. Adding New Types
1. Create or update the appropriate interface in `interfaces.ts`
2. Add any new enums to `enums.ts`
3. Add constants and messages to `constants.ts`
4. Export new types from the module's `index.ts`
5. Export from the main `src/index.ts`

### 2. Building the Package
```bash
# Build both CJS and ESM formats
npm run build

# Watch mode for development
npm run dev

# Lint the code
npm run lint
```

### 3. Using in Applications
```typescript
// In backend or frontend
import { 
  IActionItem, 
  ICreateActionItem, 
  ActionItemStatus,
  ACTION_ITEM_MESSAGES 
} from '@repo/types';
```

## Best Practices

### 1. Naming Conventions
- Use `I` prefix for interfaces
- Use descriptive names that indicate purpose
- Use consistent suffixes (`Response`, `Payload`, `Options`)

### 2. Type Safety
- Use `as const` for constant objects
- Use union types for string literals
- Avoid `any` types, use `unknown` when necessary

### 3. Documentation
- Include JSDoc comments for all interfaces
- Document the purpose of each interface
- Explain complex type relationships

### 4. Versioning
- Follow semantic versioning
- Update version when breaking changes are made
- Maintain backward compatibility when possible

### 5. Module Organization
- Keep related types together
- Use consistent file structure across modules
- Export only what's needed from each module

## Common Patterns

### 1. Base + Response Pattern
```typescript
// Base entity
export interface IEntity {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Response with additional fields
export interface IEntityResponse extends IEntity {
  // Additional computed or populated fields
  computedField?: string;
  relations?: IRelatedEntity[];
}
```

### 2. Payload Pattern
```typescript
// Creation payload (required fields)
export interface ICreateEntity {
  name: string;
  description: string;
}

// Update payload (all optional)
export interface IUpdateEntity {
  name?: string;
  description?: string;
}
```

### 3. Query Options Pattern
```typescript
export interface IEntityQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  // Filtering options
  status?: EntityStatus;
  dateFrom?: string;
  dateTo?: string;
}
```

### 4. Pagination Pattern
```typescript
export interface IPaginatedEntities<T = IEntityResponse> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  links?: {
    first?: string;
    previous?: string;
    next?: string;
    last?: string;
  };
}
```

## Integration with Applications

### Backend Integration
```typescript
// In NestJS controllers
import { IActionItem, ICreateActionItem } from '@repo/types';

@Controller('action-items')
export class ActionItemsController {
  @Post()
  async create(@Body() payload: ICreateActionItem): Promise<IActionItem> {
    // Implementation
  }
}
```

### Frontend Integration
```typescript
// In React components
import { IActionItem, ActionItemStatus } from '@repo/types';

interface ActionItemProps {
  item: IActionItem;
  onStatusChange: (status: ActionItemStatus) => void;
}
```

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all exports are properly declared in index files
2. **Type Conflicts**: Use namespace imports to avoid naming conflicts
3. **Circular Dependencies**: Avoid importing between modules when possible
4. **Missing Types**: Check that new types are exported from the main index.ts

### Debugging Tips

1. Use TypeScript's `--strict` mode during development
2. Check generated `.d.ts` files in the dist directory
3. Verify exports are available in both CJS and ESM builds
4. Use IDE type checking to identify issues early

## Future Enhancements

### Planned Improvements
1. Add JSDoc documentation generation
2. Implement type validation at runtime
3. Add utility types for common patterns
4. Create type guards for runtime type checking
5. Add migration tools for type changes

### Contributing Guidelines
1. Follow the established patterns
2. Add comprehensive tests for new types
3. Update documentation for any changes
4. Ensure backward compatibility
5. Use meaningful commit messages

---

This implementation guide provides a comprehensive overview of the types package structure, patterns, and best practices. For specific implementation details, refer to the individual module files and their JSDoc comments.
