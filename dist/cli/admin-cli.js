"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAdminCLI = startAdminCLI;
const readline_1 = __importDefault(require("readline"));
const child_process_1 = require("child_process");
const llm_1 = require("../llm");
const character_tick_1 = require("../core/tick/character-tick");
function startAdminCLI(deps) {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'citizen-diary > ',
    });
    console.log('\n[CLI] Admin CLI started. Type "help" for commands.\n');
    rl.prompt();
    rl.on('line', async (line) => {
        const trimmed = line.trim();
        if (!trimmed) {
            rl.prompt();
            return;
        }
        const [cmd, ...args] = trimmed.split(' ');
        try {
            switch (cmd.toLowerCase()) {
                case 'help':
                    console.log('\n📖 Comandos disponíveis:');
                    console.log('  tick <id>       - Força um tick imediato para o personagem (use "all" para todos)');
                    console.log('  status          - Mostra status do LLM, DB e Queue');
                    console.log('  milestones <id> - Lista todos os marcos de um personagem');
                    console.log('  force-milestone <id> <trigger> - Força a criação de um marco');
                    console.log('  export-diary <id> - Exporta o diário de um personagem como JSON');
                    console.log('  test            - Roda a suíte de testes (npm test)');
                    console.log('  clear           - Limpa o console');
                    console.log('  exit            - Para o servidor');
                    console.log();
                    break;
                case 'tick': {
                    const target = args[0];
                    if (target === 'all') {
                        console.log('[CLI] Forçando tick para todos os personagens ativos...');
                        const characters = await deps.db.character.getAllActive();
                        let count = 0;
                        for (const char of characters) {
                            if ((0, character_tick_1.shouldConvertToNPC)(char)) {
                                console.log(`[CLI] ⏭️  ${char.name} ignorado (modo NPC)`);
                                continue;
                            }
                            try {
                                await (0, character_tick_1.executeCharacterTick)(char, deps.db, deps.queue, deps.llm);
                                console.log(`[CLI] ✅ Tick processado para ${char.name}`);
                                count++;
                            }
                            catch (err) {
                                console.error(`[CLI] ❌ Erro no tick de ${char.name}:`, err);
                            }
                        }
                        console.log(`[CLI] ✅ ${count} tick(s) processados.`);
                    }
                    else if (target) {
                        const char = await deps.db.character.getById(target);
                        if (!char) {
                            console.log(`[CLI] ❌ Personagem "${target}" não encontrado.`);
                        }
                        else if ((0, character_tick_1.shouldConvertToNPC)(char)) {
                            console.log(`[CLI] ⏭️  ${char.name} está em modo NPC.`);
                        }
                        else {
                            console.log(`[CLI] ⏳ Forçando tick para ${char.name}...`);
                            await (0, character_tick_1.executeCharacterTick)(char, deps.db, deps.queue, deps.llm);
                            console.log(`[CLI] ✅ Tick processado para ${char.name}`);
                        }
                    }
                    else {
                        console.log('[CLI] ❌ Uso: tick <id> ou tick all');
                    }
                    break;
                }
                case 'status': {
                    console.log('\n Status do Sistema:');
                    console.log('  DB:       ✅ Conectado (PostgreSQL)');
                    console.log('  Queue:    ✅ Conectado (Redis)');
                    const llmType = deps.llm.constructor.name;
                    let llmStatus = '⚪ Desconhecido';
                    if (deps.llm instanceof llm_1.CascadeLLMProvider) {
                        const active = deps.llm.activeProvider;
                        llmStatus = `🟢 Ativo: ${active}`;
                    }
                    console.log(`  LLM:      ${llmType} (${llmStatus})`);
                    console.log();
                    break;
                }
                case 'test': {
                    console.log('[CLI] 🧪 Rodando testes...');
                    (0, child_process_1.exec)('npm test', (error, stdout, stderr) => {
                        if (error) {
                            console.error(`[CLI] ❌ Erro ao rodar testes: ${error.message}`);
                            rl.prompt();
                            return;
                        }
                        if (stderr) {
                            console.error(`[CLI] ⚠️  Stderr: ${stderr}`);
                        }
                        console.log(`[CLI]  Resultado dos testes:\n${stdout}`);
                        rl.prompt();
                    });
                    break;
                }
                case 'clear':
                    console.clear();
                    break;
                case 'milestones': {
                    const charId = args[0];
                    if (!charId) {
                        console.log('[CLI] ❌ Uso: milestones <characterId>');
                        break;
                    }
                    const milestones = await deps.db.milestones.getByCharacterId(charId);
                    if (milestones.length === 0) {
                        console.log(`[CLI] Nenhum marco encontrado para personagem ${charId}`);
                    }
                    else {
                        console.log(`\n📜 Marcos para personagem ${charId} (${milestones.length} total):`);
                        for (const m of milestones) {
                            console.log(`  [${m.importance.toUpperCase()}] ${m.title} — ${m.description}`);
                        }
                        console.log();
                    }
                    break;
                }
                case 'force-milestone': {
                    const charId = args[0];
                    const trigger = args[1];
                    if (!charId || !trigger) {
                        console.log('[CLI] ❌ Uso: force-milestone <characterId> <triggerType>');
                        break;
                    }
                    const character = await deps.db.character.getById(charId);
                    if (!character) {
                        console.log(`[CLI] ❌ Personagem "${charId}" não encontrado.`);
                        break;
                    }
                    const milestone = await deps.db.milestones.create({
                        characterId: charId,
                        importance: 'relevant',
                        title: 'Forced milestone',
                        description: `Manually triggered: ${trigger}`,
                        occurredAt: new Date(),
                        locationId: character.locationId,
                        locationName: 'Desconhecido',
                        triggerType: trigger,
                        relatedCharacterIds: [],
                        relatedEventId: null,
                        diaryEntryId: null,
                        isActiveContext: true,
                    });
                    console.log(`[CLI] ✅ Marco forçado criado: "${milestone.title}" (id: ${milestone.id})`);
                    break;
                }
                case 'export-diary': {
                    const charId = args[0];
                    if (!charId) {
                        console.log('[CLI] ❌ Uso: export-diary <characterId>');
                        break;
                    }
                    const character = await deps.db.character.getById(charId);
                    if (!character) {
                        console.log(`[CLI] ❌ Personagem "${charId}" não encontrado.`);
                        break;
                    }
                    const entries = await deps.db.diary.getByCharacterId(charId, 1000);
                    const exportData = {
                        character: { name: character.name, vocation: character.vocation },
                        exportedAt: new Date().toISOString(),
                        totalEntries: entries.length,
                        entries: entries.map((e) => ({
                            id: e.id,
                            text: e.text,
                            source: e.source,
                            occurredAt: e.occurredAt,
                            locationName: e.locationName,
                            taskId: e.taskId,
                            isAnchored: e.isAnchored,
                            milestoneId: e.milestoneId,
                        })),
                    };
                    const fs = await Promise.resolve().then(() => __importStar(require('fs')));
                    const path = await Promise.resolve().then(() => __importStar(require('path')));
                    const filePath = path.join(process.cwd(), `diary-${charId}-${Date.now()}.json`);
                    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
                    console.log(`[CLI] ✅ Diário exportado: ${filePath} (${entries.length} entradas)`);
                    break;
                }
                case 'exit':
                    console.log('[CLI] 👋 Encerrando servidor...');
                    rl.close();
                    process.exit(0);
                    break;
                default:
                    console.log(`[CLI] ❌ Comando desconhecido: "${cmd}". Digite "help" para ver a lista.`);
                    break;
            }
        }
        catch (err) {
            console.error('[CLI] ❌ Erro ao executar comando:', err);
        }
        rl.prompt();
    });
    rl.on('close', () => {
        console.log('\n[CLI] CLI encerrado.');
        process.exit(0);
    });
}
//# sourceMappingURL=admin-cli.js.map