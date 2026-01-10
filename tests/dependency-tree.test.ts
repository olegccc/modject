import { createDependencyTree } from '../src/dependency-tree';
import type { EntryPoint, SlotKey } from '../src/types';

describe('DependencyTree', () => {
  describe('buildTree', () => {
    it('should build tree with simple linear dependencies', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slot1] },
        { name: 'ep2', dependsOn: [slot1] },
      ];

      expect(() => tree.buildTree(entryPoints)).not.toThrow();
    });

    it('should build tree with multiple slots per entry point', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const slot2: SlotKey<unknown> = { name: 'slot2' };
      const slot3: SlotKey<unknown> = { name: 'slot3' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slot1, slot2] },
        { name: 'ep2', dependsOn: [slot1, slot2], contributes: [slot3] },
      ];

      expect(() => tree.buildTree(entryPoints)).not.toThrow();
    });

    it('should build tree with complex dependency graph', () => {
      const tree = createDependencyTree();
      const slotA: SlotKey<unknown> = { name: 'slotA' };
      const slotB: SlotKey<unknown> = { name: 'slotB' };
      const slotC: SlotKey<unknown> = { name: 'slotC' };
      const slotD: SlotKey<unknown> = { name: 'slotD' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slotA] },
        { name: 'ep2', contributes: [slotB] },
        { name: 'ep3', dependsOn: [slotA, slotB], contributes: [slotC] },
        { name: 'ep4', dependsOn: [slotC], contributes: [slotD] },
        { name: 'ep5', dependsOn: [slotD] },
      ];

      expect(() => tree.buildTree(entryPoints)).not.toThrow();
    });

    it('should build tree with entry points that have no dependencies or contributions', () => {
      const tree = createDependencyTree();
      const entryPoints: EntryPoint[] = [{ name: 'ep1' }, { name: 'ep2' }, { name: 'ep3' }];

      expect(() => tree.buildTree(entryPoints)).not.toThrow();
    });
  });

  describe('findVisitCandidates', () => {
    it('should find entry point with no dependencies as candidate', () => {
      const tree = createDependencyTree();
      const entryPoints: EntryPoint[] = [{ name: 'ep1' }];
      tree.buildTree(entryPoints);

      const candidates = tree.findVisitCandidates(new Set(['ep1']), new Set(), new Set());

      expect(candidates).toContain('ep1');
    });

    it('should find entry point when all dependencies are visited', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slot1] },
        { name: 'ep2', dependsOn: [slot1] },
      ];
      tree.buildTree(entryPoints);

      const candidates = tree.findVisitCandidates(new Set(['ep2']), new Set(), new Set(['slot1']));

      expect(candidates).toContain('ep2');
    });

    it('should not find entry point when dependencies are not visited', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slot1] },
        { name: 'ep2', dependsOn: [slot1] },
      ];
      tree.buildTree(entryPoints);

      const candidates = tree.findVisitCandidates(new Set(['ep2']), new Set(), new Set());

      expect(candidates).not.toContain('ep2');
    });

    it('should not find already visited entry points', () => {
      const tree = createDependencyTree();
      const entryPoints: EntryPoint[] = [{ name: 'ep1' }];
      tree.buildTree(entryPoints);

      const candidates = tree.findVisitCandidates(new Set(['ep1']), new Set(['ep1']), new Set());

      expect(candidates).not.toContain('ep1');
    });

    it('should find multiple candidates in correct order', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const slot2: SlotKey<unknown> = { name: 'slot2' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slot1] },
        { name: 'ep2', contributes: [slot2] },
        { name: 'ep3', dependsOn: [slot1] },
        { name: 'ep4', dependsOn: [slot2] },
      ];
      tree.buildTree(entryPoints);

      const candidates = tree.findVisitCandidates(
        new Set(['ep3', 'ep4']),
        new Set(),
        new Set(['slot1', 'slot2'])
      );

      expect(candidates).toContain('ep3');
      expect(candidates).toContain('ep4');
      expect(candidates).toHaveLength(2);
    });

    it('should handle entry points with multiple dependencies', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const slot2: SlotKey<unknown> = { name: 'slot2' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slot1] },
        { name: 'ep2', contributes: [slot2] },
        { name: 'ep3', dependsOn: [slot1, slot2] },
      ];
      tree.buildTree(entryPoints);

      const candidatesPartial = tree.findVisitCandidates(
        new Set(['ep3']),
        new Set(),
        new Set(['slot1'])
      );
      expect(candidatesPartial).not.toContain('ep3');

      const candidatesFull = tree.findVisitCandidates(
        new Set(['ep3']),
        new Set(),
        new Set(['slot1', 'slot2'])
      );
      expect(candidatesFull).toContain('ep3');
    });

    it('should find transitive candidates even when target is visited', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slot1] },
        { name: 'ep2', dependsOn: [slot1] },
      ];
      tree.buildTree(entryPoints);

      const candidates = tree.findVisitCandidates(new Set(['ep2']), new Set(['ep2']), new Set());

      expect(candidates).toContain('ep1');
    });

    it('should find transitive dependencies through unvisited slots', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const slot2: SlotKey<unknown> = { name: 'slot2' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slot1] },
        { name: 'ep2', dependsOn: [slot1], contributes: [slot2] },
        { name: 'ep3', dependsOn: [slot2] },
      ];
      tree.buildTree(entryPoints);

      const candidates = tree.findVisitCandidates(
        new Set(['ep2', 'ep3']),
        new Set(),
        new Set(['slot1'])
      );

      expect(candidates).toContain('ep2');
    });
  });

  describe('findUnVisitCandidates', () => {
    it('should find visited entry point with no unvisited slots', () => {
      const tree = createDependencyTree();
      const entryPoints: EntryPoint[] = [{ name: 'ep1' }];
      tree.buildTree(entryPoints);

      const candidates = tree.findUnVisitCandidates(new Set(['ep1']), new Set(['ep1']), new Set());

      expect(candidates).toContain('ep1');
    });

    it('should find entry point when all its slot dependencies are unvisited', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slot1] },
        { name: 'ep2', dependsOn: [slot1] },
      ];
      tree.buildTree(entryPoints);

      const candidates = tree.findUnVisitCandidates(new Set(['ep2']), new Set(['ep2']), new Set());

      expect(candidates).toContain('ep2');
    });

    it('should not find entry point when some slots are still visited', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slot1] },
        { name: 'ep2', dependsOn: [slot1] },
      ];
      tree.buildTree(entryPoints);

      const candidates = tree.findUnVisitCandidates(
        new Set(['ep2']),
        new Set(['ep2']),
        new Set(['slot1'])
      );

      expect(candidates).not.toContain('ep2');
    });

    it('should not find unvisited entry points', () => {
      const tree = createDependencyTree();
      const entryPoints: EntryPoint[] = [{ name: 'ep1' }];
      tree.buildTree(entryPoints);

      const candidates = tree.findUnVisitCandidates(new Set(['ep1']), new Set(), new Set());

      expect(candidates).not.toContain('ep1');
    });

    it('should find multiple unvisit candidates', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const slot2: SlotKey<unknown> = { name: 'slot2' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slot1] },
        { name: 'ep2', contributes: [slot2] },
        { name: 'ep3', dependsOn: [slot1] },
        { name: 'ep4', dependsOn: [slot2] },
      ];
      tree.buildTree(entryPoints);

      const candidates = tree.findUnVisitCandidates(
        new Set(['ep3', 'ep4']),
        new Set(['ep3', 'ep4']),
        new Set()
      );

      expect(candidates).toContain('ep3');
      expect(candidates).toContain('ep4');
      expect(candidates).toHaveLength(2);
    });

    it('should handle entry points with multiple dependencies', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const slot2: SlotKey<unknown> = { name: 'slot2' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slot1] },
        { name: 'ep2', contributes: [slot2] },
        { name: 'ep3', dependsOn: [slot1, slot2] },
      ];
      tree.buildTree(entryPoints);

      const candidatesPartial = tree.findUnVisitCandidates(
        new Set(['ep3']),
        new Set(['ep3']),
        new Set(['slot1'])
      );
      expect(candidatesPartial).not.toContain('ep3');

      const candidatesFull = tree.findUnVisitCandidates(
        new Set(['ep3']),
        new Set(['ep3']),
        new Set()
      );
      expect(candidatesFull).toContain('ep3');
    });

    it('should return empty array when no candidates found', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slot1] },
        { name: 'ep2', dependsOn: [slot1] },
      ];
      tree.buildTree(entryPoints);

      const candidates = tree.findUnVisitCandidates(new Set(['ep2']), new Set(), new Set());

      expect(candidates).toEqual([]);
    });

    it('should find transitive unvisit candidates through visited slots', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const slot2: SlotKey<unknown> = { name: 'slot2' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slot1] },
        { name: 'ep2', dependsOn: [slot1], contributes: [slot2] },
        { name: 'ep3', dependsOn: [slot2] },
      ];
      tree.buildTree(entryPoints);

      const candidates = tree.findUnVisitCandidates(
        new Set(['ep2', 'ep3']),
        new Set(['ep3', 'ep2']),
        new Set(['slot2'])
      );

      expect(candidates).toContain('ep2');
    });
  });

  describe('integration tests', () => {
    it('should support visit and unvisit workflow', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const slot2: SlotKey<unknown> = { name: 'slot2' };
      const entryPoints: EntryPoint[] = [
        { name: 'ep1', contributes: [slot1] },
        { name: 'ep2', dependsOn: [slot1], contributes: [slot2] },
        { name: 'ep3', dependsOn: [slot2] },
      ];
      tree.buildTree(entryPoints);

      const visitedEps = new Set<string>();
      const visitedSlots = new Set<string>();

      const visit1 = tree.findVisitCandidates(
        new Set(['ep1', 'ep2', 'ep3']),
        visitedEps,
        visitedSlots
      );
      expect(visit1).toContain('ep1');
      visitedEps.add('ep1');
      visitedSlots.add('slot1');

      const visit2 = tree.findVisitCandidates(
        new Set(['ep1', 'ep2', 'ep3']),
        visitedEps,
        visitedSlots
      );
      expect(visit2).toContain('ep2');
      visitedEps.add('ep2');
      visitedSlots.add('slot2');

      const visit3 = tree.findVisitCandidates(
        new Set(['ep1', 'ep2', 'ep3']),
        visitedEps,
        visitedSlots
      );
      expect(visit3).toContain('ep3');
      visitedEps.add('ep3');

      const unvisit1 = tree.findUnVisitCandidates(
        new Set(['ep1', 'ep2', 'ep3']),
        visitedEps,
        visitedSlots
      );
      expect(unvisit1).toContain('ep1');
      visitedEps.delete('ep1');
      visitedSlots.delete('slot1');

      const unvisit2 = tree.findUnVisitCandidates(
        new Set(['ep1', 'ep2', 'ep3']),
        visitedEps,
        visitedSlots
      );
      expect(unvisit2).toContain('ep2');
      visitedEps.delete('ep2');
      visitedSlots.delete('slot2');

      const unvisit3 = tree.findUnVisitCandidates(
        new Set(['ep1', 'ep2', 'ep3']),
        visitedEps,
        visitedSlots
      );
      expect(unvisit3).toContain('ep3');
    });

    it('should handle complex dependency graph with branching', () => {
      const tree = createDependencyTree();
      const slotA: SlotKey<unknown> = { name: 'slotA' };
      const slotB: SlotKey<unknown> = { name: 'slotB' };
      const slotC: SlotKey<unknown> = { name: 'slotC' };
      const slotD: SlotKey<unknown> = { name: 'slotD' };
      const entryPoints: EntryPoint[] = [
        { name: 'root', contributes: [slotA] },
        { name: 'branch1', dependsOn: [slotA], contributes: [slotB] },
        { name: 'branch2', dependsOn: [slotA], contributes: [slotC] },
        { name: 'leaf1', dependsOn: [slotB] },
        { name: 'leaf2', dependsOn: [slotC] },
        { name: 'merge', dependsOn: [slotB, slotC], contributes: [slotD] },
      ];
      tree.buildTree(entryPoints);

      const visitedEps = new Set<string>();
      const visitedSlots = new Set<string>();

      let candidates = tree.findVisitCandidates(
        new Set(['root', 'branch1', 'branch2', 'leaf1', 'leaf2', 'merge']),
        visitedEps,
        visitedSlots
      );
      expect(candidates).toContain('root');
      visitedEps.add('root');
      visitedSlots.add('slotA');

      candidates = tree.findVisitCandidates(
        new Set(['root', 'branch1', 'branch2', 'leaf1', 'leaf2', 'merge']),
        visitedEps,
        visitedSlots
      );
      expect(candidates).toContain('branch1');
      expect(candidates).toContain('branch2');
      visitedEps.add('branch1');
      visitedEps.add('branch2');
      visitedSlots.add('slotB');
      visitedSlots.add('slotC');

      candidates = tree.findVisitCandidates(
        new Set(['root', 'branch1', 'branch2', 'leaf1', 'leaf2', 'merge']),
        visitedEps,
        visitedSlots
      );
      expect(candidates).toContain('leaf1');
      expect(candidates).toContain('leaf2');
      expect(candidates).toContain('merge');
    });
  });
});
