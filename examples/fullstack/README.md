# Modject Fullstack Example

A full-stack web application demonstrating Modject in a real-world scenario with a React frontend, Express backend, and shared type definitions. This example shows how Modject scales to larger applications with multiple packages and complex dependencies.

## Overview

This example implements a book catalog application with:

- **Frontend**: React + TypeScript + Vite + TailwindCSS + React Router
- **Backend**: Express + TypeScript REST API
- **Shared**: Common types and interfaces

It demonstrates:

- **Monorepo Structure**: Using yarn workspaces for multi-package projects
- **Cross-Package APIs**: Sharing types between frontend and backend
- **Dynamic Routing**: Frontend pages registered via entry points
- **RESTful API**: Backend controllers contributing routes
- **Code Organization**: Separating concerns with multiple entry points

## Project Structure

```
fullstack/
├── packages/
│   ├── shared/              # Shared types and interfaces
│   │   ├── src/
│   │   │   ├── article.ts
│   │   │   ├── book.ts
│   │   │   ├── page-info.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── backend/             # Express REST API
│   │   ├── src/
│   │   │   ├── database.ts                        # Database API definition
│   │   │   ├── database-entry-point.ts           # In-memory database
│   │   │   ├── server.ts                         # Server API definition
│   │   │   ├── server-entry-point.ts             # Express server setup
│   │   │   ├── backend-router.ts                 # Router API definition
│   │   │   ├── backend-router-entry-point.ts     # Route aggregation
│   │   │   ├── articles-controller-entry-point.ts # Articles endpoints
│   │   │   ├── search-controller-entry-point.ts  # Search endpoints
│   │   │   └── index.ts                          # Application setup
│   │   └── package.json
│   │
│   └── frontend/            # React SPA
│       ├── src/
│       │   ├── pages/
│       │   │   ├── home-page.tsx
│       │   │   ├── home-page-entry-point.ts
│       │   │   ├── search-page.tsx
│       │   │   ├── search-page-entry-point.ts
│       │   │   ├── articles-page.tsx
│       │   │   ├── articles-page-entry-point.ts
│       │   │   ├── about-page.tsx
│       │   │   └── about-page-entry-point.ts
│       │   ├── app.tsx                           # Main React component
│       │   ├── router.ts                         # Router API definition
│       │   ├── router-entry-point.ts             # Router implementation
│       │   ├── render.ts                         # Render API definition
│       │   ├── render-entry-point.ts             # React render logic
│       │   ├── main.ts                           # Application setup
│       │   └── index.css
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── package.json
│
└── package.json             # Root workspace configuration
```

## Key Concepts

### 1. Monorepo with Shared Types

The `@fullstack/shared` package defines types used by both frontend and backend:

```typescript
export type Book = {
  id: string;
  title: string;
  author: string;
  year: number;
  description: string;
  isbn: string;
};

export type Article = {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
};
```

### 2. Backend Architecture

#### Database Entry Point

Provides data access through a clean API:

```typescript
export const DatabaseEntryPoint: EntryPoint = {
  name: 'Database Entry Point',
  contributes: [DatabaseAPI],
  
  contribute(shell) {
    shell.contribute(DatabaseAPI, () => ({
      getBooks: () => [...books],
      searchBooks: (query) => { /* search logic */ },
      getArticles: () => [...articles],
    }));
  },
};
```

#### Controller Entry Points

Each controller adds routes to the router:

```typescript
export const SearchControllerEntryPoint: EntryPoint = {
  name: 'Search Controller Entry Point',
  dependsOn: [BackendRouterAPI, DatabaseAPI],
  
  run(shell) {
    const router = shell.get(BackendRouterAPI);
    const database = shell.get(DatabaseAPI);
    
    router.registerRoute('get', '/api/search', (req, res) => {
      const query = req.query.q as string;
      const results = database.searchBooks(query || '');
      res.json({ results });
    });
  },
};
```

#### Server Entry Point

Orchestrates Express server with all routes:

```typescript
export const ServerEntryPoint: EntryPoint = {
  name: 'Server Entry Point',
  contributes: [ServerAPI],
  dependsOn: [BackendRouterAPI],
  
  contribute(shell) {
    shell.contribute(ServerAPI, (runShell) => {
      const app = express();
      app.use(cors());
      app.use(express.json());
      
      const routerAPI = runShell.get(BackendRouterAPI);
      app.use(routerAPI.getRouter());
      
      return {
        start: (port) => {
          app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
          });
        },
      };
    });
  },
};
```

### 3. Frontend Architecture

#### Router Entry Point

Manages page registration and routing:

```typescript
export const RouterEntryPoint: EntryPoint = {
  name: 'Router Entry Point',
  contributes: [RouterAPI],
  
  contribute(shell) {
    shell.contribute(RouterAPI, () => {
      const pages: PageInfo[] = [];
      
      return {
        registerPage: (name, path, component) => {
          pages.push({ name, path, component });
        },
        getPages: () => [...pages],
      };
    });
  },
};
```

