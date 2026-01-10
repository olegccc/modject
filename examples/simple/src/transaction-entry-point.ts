import type { EntryPoint } from 'modject';
import { type Transaction, TransactionAPI } from './transaction';

export const TransactionEntryPoint: EntryPoint = {
  name: 'Transaction Entry Point',
  contributes: [TransactionAPI],

  contribute(shell) {
    shell.contribute(TransactionAPI, () => {
      const transactions: Transaction[] = [];

      let nextId = 1;

      return {
        recordTransaction: (amount, description) => {
          transactions.push({
            id: `TXN-${String(nextId++).padStart(6, '0')}`,
            amount,
            timestamp: new Date(),
            description,
          });
        },
        getTransactions: () => [...transactions],
      };
    });
  },
};
