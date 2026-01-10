import { EntryPoint } from 'modject';
import { CustomerAPI } from './customer';

export const CustomerEntryPoint: EntryPoint = {
  name: 'Customer Entry Point',
  contributes: [CustomerAPI],

  contribute(shell) {
    shell.contribute(CustomerAPI, () => {
      let email = 'john.doe@example.com';

      return {
        getCustomerId: () => 'CUST-789',
        getFullName: () => 'John Doe',
        getEmail: () => email,
        updateEmail: (newEmail) => {
          email = newEmail;
        },
      };
    });
  },
};
