import { EntryPoint } from 'modject';
import { AccountAPI } from './account';

export const AccountEntryPoint: EntryPoint = {
  name: 'Account Entry Point',
  contributes: [AccountAPI],

  contribute(shell) {
    shell.contribute(AccountAPI, () => {
      let balance = 1000;

      return {
        getAccountNumber: () => 'ACC-123456',
        getBalance: () => balance,
        deposit: (amount) => {
          balance += amount;
        },
        withdraw: (amount) => {
          if (amount > balance) {
            throw new Error('Insufficient funds');
          }
          balance -= amount;
        },
      };
    });
  },
};
