import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { URL } from 'url';
import { createRoutes } from './routes';
import { PostgreSQLAdapter } from '../db/pg-adapter';
import { StubQueueAdapter } from '../queue/stub-adapter';
import { MockLLMProvider } from '../llm/mock-provider';

const TEST_DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:382356@localhost:5432/citizen_diary';

function makeRequest(baseUrl: string, method: string, path: string, body?: any): Promise<{ status: number; json: () => Promise<any> }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
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

describe('API Routes', () => {
  let server: http.Server;
  let db: PostgreSQLAdapter;
  let baseUrl: string;

  beforeAll(async () => {
    db = new PostgreSQLAdapter(TEST_DB_URL);
    await db.connect();

    const express = require('express');
    const app = express();
    app.use(express.json());
    app.use(
      createRoutes({
        db,
        queue: new StubQueueAdapter(),
        llm: new MockLLMProvider(),
      })
    );

    server = app.listen(0);
    const address = server.address() as import('net').AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    server.close();
    await db.disconnect();
  });

  describe('GET /questionnaire', () => {
    it('returns all questions', async () => {
      const res = await makeRequest(baseUrl, 'GET', '/questionnaire');
      const data = await res.json();

      expect(data.questions).toBeDefined();
      expect(data.total).toBe(10);
      expect(data.questions.length).toBe(10);
    });
  });

  describe('POST /character/create', () => {
    it('creates a character with valid data', async () => {
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

      expect(res.status).toBe(201);
      expect(data.message).toBe('Character created');
      expect(data.character.name).toBe('API Test Character');
      expect(data.character.vocation).toBe('andarilho');
      expect(data.character.traits).toBeDefined();
    });

    it('rejects invalid character data', async () => {
      const res = await makeRequest(baseUrl, 'POST', '/character/create', { name: '' });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('Invalid character data');
    });
  });

  describe('GET /world/map', () => {
    it('returns regions and locations', async () => {
      const res = await makeRequest(baseUrl, 'GET', '/world/map');
      const data = await res.json();

      expect(data.regions).toBeDefined();
      expect(data.locations).toBeDefined();
      expect(data.regions.length).toBe(5);
      expect(data.locations.length).toBe(15);
    });
  });

  describe('GET /world/events', () => {
    it('returns active events', async () => {
      const res = await makeRequest(baseUrl, 'GET', '/world/events');
      const data = await res.json();

      expect(data.events).toBeDefined();
      expect(data.total).toBeGreaterThan(0);
    });
  });
});
