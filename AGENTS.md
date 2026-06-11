# Citizen Diary — Agent Notes

## Project
- **Runtime:** Node.js + TypeScript
- **Database:** PostgreSQL
- **Job Queue:** BullMQ + Redis
- **API:** REST (Express)
- **LLM:** Provedor LLM externo (a definir)
- **Deploy:** Railway ou Render
- **Architecture:** Backend-first. O cliente é secundário — qualquer interface que consuma a API funciona sem perda de experiência.

## Documentation Source
- **GDD Primary:** `C:\Users\phyro\Documents\Vaults\Personal\4. Projetos\Citizen Diary\GDD_HeroAutonomo.md`
- **Vault Root:** `C:\Users\phyro\Documents\Vaults\Personal\4. Projetos\Citizen Diary\`
- This vault is the **single source of truth** for all project documentation — session logs, game state notes, mechanic references, and implementation status.
- All documentation created from this point forward lives in the vault, organized by contextual folders (see below).
- The GDD is versioned (currently 0.2) and lives in the vault. Reference it by section number.

## Developer Workflow
- **ALWAYS run `npm run build`** after any code change — TypeScript compilation catches errors that won't show until runtime
- **ALWAYS run `npm test`** after implementing features or fixing bugs — tests are a completeness requirement
- When commands are added to `package.json`, update this file.
- Build/compile TypeScript before considering tasks complete.

### Session Startup Checklist
At the beginning of every session, verify external services before coding:

1. **Check PostgreSQL**:
   ```powershell
   $env:PGPASSWORD = '382356'; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "SELECT 1;" 2>&1
   ```
   - If it fails, PostgreSQL is not running — start it via Windows Services or `pg_ctl`
   - Verify database exists: `SELECT datname FROM pg_database WHERE datname = 'citizen_diary';`
   - If missing, create: `CREATE DATABASE citizen_diary;` then run `npm run migrate`

2. **Check Redis**:
   ```powershell
   redis-cli ping
   ```
   - If it fails, Redis is not running — start it via Windows Services or `redis-server`
   - Expected response: `PONG`

3. **Verify .env**:
   - Ensure `DATABASE_URL` and `REDIS_URL` match the running services
   - Ensure `GEMINI_API_KEY` is set if LLM features are needed

4. **Run build + tests**:
   ```bash
   npm run build
   npm test
   ```

### How To Documentation
- The file `C:\Users\phyro\Documents\Vaults\Personal\4. Projetos\Citizen Diary\Estado\How To.md` is the **single reference** for human operators — how to run tests, start the server, requirements, troubleshooting.
- **ALWAYS update this file** when:
  - A new npm script is added or changed
  - A new service or dependency is required
  - A new deployment process is added
  - A troubleshooting case is discovered and resolved
  - The server startup process changes
  - Test execution process changes
- Keep it readable, intuitive, and organized in clear sections.

## Testing

### Framework
- **Vitest** — fast, TypeScript-native, compatible with existing tooling
- Test files live alongside source: `src/**/*.test.ts`
- Run all tests: `npm test`
- Run with coverage: `npm run test:coverage`
- Run in watch mode: `npm run test:watch`

### Testing Rules
- **Every new feature MUST have unit tests** — no exceptions
- **Tests are a completeness requirement** — a task is not done until tests pass
- **Test pure functions first** — motor, modifiers, templates, questionnaire, classification
- **Mock adapters for integration tests** — use stub adapters when DB/Queue aren't available
- **Test edge cases** — empty pools, zero values, boundary conditions, tie resolution
- **Run tests at the end of significant tasks** — before marking any feature as complete

### What to Test
| Layer | What | How |
|---|---|---|
| Models | traitToModifier, getMoodModifier, getDominantMood, affinityToModifier, getCommitmentModifier | Direct function calls with boundary values |
| Data | getTasksByVocation, getTemplateForTask, getToneSuffix, calculateTraits, getLocationById | Verify correct data returned for known inputs |
| Decision Motor | scoreTasks, buildTaskPool, resolveTies, runDecisionMotor | Create test characters with known traits, verify scores |
| Narrative State | classifyNarrativeState | Test each rich condition individually and combined |
| Diary | generateTemplateEntry | Verify template selection and tone suffix logic |
| LLM Context | buildLLMContext | Verify prompt format and token structure |
| Tick | calculateTickInterval | Test all absence time buckets |

### Test Execution
- Run `npm test` before committing any feature
- If tests fail, fix before proceeding
- Add new tests when adding new functionality
- Update existing tests when modifying behavior

## Architecture
- **Backend-first:** toda simulação ocorre no servidor. O cliente é apenas janela de leitura e interação mínima.
- **World Tick:** scheduler dispara jobs via BullMQ; cada personagem ativo recebe um Character Tick Job.
- **Character Tick:** lê estado → motor determinístico gera 3 ações candidatas → avalia estado narrativo → chama LLM se relevante → aplica efeitos → grava diário → agenda próximo tick.
- **Adaptive Tick Frequency:** intervalo baseado em ausência do jogador + estado narrativo do personagem (ver GDD Seção 3).
- **Faith System:** mede o quanto o personagem segue conselhos do jogador (ver GDD Seção 5).

### API Endpoints (MVP)
```
GET  /character/:id              → estado atual do personagem
GET  /character/:id/diary        → entradas do diário (paginado)
GET  /character/:id/milestones   → marcos permanentes
POST /character/:id/suggestion   → jogador envia sugestão/conselho
GET  /world/region/:id           → estado de uma região
GET  /world/events               → eventos globais ativos
POST /player/login               → atualiza timestamp de login
```

### Directory Layout
| Path | Domain |
|---|---|
| `src/api/` | Express app, routes, controllers, middleware |
| `src/core/` | Character engine, decision motor, tick scheduler |
| `src/core/decision/` | motor.ts (score, pool, ranking), narrative-state.ts |
| `src/core/tick/` | character-tick.ts (full tick flow) |
| `src/llm/` | LLM integration (Gemini + Mock), context building |
| `src/models/` | TypeScript interfaces (Character, Traits, Mood, etc.) |
| `src/db/` | PostgreSQL schema, migrations (10 files), adapter interface + stub |
| `src/queue/` | BullMQ adapter interface + stub |
| `src/data/` | Tasks (~40), world data, templates, questionnaire |
| `src/world/` | Locations, regions, events, global state |
| `src/diary/` | Diary entry generation, templates, LLM context builder |

## Key Systems

### Character Engine (GDD Seção 5)
- **Traits (Big Five):** Abertura, Conscienciosidade, Extroversão, Estabilidade Emocional, Agradabilidade (0–10, imutáveis no curto prazo)
- **Mood:** joy, sadness, anger, fear, disgust, surprise (0–10, altamente volátil)
- **Faith:** 0–10, mede influência do jogador
- **Objective:** subconsciente, gera progresso invisível nas decisões
- **Commitments:** obrigações ativas com prazo e urgência

### Decision Motor (GDD Seção 7)
- Puramente determinístico — sem aleatoriedade no cálculo
- Score = base + mod_traço + mod_humor + mod_objetivo + mod_compromisso + mod_ambiente + mod_relação + mod_fé
- Gera top 3 ações candidatas por tick
- LLM chamado apenas quando estado narrativo é rico

### Vocations (GDD Seção 6)
- MVP: Lavrador, Andarilho, Aprendiz de Artesão, Aspirante a Guarda, Comerciante Ambulante
- Especialização é emergente — não é escolhida, surge do histórico de afazeres
- Afazeres exclusivos e compartilhados criam cooperação natural entre vocações

### Character Creation (GDD Seção 4)
- 10 perguntas mapeiam para Big Five com leve aleatoriedade
- Jogador não vê valores numéricos — responde e o sistema calcula
- Entidade narrativa conduz o questionário
- Bio gerada via LLM após nome e descrição livre

## Agent Workflow Rules
- **NEVER read the same file twice in a row** — context is retained across tool calls
- **Batch independent reads** — read multiple files in parallel when possible
- **Edit → verify once** — after editing, only re-read if the edit result is unclear or an error occurs
- **Avoid read loops** — if you find yourself reading the same files repeatedly, stop and act on what you already know

## Session Documentation (Mandatory)

When the user says **"Documente esta sessão"** or after any significant architectural/feature change, create a session log document.

### When to Document
- New feature implementations
- Architectural changes (new scripts, refactors, system redesigns)
- Bug fixes that required non-trivial investigation
- Any change that modifies behavior described in the GDD
- When explicitly requested by the user

### Where to Save
`C:\Users\phyro\Documents\Vaults\Personal\4. Projetos\Citizen Diary\Logs\`

### File Naming
Format: `YYYY-MM-DD - Short Descriptive Title.md`
- Date format: `2026-06-10` (ISO 8601, no slashes in filename)
- Title: concise but descriptive (e.g., "Character Engine Tick Implementation")
- Each log is a **new file** — never append to existing logs

### Document Structure (Markdown)
```markdown
# YYYY/MM/DD — Short Descriptive Title

