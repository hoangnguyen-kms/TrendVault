import express from 'express';
import { authController } from './auth-controller.js';
import { validateRequest } from '../../middleware/validate-request.js';
import { authMiddleware } from '../../middleware/auth-middleware.js';
import { loginLimiter, registerLimiter } from '../../middleware/rate-limiter.js';
import { LoginRequestSchema, RegisterRequestSchema } from './auth-schemas.js';

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already registered or validation error
 */
router.post(
  '/register',
  registerLimiter,
  validateRequest(RegisterRequestSchema),
  authController.register,
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginLimiter, validateRequest(LoginRequestSchema), authController.login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout current user
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authController.logout);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token using refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', authController.refresh);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current authenticated user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/me', authMiddleware, authController.me);

/**
 * @openapi
 * /auth/accept-tos:
 *   patch:
 *     tags: [Authentication]
 *     summary: Accept Terms of Service
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: ToS accepted successfully
 *       401:
 *         description: Authentication required
 */
router.patch('/accept-tos', authMiddleware, authController.acceptTos);

export { router as authRouter };
