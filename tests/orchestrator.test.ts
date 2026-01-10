import { createOrchestrator } from '../src/orchestrator';
import type { ContributeApi, EntryPoint, SlotKey, WithdrawApi } from '../src/types';

describe('Orchestrator', () => {
  describe('addEntryPoints', () => {
    it('should add entry points successfully', () => {
      const orchestrator = createOrchestrator();
      const entryPoints: EntryPoint[] = [{ name: 'ep1' }, { name: 'ep2' }];

      expect(() => orchestrator.addEntryPoints(entryPoints)).not.toThrow();
    });

    it('should validate layer existence', () => {
      const orchestrator = createOrchestrator();
      orchestrator.defineLayers(['layer1']);
      const entryPoint: EntryPoint = { name: 'ep1', layer: 'invalid-layer' };

      expect(() => orchestrator.addEntryPoints([entryPoint])).toThrow(
        'Layer invalid-layer is not defined'
      );
    });

    it('should require layer when layers are defined', () => {
      const orchestrator = createOrchestrator();
      orchestrator.defineLayers(['layer1']);
      const entryPoint: EntryPoint = { name: 'ep1' };

      expect(() => orchestrator.addEntryPoints([entryPoint])).toThrow(
        'Entry point must define a layer'
      );
    });

    it('should validate layer dependencies', () => {
      const orchestrator = createOrchestrator();
      orchestrator.defineLayers(['layer1', 'layer2']);
      const slot: SlotKey<unknown> = { name: 'slot1', layer: 'layer2' };
      const entryPoint: EntryPoint = {
        name: 'ep1',
        layer: 'layer1',
        dependsOn: [slot],
      };

      expect(() => orchestrator.addEntryPoints([entryPoint])).toThrow('cannot depend on');
    });
  });

  describe('defineLayers', () => {
    it('should define layers successfully', () => {
      const orchestrator = createOrchestrator();

      expect(() => orchestrator.defineLayers(['layer1', 'layer2'])).not.toThrow();
    });

    it('should throw error when defining layers after adding entry points', () => {
      const orchestrator = createOrchestrator();
      orchestrator.addEntryPoints([{ name: 'ep1' }]);

      expect(() => orchestrator.defineLayers(['layer1'])).toThrow(
        'Cannot define layers after adding entry points'
      );
    });
  });

  describe('removeEntryPoints', () => {
    it('should remove entry points successfully', () => {
      const orchestrator = createOrchestrator();
      orchestrator.addEntryPoints([{ name: 'ep1' }, { name: 'ep2' }]);

      expect(() => orchestrator.removeEntryPoints(['ep1'])).not.toThrow();
    });
  });

  describe('getStartedEntryPoints', () => {
    it('should return empty array initially', () => {
      const orchestrator = createOrchestrator();

      expect(orchestrator.getStartedEntryPoints()).toEqual([]);
    });

    it('should return started entry points', () => {
      const orchestrator = createOrchestrator();
      orchestrator.addEntryPoints([{ name: 'ep1' }]);
      orchestrator.startEntryPoints('ep1');

      expect(orchestrator.getStartedEntryPoints()).toContain('ep1');
    });
  });

  describe('startEntryPoints', () => {
    it('should start simple entry point without dependencies', () => {
      const orchestrator = createOrchestrator();
      const runSpy = jest.fn();
      orchestrator.addEntryPoints([
        {
          name: 'ep1',
          run: runSpy,
        },
      ]);

      orchestrator.startEntryPoints('ep1');

      expect(runSpy).toHaveBeenCalled();
      expect(orchestrator.getStartedEntryPoints()).toContain('ep1');
    });

    it('should start multiple entry points', () => {
      const orchestrator = createOrchestrator();
      const runSpy1 = jest.fn();
      const runSpy2 = jest.fn();
      orchestrator.addEntryPoints([
        { name: 'ep1', run: runSpy1 },
        { name: 'ep2', run: runSpy2 },
      ]);

      orchestrator.startEntryPoints(['ep1', 'ep2']);

      expect(runSpy1).toHaveBeenCalled();
      expect(runSpy2).toHaveBeenCalled();
    });

    it('should call onStarted callback', () => {
      const orchestrator = createOrchestrator();
      const onStarted = jest.fn();
      orchestrator.addEntryPoints([{ name: 'ep1' }]);

      orchestrator.startEntryPoints('ep1', onStarted);

      expect(onStarted).toHaveBeenCalled();
    });

    it('should handle entry point with contribute', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<string> = { name: 'slot1' };
      const contributeSpy = jest.fn((api: ContributeApi) => {
        api.contribute(slot, () => 'test-value');
      });

      orchestrator.addEntryPoints([
        {
          name: 'provider',
          contributes: [slot],
          contribute: contributeSpy,
        },
      ]);

      orchestrator.startEntryPoints('provider');

      expect(contributeSpy).toHaveBeenCalled();
    });

    it('should start entry points in dependency order', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<string> = { name: 'slot1' };
      const order: string[] = [];

      orchestrator.addEntryPoints([
        {
          name: 'provider',
          contributes: [slot],
          contribute: (api) => {
            api.contribute(slot, () => 'value');
          },
          run: () => order.push('provider'),
        },
        {
          name: 'consumer',
          dependsOn: [slot],
          run: () => order.push('consumer'),
        },
      ]);

      orchestrator.startEntryPoints(['provider', 'consumer']);

      expect(order).toEqual(['provider', 'consumer']);
    });

    it('should provide dependencies via RunApi', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<string> = { name: 'slot1' };
      let receivedValue: string | undefined;

      orchestrator.addEntryPoints([
        {
          name: 'provider',
          contributes: [slot],
          contribute: (api) => {
            api.contribute(slot, () => 'test-value');
          },
        },
        {
          name: 'consumer',
          dependsOn: [slot],
          run: (api) => {
            receivedValue = api.get(slot);
          },
        },
      ]);

      orchestrator.startEntryPoints(['provider', 'consumer']);

      expect(receivedValue).toBe('test-value');
    });

    it('should throw error when accessing undeclared dependency', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<string> = { name: 'slot1' };

      orchestrator.addEntryPoints([
        {
          name: 'ep1',
          run: (api) => {
            api.get(slot);
          },
        },
      ]);

      expect(() => orchestrator.startEntryPoints('ep1')).toThrow('is not declared as dependency');
    });

    it('should throw error when contributing undeclared slot', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<string> = { name: 'slot1' };

      orchestrator.addEntryPoints([
        {
          name: 'ep1',
          contribute: (api) => {
            api.contribute(slot, () => 'value');
          },
        },
      ]);

      expect(() => orchestrator.startEntryPoints('ep1')).toThrow(
        'is not contributed by entry point'
      );
    });

    it('should handle multi-slot correctly', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<string> = { name: 'slot1', multi: true };
      const values: string[] = [];

      orchestrator.addEntryPoints([
        {
          name: 'provider',
          contributes: [slot],
          contribute: (api) => {
            api.contribute(slot, () => 'value1');
          },
        },
        {
          name: 'consumer',
          dependsOn: [slot],
          run: (api) => {
            values.push(api.get(slot));
            values.push(api.get(slot));
          },
        },
      ]);

      orchestrator.startEntryPoints(['provider', 'consumer']);

      expect(values).toEqual(['value1', 'value1']);
    });

    it('should handle singleton slot correctly', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<{ count: number }> = { name: 'slot1' };
      let callCount = 0;
      const values: { count: number }[] = [];

      orchestrator.addEntryPoints([
        {
          name: 'provider',
          contributes: [slot],
          contribute: (api) => {
            api.contribute(slot, () => {
              callCount++;
              return { count: callCount };
            });
          },
        },
        {
          name: 'consumer',
          dependsOn: [slot],
          run: (api) => {
            values.push(api.get(slot));
            values.push(api.get(slot));
          },
        },
      ]);

      orchestrator.startEntryPoints(['provider', 'consumer']);

      expect(callCount).toBe(1);
      expect(values[0]).toBe(values[1]);
    });

    it('should throw error for circular dependencies', () => {
      const orchestrator = createOrchestrator();
      const slot1: SlotKey<unknown> = { name: 'slot1' };
      const slot2: SlotKey<unknown> = { name: 'slot2' };

      orchestrator.addEntryPoints([
        {
          name: 'ep1',
          dependsOn: [slot2],
          contributes: [slot1],
          contribute: (api) => api.contribute(slot1, () => 'value'),
        },
        {
          name: 'ep2',
          dependsOn: [slot1],
          contributes: [slot2],
          contribute: (api) => api.contribute(slot2, () => 'value'),
        },
      ]);

      expect(() => orchestrator.startEntryPoints(['ep1', 'ep2'])).toThrow(
        'Circular dependencies detected'
      );
    });
  });

  describe('stopEntryPoints', () => {
    it('should stop started entry points', () => {
      const orchestrator = createOrchestrator();
      orchestrator.addEntryPoints([{ name: 'ep1' }]);
      orchestrator.startEntryPoints('ep1');

      orchestrator.stopEntryPoints(['ep1']);

      expect(orchestrator.getStartedEntryPoints()).not.toContain('ep1');
    });

    it('should call withdraw method', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<string> = { name: 'slot1' };
      const withdrawSpy = jest.fn((api: WithdrawApi) => {
        api.withdraw(slot);
      });

      orchestrator.addEntryPoints([
        {
          name: 'ep1',
          contributes: [slot],
          contribute: (api) => api.contribute(slot, () => 'value'),
          withdraw: withdrawSpy,
        },
      ]);

      orchestrator.startEntryPoints('ep1');
      orchestrator.stopEntryPoints(['ep1']);

      expect(withdrawSpy).toHaveBeenCalled();
    });

    it('should call onStopped callback', () => {
      const orchestrator = createOrchestrator();
      const onStopped = jest.fn();

      orchestrator.addEntryPoints([{ name: 'ep1' }]);
      orchestrator.startEntryPoints('ep1');
      orchestrator.stopEntryPoints(['ep1'], onStopped);

      expect(onStopped).toHaveBeenCalled();
    });

    it('should stop entry points in reverse dependency order', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<string> = { name: 'slot1' };
      const order: string[] = [];

      orchestrator.addEntryPoints([
        {
          name: 'provider',
          contributes: [slot],
          contribute: (api) => api.contribute(slot, () => 'value'),
          withdraw: (api) => {
            order.push('provider');
            api.withdraw(slot);
          },
        },
        {
          name: 'consumer',
          dependsOn: [slot],
          run: () => {},
        },
      ]);

      orchestrator.startEntryPoints(['provider', 'consumer']);
      order.length = 0;
      orchestrator.stopEntryPoints(['provider', 'consumer']);

      expect(order[0]).toBe('provider');
    });
  });

  describe('stopAllEntryPoints', () => {
    it('should stop all started entry points', () => {
      const orchestrator = createOrchestrator();
      orchestrator.addEntryPoints([{ name: 'ep1' }, { name: 'ep2' }]);
      orchestrator.startEntryPoints(['ep1', 'ep2']);

      orchestrator.stopAllEntryPoints();

      expect(orchestrator.getStartedEntryPoints()).toHaveLength(0);
    });

    it('should call onStopped callback', () => {
      const orchestrator = createOrchestrator();
      const onStopped = jest.fn();

      orchestrator.addEntryPoints([{ name: 'ep1' }]);
      orchestrator.startEntryPoints('ep1');
      orchestrator.stopAllEntryPoints(onStopped);

      expect(onStopped).toHaveBeenCalled();
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple consumers of same slot', () => {
      const orchestrator = createOrchestrator();
      const slot: SlotKey<string> = { name: 'shared-slot' };
      const values: string[] = [];

      orchestrator.addEntryPoints([
        {
          name: 'provider',
          contributes: [slot],
          contribute: (api) => api.contribute(slot, () => 'shared-value'),
        },
        {
          name: 'consumer1',
          dependsOn: [slot],
          run: (api) => values.push(api.get(slot)),
        },
        {
          name: 'consumer2',
          dependsOn: [slot],
          run: (api) => values.push(api.get(slot)),
        },
      ]);

      orchestrator.startEntryPoints(['provider', 'consumer1', 'consumer2']);

      expect(values).toEqual(['shared-value', 'shared-value']);
    });

    it('should handle entry point with multiple dependencies', () => {
      const orchestrator = createOrchestrator();
      const slot1: SlotKey<string> = { name: 'slot1' };
      const slot2: SlotKey<number> = { name: 'slot2' };
      let value1: string | undefined;
      let value2: number | undefined;

      orchestrator.addEntryPoints([
        {
          name: 'provider1',
          contributes: [slot1],
          contribute: (api) => api.contribute(slot1, () => 'string'),
        },
        {
          name: 'provider2',
          contributes: [slot2],
          contribute: (api) => api.contribute(slot2, () => 42),
        },
        {
          name: 'consumer',
          dependsOn: [slot1, slot2],
          run: (api) => {
            value1 = api.get(slot1);
            value2 = api.get(slot2);
          },
        },
      ]);

      orchestrator.startEntryPoints(['provider1', 'provider2', 'consumer']);

      expect(value1).toBe('string');
      expect(value2).toBe(42);
    });

    it('should handle layered architecture', () => {
      const orchestrator = createOrchestrator();
      orchestrator.defineLayers(['data', 'logic', 'ui']);

      const dataSlot: SlotKey<string> = { name: 'data', layer: 'data' };
      const logicSlot: SlotKey<string> = { name: 'logic', layer: 'logic' };

      orchestrator.addEntryPoints([
        {
          name: 'data-provider',
          layer: 'data',
          contributes: [dataSlot],
          contribute: (api) => api.contribute(dataSlot, () => 'data'),
        },
        {
          name: 'logic-processor',
          layer: 'logic',
          dependsOn: [dataSlot],
          contributes: [logicSlot],
          contribute: (api) => api.contribute(logicSlot, () => 'processed'),
        },
        {
          name: 'ui-renderer',
          layer: 'ui',
          dependsOn: [logicSlot],
          run: jest.fn(),
        },
      ]);

      expect(() =>
        orchestrator.startEntryPoints(['data-provider', 'logic-processor', 'ui-renderer'])
      ).not.toThrow();
    });
  });
});
