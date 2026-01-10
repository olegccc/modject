export interface SlotKey<T> {
  readonly name: string;
  readonly public?: boolean;
  readonly multi?: boolean;
  readonly empty?: T; // Holds no value, only triggers type-checking of T
  readonly layer?: string;
}

export interface RunShell {
  get<T>(key: SlotKey<T>): T;
}

export interface ContributeShell {
  contribute<T>(key: SlotKey<T>, factory: (shell: RunShell) => T): void;
}

export interface WithdrawShell {
  withdraw<T>(key: SlotKey<T>): void;
}

export interface EntryPoint {
  readonly name: string;
  readonly layer?: string;
  readonly contributes?: SlotKey<unknown>[];
  readonly dependsOn?: SlotKey<unknown>[];
  contribute?(shell: ContributeShell): void;
  run?(shell: RunShell): void;
  withdraw?(shell: WithdrawShell): void;
}

export interface EntryPointOrchestrator {
  addEntryPoints(entryPoints: EntryPoint[]): void;
  removeEntryPoints(names: string[]): void;
  defineLayers(layers: string[]): void;
  startEntryPoints(
    entryPointNamesOrName: string[] | string,
    onStarted?: (shell: RunShell) => void
  ): void;
  stopEntryPoints(entryPointNames: string[], onStopped?: () => void): void;
  stopAllEntryPoints(onStopped?: () => void): void;
  getStartedEntryPoints(): string[];
}
