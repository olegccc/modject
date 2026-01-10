import type {
  ContributeShell,
  EntryPoint,
  EntryPointOrchestrator,
  RunShell,
  SlotKey,
  WithdrawShell,
} from './types';
import { createDependencyTree, DependencyTree } from './dependency-tree';

export const createOrchestrator = (): EntryPointOrchestrator => {
  const entryPoints: Map<string, EntryPoint> = new Map();
  let layers: string[] = [];
  const visitedEntryPoints: Set<string> = new Set();
  const slotFactories: Map<string, () => unknown> = new Map();
  const visitedSlots: Set<string> = new Set();
  let pendingStartEntryPoints: Set<string> = new Set();
  let pendingStopEntryPoints: Set<string> = new Set();

  const finalRunShell: RunShell = {
    get: <T>(key: SlotKey<T>) => {
      const factory = slotFactories.get(key.name);
      if (!factory) {
        throw new Error(`Slot ${key.name} is not contributed`);
      }
      return factory() as T;
    },
  };

  const getLayerLevel = (layer: string) => layers.indexOf(layer);

  const validateEntryPoint = (entryPoint: EntryPoint) => {
    if (entryPoint.layer && !layers.includes(entryPoint.layer)) {
      throw new Error(`Layer ${entryPoint.layer} is not defined`);
    }
    if (!entryPoint.layer && layers.length) {
      throw new Error('Entry point must define a layer');
    }
    if (layers.length && entryPoint.layer) {
      const layerLevel = getLayerLevel(entryPoint.layer);
      for (const dependency of entryPoint.dependsOn ?? []) {
        if (dependency.layer !== entryPoint.layer && dependency.layer) {
          const dependencyLayerLevel = getLayerLevel(dependency.layer);
          if (dependencyLayerLevel > layerLevel) {
            throw new Error(
              `Entry point ${entryPoint.name}(layer ${entryPoint.layer}) cannot depend on ${dependency.name} (layer ${dependency.layer})`
            );
          }
        }
      }
    }
  };

  const addEntryPoints: EntryPointOrchestrator['addEntryPoints'] = (
    newEntryPoints: EntryPoint[]
  ) => {
    if (pendingStartEntryPoints.size || pendingStopEntryPoints.size) {
      throw new Error('Cannot add entry points when starting or stopping entry points');
    }
    for (const entryPoint of newEntryPoints) {
      validateEntryPoint(entryPoint);
      entryPoints.set(entryPoint.name, entryPoint);
    }
  };

  const defineLayers: EntryPointOrchestrator['defineLayers'] = (layersToBe) => {
    if (entryPoints.size) {
      throw new Error('Cannot define layers after adding entry points');
    }
    if (pendingStartEntryPoints.size || pendingStopEntryPoints.size) {
      throw new Error('Cannot define layers when starting or stopping entry points');
    }
    layers = layersToBe;
  };

  const getStartedEntryPoints: EntryPointOrchestrator['getStartedEntryPoints'] = () =>
    visitedEntryPoints.size ? [...visitedEntryPoints] : [];

  const removeEntryPoints: EntryPointOrchestrator['removeEntryPoints'] = (names) => {
    if (pendingStartEntryPoints.size || pendingStopEntryPoints.size) {
      throw new Error('Cannot remove entry points when starting or stopping entry points');
    }
    for (const name of names) {
      entryPoints.delete(name);
    }
  };

  const startEntryPoints: EntryPointOrchestrator['startEntryPoints'] = (
    entryPointNamesOrName,
    onStarted
  ) => {
    if (pendingStartEntryPoints.size || pendingStopEntryPoints.size) {
      throw new Error('Cannot start entry points when starting or stopping entry points');
    }

    pendingStartEntryPoints = new Set<string>(
      Array.isArray(entryPointNamesOrName) ? entryPointNamesOrName : [entryPointNamesOrName]
    );

    if (pendingStartEntryPoints.size === 0) {
      onStarted?.(finalRunShell);
      return;
    }

    let onStartedCallback = onStarted;

    const dependencyTree = createDependencyTree();
    dependencyTree.buildTree(Array.from(entryPoints.values()));

    const createContributeShell = (entryPoint: EntryPoint): ContributeShell => {
      const remainingSlots: Set<string> = new Set(
        entryPoint.contributes?.map((key) => key.name) ?? []
      );
      const runShell = createRunShell(entryPoint);
      return {
        contribute: (key, factory) => {
          if (!remainingSlots.has(key.name)) {
            throw new Error(
              `Slot ${key.name} is not contributed by entry point ${entryPoint.name}`
            );
          }
          remainingSlots.delete(key.name);
          visitedSlots.add(key.name);
          let instance: unknown | undefined;
          slotFactories.set(key.name, () => {
            if (key.multi) {
              return factory(runShell);
            }
            instance = instance ?? factory(runShell);
            return instance;
          });
          nextEntryPoints();
        },
      };
    };

    const createRunShell = (entryPoint: EntryPoint): RunShell => {
      const dependencies = new Set<string>(entryPoint.dependsOn?.map((key) => key.name) ?? []);
      return {
        get: <T>(key: SlotKey<T>) => {
          if (!dependencies.has(key.name)) {
            throw new Error(
              `Slot ${key.name} is not declared as dependency by entry point ${entryPoint.name}`
            );
          }
          return slotFactories.get(key.name)!() as T;
        },
      };
    };

    const visitEntryPoint = (entryPoint: EntryPoint) => {
      visitedEntryPoints.add(entryPoint.name);

      if (entryPoint.run) {
        entryPoint.run(createRunShell(entryPoint));
      }

      if (entryPoint.contribute) {
        const contributeShell = createContributeShell(entryPoint);
        entryPoint.contribute(contributeShell);
      }

      if (pendingStartEntryPoints.has(entryPoint.name)) {
        pendingStartEntryPoints.delete(entryPoint.name);
        if (pendingStartEntryPoints.size === 0) {
          onStartedCallback?.(finalRunShell);
          onStartedCallback = undefined;
        }
      }
    };

    const nextEntryPoints = () => {
      const entryPointsToVisit = dependencyTree.findVisitCandidates(
        pendingStartEntryPoints,
        visitedEntryPoints,
        visitedSlots
      );

      for (const entryPointName of entryPointsToVisit) {
        const entryPoint = entryPoints.get(entryPointName);
        if (!entryPoint) {
          throw new Error(`Entry point ${entryPointName} does not exist`);
        }
        visitEntryPoint(entryPoint);
      }
    };

    nextEntryPoints();
  };

  const stopEntryPoints: EntryPointOrchestrator['stopEntryPoints'] = (
    entryPointNames,
    onStopped
  ) => {
    if (pendingStartEntryPoints.size || pendingStopEntryPoints.size) {
      throw new Error('Cannot stop entry points when starting or stopping entry points');
    }

    pendingStopEntryPoints = new Set<string>(entryPointNames);

    if (pendingStopEntryPoints.size === 0) {
      onStopped?.();
      return;
    }

    let onStoppedCallback = onStopped;

    const dependencyTree = createDependencyTree();
    dependencyTree.buildTree(Array.from(entryPoints.values()));

    const createWithdrawShell = (entryPoint: EntryPoint): WithdrawShell => {
      const remainingSlots: Set<string> = new Set(
        entryPoint.contributes?.map((key) => key.name) ?? []
      );
      return {
        withdraw: (key) => {
          if (!remainingSlots.has(key.name)) {
            throw new Error(
              `Slot ${key.name} is not contributed by entry point ${entryPoint.name}`
            );
          }
          remainingSlots.delete(key.name);
          visitedSlots.delete(key.name);
          slotFactories.delete(key.name);
          nextEntryPoints();
        },
      };
    };

    const visitEntryPoint = (entryPoint: EntryPoint) => {
      visitedEntryPoints.delete(entryPoint.name);

      if (entryPoint.withdraw) {
        const withdrawShell = createWithdrawShell(entryPoint);
        entryPoint.withdraw(withdrawShell);
      }

      if (pendingStopEntryPoints.has(entryPoint.name)) {
        pendingStopEntryPoints.delete(entryPoint.name);
        if (pendingStopEntryPoints.size === 0) {
          onStoppedCallback?.();
          onStoppedCallback = undefined;
        }
      }
    };

    const nextEntryPoints = () => {
      const entryPointsToVisit = dependencyTree.findUnVisitCandidates(
        pendingStopEntryPoints,
        visitedEntryPoints,
        visitedSlots
      );

      for (const entryPointName of entryPointsToVisit) {
        const entryPoint = entryPoints.get(entryPointName);
        if (!entryPoint) {
          throw new Error(`Entry point ${entryPointName} does not exist`);
        }
        visitEntryPoint(entryPoint);
      }
    };

    nextEntryPoints();
  };

  const stopAllEntryPoints: EntryPointOrchestrator['stopAllEntryPoints'] = (onStopped) => {
    stopEntryPoints(getStartedEntryPoints(), onStopped);
  };

  return {
    addEntryPoints,
    defineLayers,
    getStartedEntryPoints,
    removeEntryPoints,
    startEntryPoints,
    stopAllEntryPoints,
    stopEntryPoints,
  };
};
