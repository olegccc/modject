import { SlotKey } from 'modject';
import { Request, Response, Router } from 'express';

export type RouteHandler = (req: Request, res: Response) => void | Promise<void>;

export interface BackendRouterAPI {
  registerRoute(method: string, path: string, handler: RouteHandler): void;
  getRouter(): Router;
}

export const BackendRouterAPI: SlotKey<BackendRouterAPI> = {
  name: 'Backend Router API',
};
