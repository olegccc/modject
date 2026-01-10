import { EntryPoint } from 'modject';
import { RouterAPI } from '../router';
import { ArticlesPage } from './articles-page';

export const ArticlesPageEntryPoint: EntryPoint = {
  name: 'Articles Page Entry Point',
  dependsOn: [RouterAPI],

  run(shell) {
    const router = shell.get(RouterAPI);
    router.registerPage('New Articles', '/articles', ArticlesPage);
  },
};
