import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors.js';
import { requestLogger } from './middleware/request-logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { authRouter } from './modules/auth/auth-router.js';
import { trendingRouter } from './modules/trending/trending-router.js';
import { downloadRouter } from './modules/downloads/download-router.js';
import { oauthRouter } from './modules/oauth/oauth-router.js';
import { accountsRouter } from './modules/accounts/accounts-router.js';
import { channelsRouter } from './modules/channels/channels-router.js';
import { uploadRouter } from './modules/uploads/upload-router.js';
import { analyticsRouter } from './modules/analytics/analytics-router.js';
import { videosRouter } from './modules/videos/videos-router.js';
import { successResponse } from './lib/api-response.js';

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(requestLogger);

app.use('/api/auth', authRouter);
app.use('/api/trending', trendingRouter);
app.use('/api/downloads', downloadRouter);
app.use('/api/oauth', oauthRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/channels', channelsRouter);
app.use('/api/uploads', uploadRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/videos', videosRouter);

app.get('/api/health', (req, res) => {
  res.json(successResponse({ status: 'ok', timestamp: new Date().toISOString() }));
});

app.use(errorHandler);

export { app };
