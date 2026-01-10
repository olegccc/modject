import cors from 'cors';
import express from 'express';
import type { EntryPoint } from 'modject';
import { BackendRouterAPI } from './backend-router';
import { ServerAPI } from './server';

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
        getApp: () => app,
        start: (port) => {
          app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
          });
        },
      };
    });
  },
};
