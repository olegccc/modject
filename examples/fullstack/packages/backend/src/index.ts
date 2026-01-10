import { createOrchestrator } from 'modject';
import { ArticlesControllerEntryPoint } from './articles-controller-entry-point';
import { BackendRouterEntryPoint } from './backend-router-entry-point';
import { DatabaseEntryPoint } from './database-entry-point';
import { SearchControllerEntryPoint } from './search-controller-entry-point';
import { ServerAPI } from './server';
import { ServerEntryPoint } from './server-entry-point';

const orchestrator = createOrchestrator();

orchestrator.addEntryPoints([
  DatabaseEntryPoint,
  BackendRouterEntryPoint,
  SearchControllerEntryPoint,
  ArticlesControllerEntryPoint,
  ServerEntryPoint,
]);

orchestrator.startEntryPoints(
  [ServerEntryPoint.name, SearchControllerEntryPoint.name, ArticlesControllerEntryPoint.name],
  (shell) => {
    const server = shell.get(ServerAPI);
    server.start(3001);
  }
);
