import { createOrchestrator } from 'modject';
import { AccountEntryPoint } from './account-entry-point';
import { BankingOperationsEntryPoint } from './banking-operations-entry-point';
import { CustomerEntryPoint } from './customer-entry-point';
import { TransactionEntryPoint } from './transaction-entry-point';

const orchestrator = createOrchestrator();

orchestrator.addEntryPoints([
  AccountEntryPoint,
  CustomerEntryPoint,
  TransactionEntryPoint,
  BankingOperationsEntryPoint,
]);

orchestrator.startEntryPoints('Banking Operations Entry Point');
