import { EntryPoint, RunShell } from 'modject';
import { AccountAPI } from './account';
import { CustomerAPI } from './customer';
import { TransactionAPI } from './transaction';

export const BankingOperationsEntryPoint: EntryPoint = {
  name: 'Banking Operations Entry Point',
  dependsOn: [AccountAPI, CustomerAPI, TransactionAPI],

  run(shell) {
    const account = shell.get(AccountAPI);
    const customer = shell.get(CustomerAPI);
    const transaction = shell.get(TransactionAPI);

    console.log('\n--- Banking Operations Demo ---');
    console.log(`Customer: ${customer.getFullName()} (${customer.getCustomerId()})`);
    console.log(`Account: ${account.getAccountNumber()}`);
    console.log(`Current balance: $${account.getBalance()}`);

    console.log('\nDepositing $500...');
    account.deposit(500);
    transaction.recordTransaction(500, 'Deposit');
    console.log(`New balance: $${account.getBalance()}`);

    console.log('\nWithdrawing $200...');
    account.withdraw(200);
    transaction.recordTransaction(-200, 'Withdrawal');
    console.log(`New balance: $${account.getBalance()}`);

    console.log('\nUpdating customer email...');
    customer.updateEmail('john.doe.new@example.com');
    console.log(`New email: ${customer.getEmail()}`);

    console.log('\n--- Transaction History ---');
    const transactions = transaction.getTransactions();
    transactions.forEach((txn) => {
      console.log(`${txn.id}: ${txn.description} $${txn.amount} at ${txn.timestamp.toISOString()}`);
    });
  },
};
