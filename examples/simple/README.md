# Modject Simple Example

A basic banking application demonstrating core Modject concepts including API definition, entry points, dependency injection, and orchestration.

## Overview

This example implements a simple banking system with three independent modules (Account, Customer, Transaction) and a coordinating module (Banking Operations) that uses them together. It demonstrates:

- **API Definition**: Using `SlotKey` to define typed APIs
- **Entry Points**: Modular components that contribute implementations
- **Dependency Injection**: Accessing APIs through the shell
- **Orchestration**: Coordinating multiple entry points

## Project Structure

```
simple/
├── src/
│   ├── account.ts                           # Account API definition
│   ├── account-entry-point.ts              # Account implementation
│   ├── customer.ts                         # Customer API definition
│   ├── customer-entry-point.ts             # Customer implementation
│   ├── transaction.ts                      # Transaction API definition
│   ├── transaction-entry-point.ts          # Transaction implementation
│   ├── banking-operations-entry-point.ts   # Orchestrating entry point
│   └── index.ts                            # Application setup
├── package.json
└── tsconfig.json
```

## Key Concepts

### 1. API Definition with SlotKey

APIs are defined using `SlotKey`, which creates a typed contract:

```typescript
export interface AccountAPI {
  getAccountNumber(): string;
  getBalance(): number;
  deposit(amount: number): void;
  withdraw(amount: number): void;
}

export const AccountAPI: SlotKey<AccountAPI> = {
  name: 'Account API',
};
```

### 2. Entry Points

Each module is packaged as an entry point that contributes its implementation:

```typescript
export const AccountEntryPoint: EntryPoint = {
  name: 'Account Entry Point',
  contributes: [AccountAPI],
  
  contribute(shell) {
    shell.contribute(AccountAPI, () => {
      let balance = 1000;
      
      return {
        getAccountNumber: () => 'ACC-123456',
        getBalance: () => balance,
        deposit: (amount) => { balance += amount; },
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
```

### 3. Dependency Declaration

Entry points can depend on other APIs using `dependsOn`:

```typescript
export const BankingOperationsEntryPoint: EntryPoint = {
  name: 'Banking Operations Entry Point',
  dependsOn: [AccountAPI, CustomerAPI, TransactionAPI],
  
  run(shell) {
    const account = shell.get(AccountAPI);
    const customer = shell.get(CustomerAPI);
    const transaction = shell.get(TransactionAPI);
    
    // Use the APIs together
  },
};
```

### 4. Orchestration

The orchestrator manages the lifecycle of all entry points:

```typescript
const orchestrator = createOrchestrator();

orchestrator.addEntryPoints([
  AccountEntryPoint,
  CustomerEntryPoint,
  TransactionEntryPoint,
  BankingOperationsEntryPoint,
]);

orchestrator.startEntryPoints('Banking Operations Entry Point');
```

## Running the Example

### Prerequisites

- Node.js >= 18.0.0
- yarn (recommended) or npm

### Installation

```bash
yarn install
```

### Build

```bash
yarn build
```

### Run

```bash
yarn start
```

### Expected Output

```
--- Banking Operations Demo ---
Customer: John Doe (CUST-789)
Account: ACC-123456
Current balance: $1000

Depositing $500...
New balance: $1500

Withdrawing $200...
New balance: $1300

Updating customer email...
New email: john.doe.new@example.com

--- Transaction History ---
TXN-000001: Deposit $500 at 2026-01-10T19:45:14.000Z
TXN-000002: Withdrawal $-200 at 2026-01-10T19:45:14.000Z
```

## How It Works

1. **Setup**: The orchestrator registers all entry points
2. **Contribution Phase**: Entry points that `contribute` APIs provide their implementations
3. **Dependency Resolution**: Modject resolves dependencies between entry points
4. **Execution**: Entry points with `run` methods execute in dependency order
5. **Access**: The `BankingOperationsEntryPoint` retrieves and uses all three APIs

## Learning Points

- **Loose Coupling**: Each module knows only about the APIs it needs, not the implementations
- **Type Safety**: TypeScript ensures API contracts are satisfied
- **Testability**: Each entry point can be tested independently by mocking dependencies
- **Flexibility**: Implementations can be swapped without changing dependent code
- **Clear Dependencies**: The `dependsOn` array explicitly declares what each module needs

## Next Steps

- Explore the [fullstack example](../fullstack) for a more complex multi-package application
- Try modifying the implementations without changing the APIs
- Add new entry points that depend on existing APIs
- Experiment with multiple implementations of the same API
