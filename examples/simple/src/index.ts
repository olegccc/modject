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

// notice that only one entry point is started here - all other entry points will be started as BankingOperationsEntryPoint depends on them
orchestrator.startEntryPoints('Banking Operations Entry Point');
