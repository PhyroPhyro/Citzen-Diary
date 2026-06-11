"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const tasks_1 = require("./tasks");
(0, vitest_1.describe)('getTasksByVocation', () => {
    (0, vitest_1.it)('returns lavrador tasks for lavrador vocation', () => {
        const tasks = (0, tasks_1.getTasksByVocation)('lavrador');
        (0, vitest_1.expect)(tasks.length).toBe(tasks_1.LAVRADOR_TASKS.length);
        (0, vitest_1.expect)(tasks[0].id).toBe('cultivate');
    });
    (0, vitest_1.it)('returns andarilho tasks for andarilho vocation', () => {
        const tasks = (0, tasks_1.getTasksByVocation)('andarilho');
        (0, vitest_1.expect)(tasks.length).toBe(tasks_1.ANDARILHO_TASKS.length);
        (0, vitest_1.expect)(tasks[0].id).toBe('deliver_message');
    });
    (0, vitest_1.it)('returns artesao tasks for aprendiz_artesao vocation', () => {
        const tasks = (0, tasks_1.getTasksByVocation)('aprendiz_artesao');
        (0, vitest_1.expect)(tasks.length).toBe(tasks_1.ARTESAO_TASKS.length);
        (0, vitest_1.expect)(tasks[0].id).toBe('forge_item');
    });
    (0, vitest_1.it)('returns guarda tasks for aspirante_guarda vocation', () => {
        const tasks = (0, tasks_1.getTasksByVocation)('aspirante_guarda');
        (0, vitest_1.expect)(tasks.length).toBe(tasks_1.GUARDA_TASKS.length);
        (0, vitest_1.expect)(tasks[0].id).toBe('patrol');
    });
    (0, vitest_1.it)('returns comerciante tasks for comerciante_ambulante vocation', () => {
        const tasks = (0, tasks_1.getTasksByVocation)('comerciante_ambulante');
        (0, vitest_1.expect)(tasks.length).toBe(tasks_1.COMERCIANTE_TASKS.length);
        (0, vitest_1.expect)(tasks[0].id).toBe('buy_goods');
    });
    (0, vitest_1.it)('returns empty array for unknown vocation', () => {
        const tasks = (0, tasks_1.getTasksByVocation)('unknown');
        (0, vitest_1.expect)(tasks).toEqual([]);
    });
});
(0, vitest_1.describe)('getAllTasks', () => {
    (0, vitest_1.it)('returns all tasks including universal and vocation-specific', () => {
        const all = (0, tasks_1.getAllTasks)();
        const expectedCount = tasks_1.UNIVERSAL_TASKS.length +
            tasks_1.LAVRADOR_TASKS.length +
            tasks_1.ANDARILHO_TASKS.length +
            tasks_1.ARTESAO_TASKS.length +
            tasks_1.GUARDA_TASKS.length +
            tasks_1.COMERCIANTE_TASKS.length;
        (0, vitest_1.expect)(all.length).toBe(expectedCount);
    });
    (0, vitest_1.it)('includes universal tasks', () => {
        const all = (0, tasks_1.getAllTasks)();
        const universalIds = all.map((t) => t.id);
        (0, vitest_1.expect)(universalIds).toContain('rest');
        (0, vitest_1.expect)(universalIds).toContain('eat_drink');
        (0, vitest_1.expect)(universalIds).toContain('stroll');
    });
});
(0, vitest_1.describe)('getTaskById', () => {
    (0, vitest_1.it)('finds a task by id', () => {
        const task = (0, tasks_1.getTaskById)('cultivate');
        (0, vitest_1.expect)(task).toBeDefined();
        (0, vitest_1.expect)(task?.name).toBe('Cultivar / Plantar');
        (0, vitest_1.expect)(task?.baseScore).toBe(5);
        (0, vitest_1.expect)(task?.primaryTrait).toBe('conscientiousness');
    });
    (0, vitest_1.it)('returns undefined for unknown task id', () => {
        const task = (0, tasks_1.getTaskById)('nonexistent');
        (0, vitest_1.expect)(task).toBeUndefined();
    });
    (0, vitest_1.it)('finds universal tasks', () => {
        const task = (0, tasks_1.getTaskById)('rest');
        (0, vitest_1.expect)(task).toBeDefined();
        (0, vitest_1.expect)(task?.baseScore).toBe(4);
    });
});
(0, vitest_1.describe)('Task definitions', () => {
    (0, vitest_1.it)('all tasks have valid baseScore (1-10)', () => {
        const all = (0, tasks_1.getAllTasks)();
        for (const task of all) {
            (0, vitest_1.expect)(task.baseScore).toBeGreaterThanOrEqual(1);
            (0, vitest_1.expect)(task.baseScore).toBeLessThanOrEqual(10);
        }
    });
    (0, vitest_1.it)('all tasks have at least one atomic action', () => {
        const all = (0, tasks_1.getAllTasks)();
        for (const task of all) {
            (0, vitest_1.expect)(task.atomicActions.length).toBeGreaterThan(0);
        }
    });
    (0, vitest_1.it)('exclusive tasks are marked correctly', () => {
        const exclusive = tasks_1.LAVRADOR_TASKS.filter((t) => t.type === 'exclusive');
        (0, vitest_1.expect)(exclusive.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('shared tasks are marked correctly', () => {
        const shared = tasks_1.LAVRADOR_TASKS.filter((t) => t.type === 'shared');
        (0, vitest_1.expect)(shared.length).toBeGreaterThan(0);
    });
});
//# sourceMappingURL=tasks.test.js.map