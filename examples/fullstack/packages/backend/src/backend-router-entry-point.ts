import { Router } from 'express';
import type { EntryPoint } from 'modject';
import { BackendRouterAPI } from './backend-router';

export const BackendRouterEntryPoint: EntryPoint = {
  name: 'Backend Router Entry Point',
  contributes: [BackendRouterAPI],

  contribute(shell) {
    const router = Router();

    shell.contribute(BackendRouterAPI, () => ({
      registerRoute: (method, path, handler) => {
        const lowerMethod = method.toLowerCase();

        if (lowerMethod === 'get') {
          router.get(path, handler);
        } else if (lowerMethod === 'post') {
          router.post(path, handler);
        } else if (lowerMethod === 'put') {
          router.put(path, handler);
        } else if (lowerMethod === 'delete') {
          router.delete(path, handler);
        }
      },
      getRouter: () => router,
    }));
  },
};
