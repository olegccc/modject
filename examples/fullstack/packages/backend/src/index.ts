import { createOrchestrator } from 'modject';
import { DatabaseEntryPoint } from './database-entry-point';
import { BackendRouterEntryPoint } from './backend-router-entry-point';
import { SearchControllerEntryPoint } from './search-controller-entry-point';
import { ArticlesControllerEntryPoint } from './articles-controller-entry-point';
import { ServerEntryPoint } from './server-entry-point';
import { ServerAPI } from './server';

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
