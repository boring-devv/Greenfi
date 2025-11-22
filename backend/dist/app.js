"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const stakeRoutes_1 = __importDefault(require("./routes/stakeRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const impactRoutes_1 = __importDefault(require("./routes/impactRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'greenfi-backend' });
});
app.use('/auth', authRoutes_1.default);
app.use('/user', userRoutes_1.default);
app.use('/stake', stakeRoutes_1.default);
app.use('/projects', projectRoutes_1.default);
app.use('/impact', impactRoutes_1.default);
app.use('/admin', adminRoutes_1.default);
app.use(errorHandler_1.errorHandler);
exports.default = app;
