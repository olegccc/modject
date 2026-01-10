import { SlotKey } from 'modject';

export type Transaction = {
  id: string;
  amount: number;
  timestamp: Date;
  description: string;
};

export interface TransactionAPI {
  recordTransaction(amount: number, description: string): void;
  getTransactions(): Transaction[];
}

export const TransactionAPI: SlotKey<TransactionAPI> = {
  name: 'Transaction API',
};
