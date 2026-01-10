import type { SlotKey } from 'modject';

export interface RenderAPI {
  render(): void;
}

export const RenderAPI: SlotKey<RenderAPI> = {
  name: 'Render API',
};
