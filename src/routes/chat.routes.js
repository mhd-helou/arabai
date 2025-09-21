const express = require('express');
const {authMiddleware} = require('../middlewares/auth.middleware');

const ChatController = require('../controllers/chat.controller');
const chatController = new ChatController();

const createChatRoutes = (db) => {
    const router = express.Router();
    const authenticate = authMiddleware(db);

    // Chat endpoints
    router.post('/gemini/chat', authenticate, (req, res) => {
        chatController.geminiChat(req, res, db);
    });
    router.post('/chatgpt/chat', authenticate, (req, res) => {
        chatController.gptChat(req, res, db);
    });

    // Conversation management endpoints
    router.get('/conversations', authenticate, (req, res) => {
        chatController.getConversations(req, res, db);
    });
    
    router.post('/conversations', authenticate, (req, res) => {
        chatController.createConversation(req, res, db);
    });
    
    router.get('/conversations/:conversationId/messages', authenticate, (req, res) => {
        chatController.getConversationMessages(req, res, db);
    });
    
    router.delete('/conversations/:conversationId', authenticate, (req, res) => {
        chatController.deleteConversation(req, res, db);
    });

    return router;
}
module.exports = createChatRoutes;