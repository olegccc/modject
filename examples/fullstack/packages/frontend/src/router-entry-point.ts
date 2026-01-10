import { EntryPoint } from 'modject';
import { RouterAPI } from './router';
import { PageInfo } from '@fullstack/shared';

export const RouterEntryPoint: EntryPoint = {
  name: 'Router Entry Point',
  contributes: [RouterAPI],

  contribute(shell) {
    const pages: PageInfo[] = [];

    shell.contribute(RouterAPI, () => ({
      registerPage: (name, path, component) => {
        const existingIndex = pages.findIndex((p) => p.path === path);
        if (existingIndex >= 0) {
          pages[existingIndex] = { name, path, component };
        } else {
          pages.push({ name, path, component });
        }
      },
      getPages: () => [...pages],
    }));
  },
};
