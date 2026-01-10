import type { EntryPoint } from 'modject';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { RenderAPI } from './render';
import { RouterAPI } from './router';

export const RenderEntryPoint: EntryPoint = {
  name: 'Render Entry Point',
  contributes: [RenderAPI],
  dependsOn: [RouterAPI],

  contribute(shell) {
    shell.contribute(RenderAPI, (runShell) => {
      const router = runShell.get(RouterAPI);

      return {
        render: () => {
          const pages = router.getPages();
          const root = document.getElementById('root');

          if (!root) {
            throw new Error('Root element not found');
          }

          createRoot(root).render(App({ pages }));
        },
      };
    });
  },
};
