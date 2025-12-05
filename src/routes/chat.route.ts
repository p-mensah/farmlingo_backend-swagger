// import { Router } from 'express';
// import multer from 'multer';
// import { authenticate } from '../middlewares/auth';
// import {
//   getChatrooms,
//   createChatroom,
//   getChatroomById,
//   updateChatroom,
//   deleteChatroom,
//   getChatMessages,
//   createChatMessage
// } from '../controllers/chat.controller';

// const router = Router();
// const upload = multer();

// /**
//  * @openapi
//  * /chatrooms:
//  *   get:
//  *     tags:
//  *       - Chat
//  *     summary: List all chat rooms
//  *     description: Returns a paginated list of all chat rooms.
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *         description: Page number for pagination
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 10
//  *         description: Number of chat rooms per page
//  *       - in: query
//  *         name: courseId
//  *         schema:
//  *           type: string
//  *           format: uuid
//  *         description: Filter chat rooms by course ID
//  *     responses:
//  *       '200':
//  *         description: A list of chat rooms.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/PaginatedResponse'
//  *       '500':
//  *         description: Unexpected server error.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ApiError'
//  *   
//  *   post:
//  *     tags:
//  *       - Chat
//  *     summary: Create a new chat room
//  *     description: Creates a new chat room with the provided details.
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             $ref: '#/components/schemas/NewChatroom'
//  *     responses:
//  *       '201':
//  *         description: Chat room created successfully.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Chatroom'
//  *       '400':
//  *         description: Bad request - Invalid input data.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ApiError'
//  *       '500':
//  *         description: Unexpected server error.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ApiError'
//  */

// /**
//  * @openapi
//  * /chatrooms/{chatroomId}:
//  *   get:
//  *     tags:
//  *       - Chat
//  *     summary: Get a specific chat room
//  *     description: Returns details of a specific chat room by ID.
//  *     parameters:
//  *       - in: path
//  *         name: chatroomId
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: uuid
//  *         description: The ID of the chat room to retrieve
//  *     responses:
//  *       '200':
//  *         description: Chat room details.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Chatroom'
//  *       '404':
//  *         description: Chat room not found.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ApiError'
//  *       '500':
//  *         description: Unexpected server error.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ApiError'
//  *   
//  *   put:
//  *     tags:
//  *       - Chat
//  *     summary: Update a chat room
//  *     description: Updates an existing chat room with new details.
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: chatroomId
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: uuid
//  *         description: The ID of the chat room to update
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             $ref: '#/components/schemas/NewChatroom'
//  *     responses:
//  *       '200':
//  *         description: Chat room updated successfully.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Chatroom'
//  *       '400':
//  *         description: Bad request - Invalid input data.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ApiError'
//  *       '404':
//  *         description: Chat room not found.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ApiError'
//  *       '500':
//  *         description: Unexpected server error.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ApiError'
//  *   
//  *   delete:
//  *     tags:
//  *       - Chat
//  *     summary: Delete a chat room
//  *     description: Deletes a chat room by ID.
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: chatroomId
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: uuid
//  *         description: The ID of the chat room to delete
//  *     responses:
//  *       '204':
//  *         description: Chat room deleted successfully.
//  *       '404':
//  *         description: Chat room not found.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ApiError'
//  *       '500':
//  *         description: Unexpected server error.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ApiError'
//  */

// /**
//  * @openapi
//  * /chatrooms/{chatroomId}/messages:
//  *   get:
//  *     tags:
//  *       - Chat
//  *     summary: Get chat messages
//  *     description: Returns a paginated list of messages in a specific chat room.
//  *     parameters:
//  *       - in: path
//  *         name: chatroomId
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: uuid
//  *         description: The ID of the chat room
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *         description: Page number for pagination
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 50
//  *         description: Number of messages per page
//  *       - in: query
//  *         name: before
//  *         schema:
//  *           type: string
//  *           format: date-time
//  *         description: Get messages sent before this timestamp
//  *     responses:
//  *       '200':
//  *         description: A list of chat messages.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/PaginatedResponse'
//  *       '404':
//  *         description: Chat room not found.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ApiError'
//  *       '500':
//  *         description: Unexpected server error.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ApiError'
//  *   
//  *   post:
//  *     tags:
//  *       - Chat
//  *     summary: Send a chat message
//  *     description: Sends a new message to a chat room.
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: chatroomId
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: uuid
//  *         description: The ID of the chat room
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             $ref: '#/components/schemas/NewChatMessage'
//  *     responses:
//  *       '201':
//  *         description: Message sent successfully.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ChatMessage'
//  *       '400':
//  *         description: Bad request - Invalid input data.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ApiError'
//  *       '404':
//  *         description: Chat room not found.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ApiError'
//  *       '500':
//  *         description: Unexpected server error.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ApiError'
//  */

