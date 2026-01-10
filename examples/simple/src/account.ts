import type { SlotKey } from 'modject';

export interface AccountAPI {
  getAccountNumber(): string;
  getBalance(): number;
  deposit(amount: number): void;
  withdraw(amount: number): void;
}

export const AccountAPI: SlotKey<AccountAPI> = {
  name: 'Account API',
};
