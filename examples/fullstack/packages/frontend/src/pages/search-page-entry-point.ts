import { EntryPoint } from 'modject';
import { RouterAPI } from '../router';
import { SearchPage } from './search-page';

export const SearchPageEntryPoint: EntryPoint = {
  name: 'Search Page Entry Point',
  dependsOn: [RouterAPI],

  run(shell) {
    const router = shell.get(RouterAPI);
    router.registerPage('Search', '/search', SearchPage);
  },
};
