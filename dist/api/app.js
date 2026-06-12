"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsServer = exports.app = void 0;
exports.setupAPI = setupAPI;
exports.attachWebSocket = attachWebSocket;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const routes_1 = require("./routes");
const websocket_1 = require("./websocket");
Object.defineProperty(exports, "wsServer", { enumerable: true, get: function () { return websocket_1.wsServer; } });
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../../public')));
function setupAPI(deps) {
    app.use('/', (0, routes_1.createRoutes)(deps));
    app.get('/docs', (_req, res) => {
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
                suggestionsHistory: 'GET /character/:id/suggestions',
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
function attachWebSocket(server) {
    websocket_1.wsServer.initialize(server);
    return websocket_1.wsServer;
}
//# sourceMappingURL=app.js.map