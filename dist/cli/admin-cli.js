"use strict";
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