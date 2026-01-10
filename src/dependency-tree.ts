import type { EntryPoint } from './types';

const checkCircularDependencies = (entryPoints: EntryPoint[]): string[] => {
  const entryPointMap = new Map<string, EntryPoint>();
  for (const ep of entryPoints) {
    entryPointMap.set(ep.name, ep);
  }

  const cycles: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const detectCycle = (epName: string, path: string[]): void => {
    if (visiting.has(epName)) {
      const cycleStart = path.indexOf(epName);
      const cycle = [...path.slice(cycleStart), epName].join(' -> ');
      cycles.push(cycle);
      return;
    }

    if (visited.has(epName)) {
      return;
    }

    const ep = entryPointMap.get(epName);
    if (!ep) {
      return;
    }

    visiting.add(epName);
    path.push(epName);

    const dependsOn = ep.dependsOn ?? [];
    for (const slot of dependsOn) {
      const contributes = ep.contributes ?? [];
      if (contributes.some((s) => s.name === slot.name)) {
        const cycle = `${epName} -> ${slot.name} (self-dependency)`;
        cycles.push(cycle);
        continue;
      }

      for (const otherEp of entryPoints) {
        const otherContributes = otherEp.contributes ?? [];
        if (otherContributes.some((s) => s.name === slot.name)) {
          detectCycle(otherEp.name, path);
        }
      }
    }

    path.pop();
    visiting.delete(epName);
    visited.add(epName);
  };

  for (const ep of entryPoints) {
    if (!visited.has(ep.name)) {
      detectCycle(ep.name, []);
    }
  }

  return cycles;
};

export const createDependencyTree = () => {
  const tree = new Map<string, Set<string>>();

  const addDependency = (parent: string, child: string) => {
    const children = tree.get(parent) ?? new Set();
    if (children.has(child)) {
      throw new Error(`Circular dependency detected: ${parent} -> ${child}`);
    }
    children.add(child);
    if (children.size === 1) {
      tree.set(parent, children);
    }
  };

  const buildTree = (entryPoints: EntryPoint[]) => {
    const cycles = checkCircularDependencies(entryPoints);
    if (cycles.length > 0) {
      throw new Error(
        `Circular dependencies detected:\n${cycles.map((c) => `  - ${c}`).join('\n')}`
      );
    }

    for (const entryPoint of entryPoints) {
      for (const slot of entryPoint.dependsOn ?? []) {
        addDependency(entryPoint.name, slot.name);
      }
      for (const slot of entryPoint.contributes ?? []) {
        addDependency(slot.name, entryPoint.name);
      }
    }
  };

  const findVisitCandidates = (
    targetEntryPoints: Set<string>,
    visitedEntryPoints: Set<string>,
    visitedSlots: Set<string>
  ): string[] => {
    const candidates: Set<string> = new Set();
    const processEntryPoint = (entryPoint: string) => {
      const slots = tree.get(entryPoint);
      if (!visitedEntryPoints.has(entryPoint)) {
        let allSlotsVisited = true;
        if (slots) {
          for (const slot of slots) {
            if (!visitedSlots.has(slot)) {
              allSlotsVisited = false;
              break;
            }
          }
        }
        if (allSlotsVisited) {
          candidates.add(entryPoint);
        }
      }
      if (slots) {
        for (const slot of slots) {
          if (visitedSlots.has(slot)) {
            continue;
          }
          const slotEntryPoints = tree.get(slot);
          slotEntryPoints?.forEach(processEntryPoint);
        }
      }
    };
    for (const entryPoint of targetEntryPoints) {
      processEntryPoint(entryPoint);
    }
    return candidates.size ? [...candidates] : [];
  };

  const findUnVisitCandidates = (
    sourceEntryPoints: Set<string>,
    visitedEntryPoints: Set<string>,
    visitedSlots: Set<string>
  ): string[] => {
    const candidates: Set<string> = new Set();
    const processEntryPoint = (entryPoint: string) => {
      const slots = tree.get(entryPoint);
      if (visitedEntryPoints.has(entryPoint)) {
        let allSlotsUnvisited = true;
        if (slots) {
          for (const slot of slots) {
            if (visitedSlots.has(slot)) {
              allSlotsUnvisited = false;
              break;
            }
          }
        }
        if (allSlotsUnvisited) {
          candidates.add(entryPoint);
        }
      }
      if (slots) {
        for (const slot of slots) {
          if (!visitedSlots.has(slot)) {
            continue;
          }
          const slotEntryPoints = tree.get(slot);
          slotEntryPoints?.forEach(processEntryPoint);
        }
      }
    };
    for (const entryPoint of sourceEntryPoints) {
      processEntryPoint(entryPoint);
    }
    return candidates.size ? [...candidates] : [];
  };

  return {
    buildTree,
    findVisitCandidates,
    findUnVisitCandidates,
    checkCircularDependencies,
  };
};

export type DependencyTree = ReturnType<typeof createDependencyTree>;
