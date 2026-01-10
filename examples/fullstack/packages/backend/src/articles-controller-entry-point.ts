import type { EntryPoint } from 'modject';
import { BackendRouterAPI } from './backend-router';
import { DatabaseAPI } from './database';

export const ArticlesControllerEntryPoint: EntryPoint = {
  name: 'Articles Controller Entry Point',
  dependsOn: [DatabaseAPI, BackendRouterAPI],

  run(shell) {
    const database = shell.get(DatabaseAPI);
    const router = shell.get(BackendRouterAPI);

    router.registerRoute('get', '/api/articles', (_req, res) => {
      const articles = database.getArticles();
      res.json(articles);
    });
  },
};
