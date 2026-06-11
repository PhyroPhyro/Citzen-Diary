import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createRoutes } from './routes';
import { DBAdapter } from '../db';
import { QueueAdapter } from '../queue';
import { LLMProvider } from '../llm';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

export function setupAPI(deps: { db: DBAdapter; queue: QueueAdapter; llm: LLMProvider }) {
  app.use('/', createRoutes(deps));

  app.get('/docs', (_req: Request, res: Response) => {
    res.json({
      name: 'Citizen Diary API',
      version: '0.1.0',
      endpoints: {
        health: 'GET /health',
        character: 'GET /character/:id',
        diary: 'GET /character/:id/diary',
        milestones: 'GET /character/:id/milestones',
        relations: 'GET /character/:id/relations',
        npc: 'GET /npc/:id',
        world: 'GET /world/region/:id',
        events: 'GET /world/events',
        map: 'GET /world/map',
        suggestion: 'POST /character/:id/suggestion',
        pray: 'POST /character/:id/pray',
        nameNpc: 'POST /character/:id/name-npc',
        login: 'POST /player/login',
        markEntry: 'POST /character/:id/mark-entry',
        renameMilestone: 'PUT /milestone/:id/rename',
        createCharacter: 'POST /character/create',
        questionnaire: 'GET /questionnaire',
      },
    });
  });

  return app;
}

export { app };
