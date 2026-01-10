import { EntryPoint } from 'modject';
import { DatabaseAPI } from './database';
import { BackendRouterAPI } from './backend-router';

export const ArticlesControllerEntryPoint: EntryPoint = {
  name: 'Articles Controller Entry Point',
  dependsOn: [DatabaseAPI, BackendRouterAPI],

  run(shell) {
    const database = shell.get(DatabaseAPI);
    const router = shell.get(BackendRouterAPI);

    router.registerRoute('get', '/api/articles', (req, res) => {
      const articles = database.getArticles();
      res.json(articles);
    });
  },
};
