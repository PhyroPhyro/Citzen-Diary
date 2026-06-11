"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const http_1 = __importDefault(require("http"));
const url_1 = require("url");
const routes_1 = require("./routes");
const pg_adapter_1 = require("../db/pg-adapter");
const stub_adapter_1 = require("../queue/stub-adapter");
const mock_provider_1 = require("../llm/mock-provider");
const TEST_DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:382356@localhost:5432/citizen_diary';
function makeRequest(baseUrl, method, path, body) {
    return new Promise((resolve, reject) => {
        const url = new url_1.URL(path, baseUrl);
        const options = {
            method,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const req = http_1.default.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    status: res.statusCode || 500,
                    json: async () => JSON.parse(data),
                });
            });
        });
        req.on('error', reject);
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}
(0, vitest_1.describe)('API Routes', () => {
    let server;
    let db;
    let baseUrl;
    (0, vitest_1.beforeAll)(async () => {
        db = new pg_adapter_1.PostgreSQLAdapter(TEST_DB_URL);
        await db.connect();
        const express = require('express');
        const app = express();
        app.use(express.json());
        app.use((0, routes_1.createRoutes)({
            db,
            queue: new stub_adapter_1.StubQueueAdapter(),
            llm: new mock_provider_1.MockLLMProvider(),
        }));
        server = app.listen(0);
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
    });
    (0, vitest_1.afterAll)(async () => {
        server.close();
        await db.disconnect();
    });
    (0, vitest_1.describe)('GET /questionnaire', () => {
        (0, vitest_1.it)('returns all questions', async () => {
            const res = await makeRequest(baseUrl, 'GET', '/questionnaire');
            const data = await res.json();
            (0, vitest_1.expect)(data.questions).toBeDefined();
            (0, vitest_1.expect)(data.total).toBe(10);
            (0, vitest_1.expect)(data.questions.length).toBe(10);
        });
    });
    (0, vitest_1.describe)('POST /character/create', () => {
        (0, vitest_1.it)('creates a character with valid data', async () => {
            const characterData = {
                name: 'API Test Character',
                description: 'A brave adventurer',
                playerId: 'api-test-player',
                vocation: 'andarilho',
                answers: [
                    { questionId: 1, optionLetter: 'C' },
                    { questionId: 2, optionLetter: 'D' },
                    { questionId: 3, optionLetter: 'B' },
                    { questionId: 4, optionLetter: 'C' },
                    { questionId: 5, optionLetter: 'D' },
                    { questionId: 6, optionLetter: 'C' },
                    { questionId: 7, optionLetter: 'B' },
                    { questionId: 8, optionLetter: 'C' },
                    { questionId: 9, optionLetter: 'C' },
                    { questionId: 10, optionLetter: 'B' },
                ],
            };
            const res = await makeRequest(baseUrl, 'POST', '/character/create', characterData);
            const data = await res.json();
            (0, vitest_1.expect)(res.status).toBe(201);
            (0, vitest_1.expect)(data.message).toBe('Character created');
            (0, vitest_1.expect)(data.character.name).toBe('API Test Character');
            (0, vitest_1.expect)(data.character.vocation).toBe('andarilho');
            (0, vitest_1.expect)(data.character.traits).toBeDefined();
        });
        (0, vitest_1.it)('rejects invalid character data', async () => {
            const res = await makeRequest(baseUrl, 'POST', '/character/create', { name: '' });
            const data = await res.json();
            (0, vitest_1.expect)(res.status).toBe(400);
            (0, vitest_1.expect)(data.error).toBe('Invalid character data');
        });
    });
    (0, vitest_1.describe)('GET /world/map', () => {
        (0, vitest_1.it)('returns regions and locations', async () => {
            const res = await makeRequest(baseUrl, 'GET', '/world/map');
            const data = await res.json();
            (0, vitest_1.expect)(data.regions).toBeDefined();
            (0, vitest_1.expect)(data.locations).toBeDefined();
            (0, vitest_1.expect)(data.regions.length).toBe(5);
            (0, vitest_1.expect)(data.locations.length).toBe(15);
        });
    });
    (0, vitest_1.describe)('GET /world/events', () => {
        (0, vitest_1.it)('returns active events', async () => {
            const res = await makeRequest(baseUrl, 'GET', '/world/events');
            const data = await res.json();
            (0, vitest_1.expect)(data.events).toBeDefined();
            (0, vitest_1.expect)(data.total).toBeGreaterThan(0);
        });
    });
});
//# sourceMappingURL=routes.test.js.map