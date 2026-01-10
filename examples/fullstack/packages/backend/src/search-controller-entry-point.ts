import type { EntryPoint } from 'modject';
import { BackendRouterAPI } from './backend-router';
import { DatabaseAPI } from './database';

export const SearchControllerEntryPoint: EntryPoint = {
  name: 'Search Controller Entry Point',
  dependsOn: [DatabaseAPI, BackendRouterAPI],

  run(shell) {
    const database = shell.get(DatabaseAPI);
    const router = shell.get(BackendRouterAPI);

    router.registerRoute('get', '/api/books', (_req, res) => {
      const books = database.getBooks();
      res.json(books);
    });

    router.registerRoute('get', '/api/search', (req, res) => {
      const query = req.query.q as string;

      if (!query) {
        res.status(400).json({ error: 'Query parameter "q" is required' });
        return;
      }

      const results = database.searchBooks(query);
      res.json(results);
    });
  },
};
