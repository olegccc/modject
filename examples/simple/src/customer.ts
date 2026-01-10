import { SlotKey } from 'modject';

export interface CustomerAPI {
  getCustomerId(): string;
  getFullName(): string;
  getEmail(): string;
  updateEmail(newEmail: string): void;
}

export const CustomerAPI: SlotKey<CustomerAPI> = {
  name: 'Customer API',
};