## Motivação
- What problem was being solved
- Why this change was necessary
- Reference to GDD sections if applicable

## Decisões de Design
- Key decisions made and why
- Alternatives considered and rejected
- Justification for each decision

## Ações Tomadas
### Arquivos Criados
| Arquivo | Descrição |
|---|---|
| `path/to/file.ts` | What it does |

### Arquivos Modificados
| Arquivo | Alteração |
|---|---|
| `path/to/file.ts` | What changed |

### Detalhes das Alterações
- Code snippets for critical logic changes
- Flow descriptions for new systems

## Resultados Esperados
- Expected behavior after changes
- How to verify the change works
- Any known limitations or TODOs

## Referências ao GDD
- Section numbers and topics from the GDD that relate to this change
```

### Quality Checklist
- [ ] Motivation clearly states the problem
- [ ] All created/modified files are listed
- [ ] Critical code changes are documented with snippets
- [ ] Expected behavior is described
- [ ] GDD sections are referenced
- [ ] File saved in correct directory with correct naming format

### Vault Sync (Post-Documentation)
After creating the session log document, **immediately commit and push** to the Vault repository:

1. **Repository root:** `C:\Users\phyro\Documents\Vaults\Personal`
2. **Steps:**
   - `cd "C:\Users\phyro\Documents\Vaults\Personal"`
   - `git add -A`
   - `git commit -m "docs: <short description of the session log>"`
   - `git push`
3. **Commit message format:** `docs: YYYY-MM-DD — Short Title` (e.g., `docs: 2026-06-10 — Character Engine Tick Implementation`)
4. **Verify:** `git status` should show clean working tree after push

### Game State Documentation (Mandatory — Post-Log)

After creating the session log and **before** the Vault Sync step, you must also document the current state of every game element, mechanic, system, or verb that was touched or is relevant to the session. This creates a living knowledge base inside the Obsidian vault.

#### Vault Root
`C:\Users\phyro\Documents\Vaults\Personal\4. Projetos\Citizen Diary\`

#### Contextual Folder Structure
Organize notes into contextual folders. Create folders as needed — the structure should grow organically:

| Pasta | Conteúdo | Exemplos |
|---|---|---|
| `Mecanicas/` | Mecânicas de gameplay — regras, fórmulas, loops | World Tick, Motor de Decisão, Sistema de Fé, Decay de Atividade |
| `Elementos/` | Entidades do jogo — personagem, traços, humor, objetivos | Character, Big Five Traits, Mood, Objective, Commitments |
| `Verbos/` | Ações do jogador — o que o player pode fazer | Enviar Sugestão, Ler Diário, Ver Marcos, Fazer Login |
| `Sistemas/` | Sistemas técnicos — API, fila, banco, LLM | Character Tick Job, BullMQ Scheduler, LLM Narrative, PostgreSQL Schema |
| `Vocacoes/` | Vocações, afazeres, especializações emergentes | Lavrador, Andarilho, Artesão, Guarda, Comerciante |
| `Mundo/` | Locais, regiões, eventos, lore | Veldra, Arvel, Korrath Capital, Planícies de Arvel |
| `Estado/` | Status de implementação — o que está feito, pendente, planejado | MVP Status, Roadmap, Pendências |

#### How to Document Each Element

For **every** mechanic, element, verb, system, or scene that was touched or is contextually relevant to the session:

1. **Check if a note already exists** — recursively search `C:\Users\phyro\Documents\Vaults\Personal\4. Projetos\Citizen Diary\` for a matching note
2. **If it exists** — update it with new information, status changes, or relationships
3. **If it doesn't exist** — create a new note in the appropriate contextual folder
4. **Always use Obsidian wikilinks** `[[]]` when referencing any other note that exists in the vault — never use plain text for something that has a dedicated note

#### Note Structure (Each Element)

```markdown
# Name of Element/Mechanic/System

