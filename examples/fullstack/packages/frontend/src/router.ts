import { SlotKey } from 'modject';
import { PageInfo } from '@fullstack/shared';

export interface RouterAPI {
  registerPage(name: string, path: string, component: React.ComponentType): void;
  getPages(): PageInfo[];
}

export const RouterAPI: SlotKey<RouterAPI> = {
  name: 'Router API',
};
