# Modject

A lightweight, zero-dependency framework for building modular applications with dependency injection and inversion of control.

## Why Modject?

Modject helps you organize projects with a modular structure where components depend only on **interfaces**, not concrete implementations. This approach promotes clean architecture, maintainability, and testability across any project type.

Inspired by [repluggable](https://github.com/wix-incubator/repluggable), Modject offers a streamlined, framework-agnostic approach to modularity. While Repluggable excels at React/Redux applications, Modject focuses purely on modularity and dependency injection, making it suitable for **any** JavaScript/TypeScript project.

## Key Features

✨ **Zero Dependencies** - No external dependencies, minimal footprint  
🔒 **Strongly Typed** - Full TypeScript support with complete type safety  
🧩 **Modular Architecture** - Build applications from independent, reusable modules  
💉 **Dependency Injection** - Clean IoC container for managing dependencies  
🎯 **Interface-Based** - Depend on contracts, not implementations  
🪶 **Lightweight** - ~4.3 KB minified (ESM), ~4.8 KB (CJS)  
🌐 **Universal** - Works for frontend, backend, CLI, or any Node.js project  
📦 **SOLID Principles** - Built-in support for clean architecture patterns  
✅ **Well Tested** - 100% test coverage with comprehensive test suite

## Installation

```bash
npm install modject
# or
yarn add modject
# or
bun add modject
```

## Quick Start

Here's a simple example demonstrating the core concepts:

```typescript
import { createOrchestrator, SlotKey, EntryPoint } from 'modject';

// 1. Define your API interface
interface LoggerAPI {
  log(message: string): void;
}

// 2. Create a SlotKey (typed contract)
const LoggerAPI: SlotKey<LoggerAPI> = {
  name: 'Logger API',
};

// 3. Create an entry point that provides the implementation
const LoggerEntryPoint: EntryPoint = {
  name: 'Logger Entry Point',
  contributes: [LoggerAPI],
  
  contribute(shell) {
    shell.contribute(LoggerAPI, () => ({
      log: (message) => console.log(`[LOG] ${message}`),
    }));
  },
};

// 4. Create an entry point that uses the API
const AppEntryPoint: EntryPoint = {
  name: 'App Entry Point',
  dependsOn: [LoggerAPI],
  
  run(shell) {
    const logger = shell.get(LoggerAPI);
    logger.log('Application started!');
  },
};

// 5. Orchestrate everything
const orchestrator = createOrchestrator();
orchestrator.addEntryPoints([LoggerEntryPoint, AppEntryPoint]);
orchestrator.startEntryPoints('App Entry Point');
// Output: [LOG] Application started!
```

## Core Concepts

### SlotKey - Typed API Contract

A `SlotKey` defines a typed contract that modules can provide or consume:

```typescript
export interface DatabaseAPI {
  query(sql: string): Promise<any[]>;
  execute(sql: string): Promise<void>;
}

export const DatabaseAPI: SlotKey<DatabaseAPI> = {
  name: 'Database API',
};
```

### Entry Points - Modular Components

Entry points are self-contained modules that can:
- **Contribute** implementations to APIs
- **Depend on** other APIs
- **Run** logic when started

```typescript
const DatabaseEntryPoint: EntryPoint = {
  name: 'Database Entry Point',
  contributes: [DatabaseAPI],
  
  contribute(shell) {
    shell.contribute(DatabaseAPI, () => ({
      query: async (sql) => { /* implementation */ },
      execute: async (sql) => { /* implementation */ },
    }));
  },
};
```

### Orchestrator - Lifecycle Manager

The orchestrator manages entry point registration, dependency resolution, and lifecycle:

```typescript
const orchestrator = createOrchestrator();

// Add entry points
orchestrator.addEntryPoints([DatabaseEntryPoint, ApiEntryPoint]);

// Start specific entry points (dependencies auto-resolved)
orchestrator.startEntryPoints(['API Entry Point']);

// Stop entry points when needed
orchestrator.stopEntryPoints(['API Entry Point']);
```

## API Reference

### `createOrchestrator()`

Creates a new orchestrator instance for managing entry points.

```typescript
const orchestrator = createOrchestrator();
```

**Returns:** `EntryPointOrchestrator`

### `EntryPointOrchestrator`

Interface for managing entry point lifecycle.

#### `addEntryPoints(entryPoints: EntryPoint[]): void`

Registers one or more entry points with the orchestrator.

```typescript
orchestrator.addEntryPoints([LoggerEntryPoint, DatabaseEntryPoint]);
```

#### `removeEntryPoints(names: string[]): void`

Removes entry points by name.

```typescript
orchestrator.removeEntryPoints(['Logger Entry Point']);
```

#### `startEntryPoints(names: string | string[], onStarted?: (shell: RunShell) => void): void`

Starts one or more entry points. Dependencies are automatically resolved and started.

```typescript
// Start single entry point
orchestrator.startEntryPoints('App Entry Point');

// Start multiple entry points
orchestrator.startEntryPoints(['API Entry Point', 'Worker Entry Point']);

// With callback after startup
orchestrator.startEntryPoints('App Entry Point', (shell) => {
  console.log('Application started!');
});
```

#### `stopEntryPoints(names: string[], onStopped?: () => void): void`

Stops specific entry points.

```typescript
orchestrator.stopEntryPoints(['Worker Entry Point'], () => {
  console.log('Worker stopped');
});
```

#### `stopAllEntryPoints(onStopped?: () => void): void`

Stops all running entry points.

```typescript
orchestrator.stopAllEntryPoints(() => {
  console.log('All entry points stopped');
});
```

#### `getStartedEntryPoints(): string[]`

Returns names of all currently running entry points.

```typescript
const running = orchestrator.getStartedEntryPoints();
console.log('Running:', running);
```

#### `defineLayers(layers: string[]): void`

Defines architectural layers for organizing entry points. Must be called before adding entry points.

```typescript
orchestrator.defineLayers(['data', 'business', 'presentation']);
```

### `SlotKey<T>`

Defines a typed API contract.

```typescript
interface SlotKey<T> {
  readonly name: string;        // Unique identifier
  readonly public?: boolean;    // Whether this API is public
  readonly multi?: boolean;     // Whether to create new instances per access
  readonly layer?: string;      // Architectural layer (if using layers)
}
```

**Properties:**
- `name` - Unique identifier for the slot
- `public` (optional) - Marks the API as public (documentation purposes)
- `multi` (optional) - When `true`, factory is called each time `shell.get()` is invoked
- `layer` (optional) - Specifies which architectural layer this API belongs to

### `EntryPoint`

Defines a modular component.

```typescript
interface EntryPoint {
  readonly name: string;                          // Unique identifier
  readonly layer?: string;                        // Architectural layer
  readonly contributes?: SlotKey<unknown>[];      // APIs this provides
  readonly dependsOn?: SlotKey<unknown>[];        // APIs this requires
  contribute?(shell: ContributeShell): void;      // Called during startup
  run?(shell: RunShell): void;                    // Called during startup
  withdraw?(shell: WithdrawShell): void;          // Called during shutdown
}
```

**Lifecycle hooks:**
- `contribute(shell)` - Called first; use to provide API implementations
- `run(shell)` - Called second; use to execute startup logic
- `withdraw(shell)` - Called during shutdown; use to clean up resources

### `RunShell`

Provides access to dependency APIs.

```typescript
interface RunShell {
  get<T>(key: SlotKey<T>): T;
}
```

**Methods:**
- `get<T>(key)` - Retrieves an API implementation (must be declared in `dependsOn`)

### `ContributeShell`

Used to contribute API implementations.

```typescript
interface ContributeShell {
  contribute<T>(key: SlotKey<T>, factory: (shell: RunShell) => T): void;
}
```

**Methods:**
- `contribute<T>(key, factory)` - Registers an implementation for an API

### `WithdrawShell`

Used to withdraw API implementations during shutdown.

```typescript
interface WithdrawShell {
  withdraw<T>(key: SlotKey<T>): void;
}
```

**Methods:**
- `withdraw<T>(key)` - Removes an API implementation

## Examples

The repository includes two comprehensive examples:

### [Simple Example](./examples/simple)

A banking application demonstrating core Modject concepts:
- Basic API definition with `SlotKey`
- Entry points with dependencies
- Orchestration and dependency injection
- Clean separation between interfaces and implementations

**Perfect for:** Learning Modject basics, understanding the core patterns

### [Fullstack Example](./examples/fullstack)

A full-stack book catalog application with:
- React frontend with dynamic routing
- Express backend with REST API
- Shared types between frontend and backend
- Monorepo structure with yarn workspaces
- Multiple entry points for pages and controllers

**Perfect for:** Understanding how Modject scales to real-world applications

See the individual README files in each example directory for detailed documentation.

## SOLID Principles Support

Modject is designed with SOLID principles at its core:

### Single Responsibility Principle (SRP)

Each entry point has a single, well-defined responsibility. APIs are focused interfaces.

```typescript
// Each entry point does one thing well
const LoggerEntryPoint: EntryPoint = {
  name: 'Logger Entry Point',
  contributes: [LoggerAPI],
  contribute(shell) {
    // Only responsible for logging
  },
};
```

### Open/Closed Principle (OCP)

Modject supports OCP by allowing you to add new functionality through new entry points and APIs without modifying existing code. You can create new interfaces that extend existing ones and register them under new SlotKeys.

```typescript
// Original interface remains unchanged
interface LoggerAPI {
  log(message: string): void;
}

// Create an extended interface with additional functionality
interface EnhancedLoggerAPI extends LoggerAPI {
  logWithLevel(level: string, message: string): void;
  getHistory(): string[];
}

// Register as a new API under a different SlotKey
const EnhancedLoggerKey: SlotKey<EnhancedLoggerAPI> = { name: 'EnhancedLogger' };

// New entry points can use the enhanced interface
const NewFeatureEntryPoint: EntryPoint = {
  name: 'New Feature',
  dependsOn: [EnhancedLoggerKey],
  run(shell) {
    const logger = shell.get(EnhancedLoggerKey);
    logger.logWithLevel('INFO', 'Using enhanced functionality');
  },
};
```

Note: This approach creates a separate API rather than transparently enhancing the original. Existing consumers of `LoggerAPI` will continue using the original implementation.

### Liskov Substitution Principle (LSP)

Entry points depend on interfaces (`SlotKey`), so implementations can be substituted without breaking consumers. Substitution is achieved at compile-time by choosing which entry point to include in the `addEntryPoints` call.

```typescript
// Both implementations satisfy the same interface
const ConsoleLoggerEntryPoint: EntryPoint = {
  name: 'Console Logger',
  contributes: [LoggerAPI],
  contribute(shell) {
    shell.contribute(LoggerAPI, () => ({
      log: (msg) => console.log(msg),
    }));
  },
};

const FileLoggerEntryPoint: EntryPoint = {
  name: 'File Logger',
  contributes: [LoggerAPI],
  contribute(shell) {
    shell.contribute(LoggerAPI, () => ({
      log: (msg) => fs.appendFileSync('log.txt', msg + '\n'),
    }));
  },
};

// Substitute implementations by changing which entry point is added
orchestrator.addEntryPoints([
  ConsoleLoggerEntryPoint,  // Use console logger
  // FileLoggerEntryPoint,  // Or use file logger instead
  ApplicationEntryPoint,     // Consumer works with either
]);
```

### Interface Segregation Principle (ISP)

`SlotKey` definitions encourage small, focused interfaces that clients depend on.

```typescript
// Small, focused interfaces instead of large ones
interface ReadAPI {
  read(id: string): Promise<Data>;
}

interface WriteAPI {
  write(data: Data): Promise<void>;
}

// Clients depend only on what they need
const ReaderEntryPoint: EntryPoint = {
  dependsOn: [ReadAPI],  // Only depends on read operations
};
```

### Dependency Inversion Principle (DIP)

High-level modules depend on abstractions (`SlotKey` interfaces), not concrete implementations.

```typescript
// High-level module depends on abstraction
const ApplicationEntryPoint: EntryPoint = {
  name: 'Application Entry Point',
  dependsOn: [DatabaseAPI, LoggerAPI],  // Abstractions, not implementations
  
  run(shell) {
    const database = shell.get(DatabaseAPI);
    const logger = shell.get(LoggerAPI);
    // Use interfaces, not concrete classes
  },
};
```

## Use Cases

Modject is suitable for any JavaScript/TypeScript project:

- **Backend APIs** - Organize Express/Fastify apps into modular controllers
- **Frontend Apps** - Structure React/Vue/Angular apps with pluggable features
- **CLI Tools** - Build extensible command-line applications
- **Libraries** - Create plugin systems for your libraries
- **Microservices** - Share common patterns across services
- **Full-stack Apps** - Maintain consistency between frontend and backend

## Development

```bash
# Install dependencies
bun install

# Run tests
bun run test

# Run tests with coverage
bun run test:coverage

# Build
bun run build

# Lint
bun run lint

# Format
bun run format
```

### Test Coverage

Modject maintains 100% test coverage to ensure reliability:

- **100%** statement coverage
- **100%** branch coverage
- **100%** function coverage
- **100%** line coverage
- **83** comprehensive tests covering core functionality, edge cases, and error paths

Run `bun run test:coverage` to generate a detailed coverage report.

## License

MIT
