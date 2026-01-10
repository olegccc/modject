import type { PageInfo } from '@fullstack/shared';
import type { SlotKey } from 'modject';

export interface RouterAPI {
  registerPage(name: string, path: string, component: React.ComponentType): void;
  getPages(): PageInfo[];
}

export const RouterAPI: SlotKey<RouterAPI> = {
  name: 'Router API',
};
