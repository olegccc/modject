import type { Request, Response, Router } from 'express';
import type { SlotKey } from 'modject';

export type RouteHandler = (req: Request, res: Response) => void | Promise<void>;

export interface BackendRouterAPI {
  registerRoute(method: string, path: string, handler: RouteHandler): void;
  getRouter(): Router;
}

export const BackendRouterAPI: SlotKey<BackendRouterAPI> = {
  name: 'Backend Router API',
};
