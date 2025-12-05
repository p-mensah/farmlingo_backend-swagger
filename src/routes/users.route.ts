import { Router } from 'express';
import {
  getUsers,
  registerUser,
  loginUser,
  getUserProfile,
  getUserDashboard,
  syncUserProfile,      // 1. New: Controller for Clerk Webhooks
  getProfileByToken     // 2. New: Controller to get profile via token
} from '../controllers/users.controller';
import { authenticate, webhookVerification } from '../middlewares/auth'; // 3. Import webhookVerification


const router = Router();
// const upload = multer(); // Removed unused instance

// --- Public Endpoints ---

/**
 * @openapi
 * /users/clerk-sync:
 *   post:
 *     tags:
 *       - Webhooks
 *     summary: Clerk Webhook Endpoint (User Profile Sync)
 *     description: Receives and processes events from Clerk (e.g., user.created, user.updated) to sync user data securely.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of webhook event (e.g., user.created).
 *               data:
 *                 type: object
 *                 description: The user data payload from Clerk.
 *     responses:
 *       '200':
 *         description: Webhook received and processed successfully.
 *       '401':
 *         description: Webhook signature verification failed.
 */
// IMPORTANT: `webhookVerification` is crucial for security.
router.post('/clerk-sync', webhookVerification, syncUserProfile);


/**
 * @openapi
 * /users/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Register a new user
 *     description: Creates a new user record. 'clerk_user_id' is optional for temporary records.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *               role:
 *                 type: string
 *                 enum: [student, farmer, admin, super_admin]
 *                 description: The user's assigned role.
 *               clerk_user_id:
 *                 type: string
 *                 description: Optional. The ID provided by Clerk. If missing, the server generates a temporary one.
 *     responses:
 *       '201':
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Missing or invalid fields.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '409':
 *         description: Duplicate email or clerk_user_id.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '500':
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// Removed upload.none() and updated request body in documentation
router.post('/register', registerUser);

/**
 * @openapi
 * /users/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Login a user
 *     description: Authenticates a user and returns a JWT access token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLoginRequest'
 *     responses:
 *       '200':
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokenResponse'
 *       '400':
 *         description: Missing credentials.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '401':
 *         description: Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: User is inactive.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '500':
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// Removed upload.none() and updated request body in documentation
router.post('/login', loginUser);

// --- Protected Endpoints ---

/**
 * @openapi
 * /users/profile-by-token:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retrieve user profile using Clerk Access Token
 *     description: Returns the user's local profile data based on the bearer token provided in the Authorization header.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized (invalid or missing token).
 *       '403':
 *         description: Forbidden (authenticated but no local record found).
 */
router.get('/profile-by-token', authenticate, getProfileByToken);


/**
 * @openapi
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: List users
 *     description: Returns a list of users (admin-only).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '500':
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/', authenticate, getUsers);

/**
 * @openapi
 * /users/{userId}/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user profile
 *     description: Returns the profile for the specified user. Only the user themselves or an admin can access this.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user whose profile is being requested.
 *     responses:
 *       '200':
 *         description: User profile.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Missing user_id.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '401':
 *         description: Unauthorized (missing or invalid token).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden (user cannot access this profile).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '500':
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/:userId/profile', authenticate, getUserProfile);

/**
 * @openapi
 * /users/{userId}/dashboard:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user dashboard
 *     description: Returns dashboard information for the specified user. Only the user themselves or an admin can access this.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user whose dashboard is being requested.
 *     responses:
 *       '200':
 *         description: User dashboard data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDashboardResponse'
 *       '400':
 *         description: Missing user_id.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '401':
 *         description: Unauthorized (missing or invalid token).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden (user cannot access this dashboard).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '500':
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/:userId/dashboard', authenticate, getUserDashboard);

export default router;