#### Page Entry Points

Each page registers itself with the router:

```typescript
export const HomePageEntryPoint: EntryPoint = {
  name: 'Home Page Entry Point',
  dependsOn: [RouterAPI],
  
  run(shell) {
    const router = shell.get(RouterAPI);
    
    const HomePageWrapper = () => {
      const pages = router.getPages();
      return HomePage({ pages });
    };
    
    router.registerPage('Home', '/', HomePageWrapper);
  },
};
```

#### Render Entry Point

Initializes the React application:

```typescript
export const RenderEntryPoint: EntryPoint = {
  name: 'Render Entry Point',
  contributes: [RenderAPI],
  dependsOn: [RouterAPI],
  
  contribute(shell) {
    shell.contribute(RenderAPI, (runShell) => ({
      render: () => {
        const router = runShell.get(RouterAPI);
        const pages = router.getPages();
        const root = document.getElementById('root');
        
        if (root) {
          createRoot(root).render(<App pages={pages} />);
        }
      },
    }));
  },
};
```

## Running the Example

### Prerequisites

- Node.js >= 18.0.0
- yarn

### Installation

From the `fullstack` directory:

```bash
yarn install
```

### Build All Packages

```bash
yarn build
```

This builds in order: shared → backend → frontend

### Development Mode

#### Start Backend (Terminal 1)

```bash
yarn dev:backend
```

Server runs on `http://localhost:3001`

#### Start Frontend (Terminal 2)

```bash
yarn dev:frontend
```

Frontend runs on `http://localhost:5173`

### Production Mode

#### Build Production Assets

```bash
yarn build
```

#### Start Backend

```bash
yarn start:backend
```

Then serve the `packages/frontend/dist` directory with a static file server.

## API Endpoints

### Backend REST API

- `GET /api/search?q=<query>` - Search books by title, author, or description
- `GET /api/articles` - Get all articles

## Application Features

### Home Page

- Overview of the application
- Quick links to other sections

### Search Page

- Search books by title, author, or description
- Real-time results from backend API
- Displays book details including ISBN, year, and description

### Articles Page

- Browse articles about books and reading
- View article metadata (author, date)

### About Page

- Information about the application
- Technology stack details

## How It Works

### Backend Flow

1. **Setup**: Orchestrator registers all entry points
2. **Database**: `DatabaseEntryPoint` contributes the database API with mock data
3. **Router**: `BackendRouterEntryPoint` creates an Express router
4. **Controllers**: Each controller entry point registers routes on the router
5. **Server**: `ServerEntryPoint` creates Express app, adds middleware and router
6. **Start**: Application starts the server on specified port

### Frontend Flow

1. **Setup**: Orchestrator registers all entry points
2. **Router**: `RouterEntryPoint` contributes the router API for page registration
3. **Pages**: Each page entry point registers itself with the router
4. **Render**: `RenderEntryPoint` gets all registered pages and renders the React app
5. **React Router**: Navigation handled by React Router with registered routes

## Learning Points

### Architecture Patterns

- **Separation of Concerns**: Database, routing, and controllers are independent
- **Plugin Architecture**: Controllers and pages can be added/removed without modifying core code
- **Dependency Injection**: Components access dependencies through the shell
- **Type Safety**: Shared types ensure contract compliance across packages

### Modject Benefits

- **Modularity**: Each feature is isolated in its own entry point
- **Extensibility**: New pages or API endpoints can be added without touching existing code
- **Testability**: Entry points can be tested independently
- **Dynamic Registration**: Routes and pages are registered at runtime
- **Clear Dependencies**: `dependsOn` makes requirements explicit

### Real-World Patterns

- **RESTful API Design**: Standard HTTP methods and resource naming
- **Frontend Routing**: Dynamic route registration with React Router
- **State Management**: Local state in components, shared state through APIs
- **Monorepo Organization**: Shared code in separate package

## Extending the Example

### Add a New Backend Endpoint

1. Create a new controller entry point
2. Declare dependency on `BackendRouterAPI` and any needed data APIs
3. Register routes in the `run` method
4. Add the entry point to the orchestrator

### Add a New Frontend Page

1. Create the React component
2. Create an entry point that depends on `RouterAPI`
3. Register the page in the `run` method
4. Add the entry point to the orchestrator

### Add New Data Types

1. Define the type in `@fullstack/shared`
2. Update the database entry point with mock data
3. Create controllers and pages that use the new type

## Next Steps

- Explore the [simple example](../simple) for a basic introduction to Modject
- Add authentication/authorization entry points
- Implement real database connections
- Add state management entry points
- Create reusable UI component entry points
