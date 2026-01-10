import { createDependencyTree } from '../src/dependency-tree';
import type { EntryPoint, SlotKey } from '../src/types';

describe('Circular Dependencies Detection', () => {
  describe('checkCircularDependencies', () => {
    it('should return empty array for entry points with no dependencies', () => {
      const tree = createDependencyTree();
      const entryPoints: EntryPoint[] = [{ name: 'ep1' }, { name: 'ep2' }];

      const cycles = tree.checkCircularDependencies(entryPoints);
      expect(cycles).toHaveLength(0);
    });

    it('should return empty array for linear dependency chain', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const slot2: SlotKey<unknown> = { name: 'slot2' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slot1] },
        { name: 'ep2', dependsOn: [slot1], contributes: [slot2] },
        { name: 'ep3', dependsOn: [slot2] },
      ];

      const cycles = tree.checkCircularDependencies(entryPoints);
      expect(cycles).toHaveLength(0);
    });

    it('should detect simple two-entry-point cycle', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const slot2: SlotKey<unknown> = { name: 'slot2' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', dependsOn: [slot2], contributes: [slot1] },
        { name: 'ep2', dependsOn: [slot1], contributes: [slot2] },
      ];

      const cycles = tree.checkCircularDependencies(entryPoints);
      expect(cycles.length).toBeGreaterThan(0);
      expect(cycles.some((c) => c.includes('ep1') && c.includes('ep2'))).toBe(true);
    });

    it('should detect three-entry-point cycle', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const slot2: SlotKey<unknown> = { name: 'slot2' };
      const slot3: SlotKey<unknown> = { name: 'slot3' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', dependsOn: [slot3], contributes: [slot1] },
        { name: 'ep2', dependsOn: [slot1], contributes: [slot2] },
        { name: 'ep3', dependsOn: [slot2], contributes: [slot3] },
      ];

      const cycles = tree.checkCircularDependencies(entryPoints);
      expect(cycles.length).toBeGreaterThan(0);
      expect(cycles.some((c) => c.includes('ep1') && c.includes('ep2') && c.includes('ep3'))).toBe(
        true
      );
    });

    it('should detect self-dependency', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const entryPoints: EntryPoint[] = [{ name: 'ep1', dependsOn: [slot1], contributes: [slot1] }];

      const cycles = tree.checkCircularDependencies(entryPoints);
      expect(cycles.length).toBeGreaterThan(0);
      expect(cycles.some((c) => c.includes('self-dependency'))).toBe(true);
    });

    it('should detect multiple independent cycles', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const slot2: SlotKey<unknown> = { name: 'slot2' };
      const slot3: SlotKey<unknown> = { name: 'slot3' };
      const slot4: SlotKey<unknown> = { name: 'slot4' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', dependsOn: [slot2], contributes: [slot1] },
        { name: 'ep2', dependsOn: [slot1], contributes: [slot2] },
        { name: 'ep3', dependsOn: [slot4], contributes: [slot3] },
        { name: 'ep4', dependsOn: [slot3], contributes: [slot4] },
      ];

      const cycles = tree.checkCircularDependencies(entryPoints);
      expect(cycles.length).toBeGreaterThan(1);
    });

    it('should not report cycle for diamond dependency pattern', () => {
      const tree = createDependencyTree();
      const slotA: SlotKey<unknown> = { name: 'slotA' };
      const slotB: SlotKey<unknown> = { name: 'slotB' };
      const slotC: SlotKey<unknown> = { name: 'slotC' };
      const entryPoints: EntryPoint[] = [
        { name: 'top', contributes: [slotA] },
        { name: 'left', dependsOn: [slotA], contributes: [slotB] },
        { name: 'right', dependsOn: [slotA], contributes: [slotC] },
        { name: 'bottom', dependsOn: [slotB, slotC] },
      ];

      const cycles = tree.checkCircularDependencies(entryPoints);
      expect(cycles).toHaveLength(0);
    });

    it('should detect cycle within larger dependency graph', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const slot2: SlotKey<unknown> = { name: 'slot2' };
      const slot3: SlotKey<unknown> = { name: 'slot3' };
      const slot4: SlotKey<unknown> = { name: 'slot4' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slot1] },
        { name: 'ep2', dependsOn: [slot1], contributes: [slot2] },
        { name: 'ep3', dependsOn: [slot4], contributes: [slot3] },
        { name: 'ep4', dependsOn: [slot3], contributes: [slot4] },
        { name: 'ep5', dependsOn: [slot2] },
      ];

      const cycles = tree.checkCircularDependencies(entryPoints);
      expect(cycles.length).toBeGreaterThan(0);
      expect(cycles.some((c) => c.includes('ep3') && c.includes('ep4'))).toBe(true);
      expect(cycles.every((c) => !c.includes('ep1') || !c.includes('ep2'))).toBe(true);
    });
  });

  describe('buildTree with circular dependency validation', () => {
    it('should throw error when building tree with circular dependencies', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const slot2: SlotKey<unknown> = { name: 'slot2' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', dependsOn: [slot2], contributes: [slot1] },
        { name: 'ep2', dependsOn: [slot1], contributes: [slot2] },
      ];

      expect(() => tree.buildTree(entryPoints)).toThrow('Circular dependencies detected');
    });

    it('should build tree successfully when no circular dependencies', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const slot2: SlotKey<unknown> = { name: 'slot2' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slot1] },
        { name: 'ep2', dependsOn: [slot1], contributes: [slot2] },
        { name: 'ep3', dependsOn: [slot2] },
      ];

      expect(() => tree.buildTree(entryPoints)).not.toThrow();
    });

    it('should include cycle details in error message', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const slot2: SlotKey<unknown> = { name: 'slot2' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', dependsOn: [slot2], contributes: [slot1] },
        { name: 'ep2', dependsOn: [slot1], contributes: [slot2] },
      ];

      try {
        tree.buildTree(entryPoints);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('ep1');
        expect((error as Error).message).toContain('ep2');
      }
    });

    it('should throw error for self-dependency', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const entryPoints: EntryPoint[] = [{ name: 'ep1', dependsOn: [slot1], contributes: [slot1] }];

      expect(() => tree.buildTree(entryPoints)).toThrow('Circular dependencies detected');
      expect(() => tree.buildTree(entryPoints)).toThrow('self-dependency');
    });
  });
});
