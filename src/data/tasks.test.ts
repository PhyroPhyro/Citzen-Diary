import { describe, it, expect } from 'vitest';
import {
  getTasksByVocation,
  getAllTasks,
  getTaskById,
  UNIVERSAL_TASKS,
  LAVRADOR_TASKS,
  ANDARILHO_TASKS,
  ARTESAO_TASKS,
  GUARDA_TASKS,
  COMERCIANTE_TASKS,
} from './tasks';

describe('getTasksByVocation', () => {
  it('returns lavrador tasks for lavrador vocation', () => {
    const tasks = getTasksByVocation('lavrador');
    expect(tasks.length).toBe(LAVRADOR_TASKS.length);
    expect(tasks[0].id).toBe('cultivate');
  });

  it('returns andarilho tasks for andarilho vocation', () => {
    const tasks = getTasksByVocation('andarilho');
    expect(tasks.length).toBe(ANDARILHO_TASKS.length);
    expect(tasks[0].id).toBe('deliver_message');
  });

  it('returns artesao tasks for aprendiz_artesao vocation', () => {
    const tasks = getTasksByVocation('aprendiz_artesao');
    expect(tasks.length).toBe(ARTESAO_TASKS.length);
    expect(tasks[0].id).toBe('forge_item');
  });

  it('returns guarda tasks for aspirante_guarda vocation', () => {
    const tasks = getTasksByVocation('aspirante_guarda');
    expect(tasks.length).toBe(GUARDA_TASKS.length);
    expect(tasks[0].id).toBe('patrol');
  });

  it('returns comerciante tasks for comerciante_ambulante vocation', () => {
    const tasks = getTasksByVocation('comerciante_ambulante');
    expect(tasks.length).toBe(COMERCIANTE_TASKS.length);
    expect(tasks[0].id).toBe('buy_goods');
  });

  it('returns empty array for unknown vocation', () => {
    const tasks = getTasksByVocation('unknown');
    expect(tasks).toEqual([]);
  });
});

describe('getAllTasks', () => {
  it('returns all tasks including universal and vocation-specific', () => {
    const all = getAllTasks();
    const expectedCount =
      UNIVERSAL_TASKS.length +
      LAVRADOR_TASKS.length +
      ANDARILHO_TASKS.length +
      ARTESAO_TASKS.length +
      GUARDA_TASKS.length +
      COMERCIANTE_TASKS.length;
    expect(all.length).toBe(expectedCount);
  });

  it('includes universal tasks', () => {
    const all = getAllTasks();
    const universalIds = all.map((t) => t.id);
    expect(universalIds).toContain('rest');
    expect(universalIds).toContain('eat_drink');
    expect(universalIds).toContain('stroll');
  });
});

describe('getTaskById', () => {
  it('finds a task by id', () => {
    const task = getTaskById('cultivate');
    expect(task).toBeDefined();
    expect(task?.name).toBe('Cultivar / Plantar');
    expect(task?.baseScore).toBe(5);
    expect(task?.primaryTrait).toBe('conscientiousness');
  });

  it('returns undefined for unknown task id', () => {
    const task = getTaskById('nonexistent');
    expect(task).toBeUndefined();
  });

  it('finds universal tasks', () => {
    const task = getTaskById('rest');
    expect(task).toBeDefined();
    expect(task?.baseScore).toBe(4);
  });
});

describe('Task definitions', () => {
  it('all tasks have valid baseScore (1-10)', () => {
    const all = getAllTasks();
    for (const task of all) {
      expect(task.baseScore).toBeGreaterThanOrEqual(1);
      expect(task.baseScore).toBeLessThanOrEqual(10);
    }
  });

  it('all tasks have at least one atomic action', () => {
    const all = getAllTasks();
    for (const task of all) {
      expect(task.atomicActions.length).toBeGreaterThan(0);
    }
  });

  it('exclusive tasks are marked correctly', () => {
    const exclusive = LAVRADOR_TASKS.filter((t) => t.type === 'exclusive');
    expect(exclusive.length).toBeGreaterThan(0);
  });

  it('shared tasks are marked correctly', () => {
    const shared = LAVRADOR_TASKS.filter((t) => t.type === 'shared');
    expect(shared.length).toBeGreaterThan(0);
  });
});