// export default router;
// // Runtime endpoints
// router.get('/', getChatrooms);
// router.post('/', authenticate, upload.none(), createChatroom);
// router.get('/:chatroomId', getChatroomById);
// router.put('/:chatroomId', authenticate, upload.none(), updateChatroom);
// router.delete('/:chatroomId', authenticate, deleteChatroom);
// router.get('/:chatroomId/messages', getChatMessages);
// router.post('/:chatroomId/messages', authenticate, upload.none(), createChatMessage);




import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth';
import {
  getChatrooms,
  createChatroom,
  getChatroomById,
  updateChatroom,
  deleteChatroom,
  getChatMessages,
  createChatMessage,
  // NEW: Direct message controllers
  createDirectChatroom,
  getDirectChatrooms
} from '../controllers/chat.controller';

const router = Router();
const upload = multer();


//  Direct Message (DM) Endpoints


/**
 * @openapi
 * /chat/direct:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Create or retrieve a direct message (DM) chatroom
 *     description: |
 *       Creates a private 1:1 chatroom between the authenticated user and another user (`recipientId`).
 *       If a chatroom already exists between these two users, it returns the existing one (200).
 *       Otherwise, a new one is created (201).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *             properties:
 *               recipientId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the other user to start a DM with
 *     responses:
 *       '200':
 *         description: Existing direct chatroom returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chatroom'
 *       '201':
 *         description: New direct chatroom created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chatroom'
 *       '400':
 *         description: Invalid or missing recipientId, or self-chat attempt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '401':
 *         description: Unauthorized — missing or invalid token
 *       '404':
 *         description: Recipient user not found (optional, if validated)
 *       '500':
 *         description: Unexpected server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get all direct chatrooms for the current user
 *     description: Returns a list of all 1:1 direct message chatrooms the authenticated user participates in.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of direct chatrooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chatroom'
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Unexpected server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

// ========================
//  General Chatroom Endpoints
// ========================

/**
 * @openapi
 * /chatrooms:
 *   get:
 *     tags:
 *       - Chat
 *     summary: List all chat rooms
 *     description: Returns a paginated list of all chat rooms.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of chat rooms per page
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter chat rooms by course ID
 *     responses:
 *       '200':
 *         description: A list of chat rooms.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       '500':
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   
 *   post:
 *     tags:
 *       - Chat
 *     summary: Create a new chat room
 *     description: Creates a new chat room with the provided details.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/NewChatroom'
 *     responses:
 *       '201':
 *         description: Chat room created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chatroom'
 *       '400':
 *         description: Bad request - Invalid input data.
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

/**
 * @openapi
 * /chatrooms/{chatroomId}:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get a specific chat room
 *     description: Returns details of a specific chat room by ID.
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the chat room to retrieve
 *     responses:
 *       '200':
 *         description: Chat room details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chatroom'
 *       '404':
 *         description: Chat room not found.
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
 *   
 *   put:
 *     tags:
 *       - Chat
 *     summary: Update a chat room
 *     description: Updates an existing chat room with new details.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the chat room to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/NewChatroom'
 *     responses:
 *       '200':
 *         description: Chat room updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chatroom'
 *       '400':
 *         description: Bad request - Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Chat room not found.
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
 *   
 *   delete:
 *     tags:
 *       - Chat
 *     summary: Delete a chat room
 *     description: Deletes a chat room by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the chat room to delete
 *     responses:
 *       '204':
 *         description: Chat room deleted successfully.
 *       '404':
 *         description: Chat room not found.
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

/**
 * @openapi
 * /chatrooms/{chatroomId}/messages:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get chat messages
 *     description: Returns a paginated list of messages in a specific chat room.
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the chat room
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of messages per page
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Get messages sent before this timestamp
 *     responses:
 *       '200':
 *         description: A list of chat messages.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       '404':
 *         description: Chat room not found.
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
 *   
 *   post:
 *     tags:
 *       - Chat
 *     summary: Send a chat message
 *     description: Sends a new message to a chat room.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the chat room
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/NewChatMessage'
 *     responses:
 *       '201':
 *         description: Message sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatMessage'
 *       '400':
 *         description: Bad request - Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Chat room not found.
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


//  Route Definitions

//  Direct Message (DM) endpoints — JSON only, no multer
router.post('/direct', authenticate, createDirectChatroom);
router.get('/direct', authenticate, getDirectChatrooms);

//  General chatroom endpoints — some use multipart (multer)
router.get('/', getChatrooms);
router.post('/', authenticate, upload.none(), createChatroom);
router.get('/:chatroomId', getChatroomById);
router.put('/:chatroomId', authenticate, upload.none(), updateChatroom);
router.delete('/:chatroomId', authenticate, deleteChatroom);
router.get('/:chatroomId/messages', getChatMessages);
router.post('/:chatroomId/messages', authenticate, upload.none(), createChatMessage);

export default router;