## Intenção
- What this is and why it exists in the game
- Design goal or player experience it enables

## Como Funciona
- Rules, formulas, flow, or behavior
- Key implementation details (scripts, signals, data)

## Status
- **Implementado:** What's fully working
- **Parcial:** What's partially done (specify what's missing)
- **Pendente:** What's planned but not started
- **Bloqueado:** What's blocked and why (if applicable)

## Pendências
- [ ] Specific TODO item 1
- [ ] Specific TODO item 2
- [ ] Known issue or limitation

## Relacionados
- [[Note Name 1]]
- [[Note Name 2]]
- [[GDD Section Reference]]
```

#### Wikilink Rules

- **ALWAYS** search recursively in the vault before creating a new note — if a note exists, use `[[Note Name]]` instead of creating a duplicate
- Wikilinks should use the note filename without the `.md` extension
- If a note is inside a subfolder, use the full relative path: `[[Mecanicas/World Tick]]`
- When updating an existing note, add a `## Histórico de Alterações` section at the bottom with date and what changed

#### Example Workflow

1. Session touches the decision motor → check vault for existing decision motor notes
2. Found `[[Mecanicas/Motor de Decisão]]` → update status, add new implementation details
3. Found `[[Elementos/Big Five Traits]]` → add wikilink reference in the decision motor note
4. No note exists for `[[Sistemas/Character Tick Job]]` → create new note in `Sistemas/` folder
5. All notes use `[[wikilinks]]` to cross-reference each other
6. After all element notes are created/updated, proceed to Vault Sync
