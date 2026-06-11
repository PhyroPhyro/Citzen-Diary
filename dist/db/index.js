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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDBAdapter = createDBAdapter;
const stub_adapter_1 = require("./stub-adapter");
const pg_adapter_1 = require("./pg-adapter");
function createDBAdapter() {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
        return new pg_adapter_1.PostgreSQLAdapter(dbUrl);
    }
    console.log('[DB] No DATABASE_URL found, using stub adapter');
    return new stub_adapter_1.StubDBAdapter();
}
__exportStar(require("./adapter"), exports);
__exportStar(require("./stub-adapter"), exports);
__exportStar(require("./pg-adapter"), exports);
//# sourceMappingURL=index.js.map