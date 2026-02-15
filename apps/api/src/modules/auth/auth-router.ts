import express from 'express';
import { authController } from './auth-controller.js';
import { validateRequest } from '../../middleware/validate-request.js';
import { authMiddleware } from '../../middleware/auth-middleware.js';
import { loginLimiter, registerLimiter } from '../../middleware/rate-limiter.js';
import { LoginRequestSchema, RegisterRequestSchema } from './auth-schemas.js';

const router = express.Router();

router.post(
  '/register',
  registerLimiter,
  validateRequest(RegisterRequestSchema),
  authController.register
);

router.post(
  '/login',
  loginLimiter,
  validateRequest(LoginRequestSchema),
  authController.login
);

router.post('/logout', authController.logout);

router.get('/me', authMiddleware, authController.me);

export { router as authRouter };
