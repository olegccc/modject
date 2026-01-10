import { createDependencyTree } from '../src/dependency-tree';
import { createOrchestrator } from '../src/orchestrator';
import type { EntryPoint, SlotKey } from '../src/types';

describe('Edge Cases and Error Paths', () => {
  describe('Orchestrator - entry point validation', () => {
    it('should throw error when entry point has no name', () => {
      const orchestrator = createOrchestrator();

      expect(() => orchestrator.addEntryPoints([{ name: '' } as EntryPoint])).toThrow(
        'Entry point must have a name'
      );
    });
  });

  describe('Orchestrator - finalRunShell', () => {
    it('should throw error when accessing non-contributed slot via onStarted callback', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<string> = { name: 'slot1' };
      orchestrator.addEntryPoints([{ name: 'ep1' }]);

      orchestrator.startEntryPoints('ep1', (shell) => {
        expect(() => shell.get(slot)).toThrow('Slot slot1 is not contributed');
      });
    });

    it('should successfully get a contributed slot from finalRunShell', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<string> = { name: 'slot1' };
      let receivedValue: string | undefined;

      orchestrator.addEntryPoints([
        {
          name: 'provider',
          contributes: [slot],
          contribute: (api) => api.contribute(slot, () => 'test-value'),
        },
      ]);

      orchestrator.startEntryPoints('provider', (shell) => {
        receivedValue = shell.get(slot);
      });

      expect(receivedValue).toBe('test-value');
    });
  });

  describe('Orchestrator - concurrent operation protection', () => {
    it('should throw error when adding entry points while starting', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<string> = { name: 'slot1' };

      orchestrator.addEntryPoints([
        {
          name: 'ep1',
          contributes: [slot],
          contribute: (api) => {
            expect(() => orchestrator.addEntryPoints([{ name: 'ep2' }])).toThrow(
              'Cannot add entry points when starting or stopping entry points'
            );
            api.contribute(slot, () => 'value');
          },
        },
      ]);

      orchestrator.startEntryPoints('ep1');
    });

    it('should throw error when removing entry points while starting', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<string> = { name: 'slot1' };

      orchestrator.addEntryPoints([
        {
          name: 'ep1',
          contributes: [slot],
          contribute: (api) => {
            expect(() => orchestrator.removeEntryPoints(['ep1'])).toThrow(
              'Cannot remove entry points when starting or stopping entry points'
            );
            api.contribute(slot, () => 'value');
          },
        },
      ]);

      orchestrator.startEntryPoints('ep1');
    });

    it('should throw error when starting entry points while already starting', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<string> = { name: 'slot1' };

      orchestrator.addEntryPoints([
        {
          name: 'ep1',
          contributes: [slot],
          contribute: (api) => {
            expect(() => orchestrator.startEntryPoints('ep1')).toThrow(
              'Cannot start entry points when starting or stopping entry points'
            );
            api.contribute(slot, () => 'value');
          },
        },
      ]);

      orchestrator.startEntryPoints('ep1');
    });

    it('should throw error when stopping entry points while starting', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<string> = { name: 'slot1' };

      orchestrator.addEntryPoints([
        {
          name: 'ep1',
          contributes: [slot],
          contribute: (api) => {
            expect(() => orchestrator.stopEntryPoints(['ep1'])).toThrow(
              'Cannot stop entry points when starting or stopping entry points'
            );
            api.contribute(slot, () => 'value');
          },
        },
      ]);

      orchestrator.startEntryPoints('ep1');
    });

    it('should throw error when adding entry points while stopping', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<string> = { name: 'slot1' };

      orchestrator.addEntryPoints([
        {
          name: 'ep1',
          contributes: [slot],
          contribute: (api) => api.contribute(slot, () => 'value'),
          withdraw: (api) => {
            expect(() => orchestrator.addEntryPoints([{ name: 'ep2' }])).toThrow(
              'Cannot add entry points when starting or stopping entry points'
            );
            api.withdraw(slot);
          },
        },
      ]);

      orchestrator.startEntryPoints('ep1');
      orchestrator.stopEntryPoints(['ep1']);
    });
  });

  describe('Orchestrator - empty operations', () => {
    it('should handle starting with empty array', () => {
      const orchestrator = createOrchestrator();
      const onStarted = jest.fn();

      orchestrator.startEntryPoints([], onStarted);

      expect(onStarted).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should handle stopping with empty array', () => {
      const orchestrator = createOrchestrator();
      const onStopped = jest.fn();

      orchestrator.stopEntryPoints([], onStopped);

      expect(onStopped).toHaveBeenCalled();
    });
  });

  describe('Orchestrator - non-existent entry points', () => {
    it('should throw error when entry point does not exist during start', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<string> = { name: 'slot1' };

      orchestrator.addEntryPoints([
        {
          name: 'provider',
          contributes: [slot],
          contribute: (api) => api.contribute(slot, () => 'value'),
        },
      ]);

      expect(() => orchestrator.startEntryPoints(['provider', 'non-existent'])).toThrow(
        'Entry point non-existent does not exist'
      );
    });

    it('should throw error when entry point does not exist during stop', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<string> = { name: 'slot1' };

      orchestrator.addEntryPoints([
        {
          name: 'consumer',
          dependsOn: [slot],
          run: () => {},
        },
        {
          name: 'provider',
          contributes: [slot],
          contribute: (api) => api.contribute(slot, () => 'value'),
        },
      ]);

      orchestrator.startEntryPoints(['consumer', 'provider']);
      orchestrator.removeEntryPoints(['provider']);

      expect(() => orchestrator.stopEntryPoints(['consumer', 'provider'])).toThrow(
        'Entry point provider does not exist'
      );
    });
  });

  describe('Orchestrator - withdraw errors', () => {
    it('should throw error when withdrawing slot not contributed by entry point', () => {
      const orchestrator = createOrchestrator();
      const slot1: SlotKey<string> = { name: 'slot1' };
      const slot2: SlotKey<string> = { name: 'slot2' };

      orchestrator.addEntryPoints([
        {
          name: 'ep1',
          contributes: [slot1],
          contribute: (api) => api.contribute(slot1, () => 'value'),
          withdraw: (api) => {
            expect(() => api.withdraw(slot2)).toThrow(
              'Slot slot2 is not contributed by entry point ep1'
            );
            api.withdraw(slot1);
          },
        },
      ]);

      orchestrator.startEntryPoints('ep1');
      orchestrator.stopEntryPoints(['ep1']);
    });
  });

  describe('DependencyTree - missing entry point reference', () => {
    it('should handle dependency on non-existent entry point during cycle detection', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const slot2: SlotKey<unknown> = { name: 'slot2' };

      const entryPoints: EntryPoint[] = [
        {
          name: 'ep1',
          dependsOn: [slot1],
        },
        {
          name: 'ep2',
          dependsOn: [slot2],
        },
      ];

      const cycles = tree.checkCircularDependencies(entryPoints);
      expect(cycles).toHaveLength(0);
    });
  });

  describe('DependencyTree - addDependency circular check', () => {
    it('should not trigger addDependency circular check in normal cases', () => {
      const tree = createDependencyTree();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const entryPoints: EntryPoint[] = [
        {
          name: 'ep1',
          contributes: [slot1],
        },
        {
          name: 'ep2',
          dependsOn: [slot1],
        },
      ];

      expect(() => tree.buildTree(entryPoints)).not.toThrow();
    });
  });
});
