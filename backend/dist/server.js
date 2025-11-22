"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const contractListener_1 = require("./web3/contractListener");
const PORT = process.env.PORT || 4000;
async function main() {
    const server = (0, http_1.createServer)(app_1.default);
    server.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`GreenFi backend listening on port ${PORT}`);
    });
    // start blockchain event listener (non-blocking)
    (0, contractListener_1.startContractListener)().catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Contract listener error:', err);
    });
}
void main();
