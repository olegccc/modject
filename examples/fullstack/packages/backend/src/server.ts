import type { Express } from 'express';
import type { SlotKey } from 'modject';

export interface ServerAPI {
  getApp(): Express;
  start(port: number): void;
}

export const ServerAPI: SlotKey<ServerAPI> = {
  name: 'Server API',
};
