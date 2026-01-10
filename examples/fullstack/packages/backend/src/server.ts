import { SlotKey } from 'modject';
import { Express } from 'express';

export interface ServerAPI {
  getApp(): Express;
  start(port: number): void;
}

export const ServerAPI: SlotKey<ServerAPI> = {
  name: 'Server API',
};
