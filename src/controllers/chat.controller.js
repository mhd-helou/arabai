const geminiService = require('../services/gemini.service');
// const gptService = require('../services/gpt.service'); // TODO: Create this file

class ChatController {
    async geminiChat(req, res, db) {
        try {
            const { message, options, conversation_id } = req.body;
            const userId = req.user.userId;

            let conversation;

            if (conversation_id) {
                // Continue existing conversation
                conversation = await db.conversations.findOne({
                    id: conversation_id,
                    user_id: userId
                });

                if (!conversation) {
                    return res.status(404).json({
                        success: false,
                        error: 'Conversation not found or access denied'
                    });
                }
            } else {
                // Auto-create new conversation (first message)
                conversation = await db.conversations.insert({
                    user_id: userId,
                    title: this.generateConversationTitle(message),
                    provider: 'gemini'
                });
            }

            // Save user message
            await db.messages.insert({
                conversation_id: conversation.id,
                role: 'user',
                content: message,
                provider: null
            });

            // Get AI response
            const result = await geminiService.chat(message, options);

            // Save AI response
            const tokenCount = result.usage?.totalTokens || null;
            console.log('💾 Saving to DB - Token count:', tokenCount);
            console.log('💾 Full result.usage:', JSON.stringify(result.usage));
            
            await db.messages.insert({
                conversation_id: conversation.id,
                role: 'assistant',
                content: result.response,
                provider: 'gemini',
                tokens_used: tokenCount
            });
            
            console.log('✅ Message saved to database');

            // Update conversation timestamp
            await db.conversations.update(conversation.id, {
                updated_at: new Date()
            });

            res.json({
                success: true,
                provider: 'gemini',
                response: result.response,
                usage: result.usage,
                conversation_id: conversation.id
            });

        } catch (error) {
            console.error('Chat error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    async gptChat(req, res, db) {
        // TODO: Implement when gpt.service.js is created
        res.status(501).json({
            success: false,
            message: 'GPT endpoint not implemented yet'
        });
    }

    // Get user's conversations
    async getConversations(req, res, db) {
        try {
            const userId = req.user.userId;
            const { page = 1, limit = 20 } = req.query;
            
            const conversations = await db.conversations.find(
                { user_id: userId },
                {
                    order: [{ field: 'updated_at', direction: 'desc' }],
                    limit: parseInt(limit),
                    offset: (parseInt(page) - 1) * parseInt(limit)
                }
            );

            res.json({
                success: true,
                conversations: conversations,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get messages for a specific conversation
    async getConversationMessages(req, res, db) {
        try {
            const { conversationId } = req.params;
            const userId = req.user.userId;

            // Verify user owns this conversation
            const conversation = await db.conversations.findOne({
                id: conversationId,
                user_id: userId
            });

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    error: 'Conversation not found'
                });
            }

            const messages = await db.messages.find(
                { conversation_id: conversationId },
                { order: [{ field: 'created_at', direction: 'asc' }] }
            );

            res.json({
                success: true,
                messages: messages,
                conversation: conversation
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Create new conversation manually
    async createConversation(req, res, db) {
        try {
            const { title, provider = 'gemini' } = req.body;
            const userId = req.user.userId;

            const conversation = await db.conversations.insert({
                user_id: userId,
                title: title || 'New Conversation',
                provider: provider
            });

            res.json({
                success: true,
                conversation: conversation
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Delete conversation
    async deleteConversation(req, res, db) {
        try {
            const { conversationId } = req.params;
            const userId = req.user.userId;

            // Verify ownership
            const conversation = await db.conversations.findOne({
                id: conversationId,
                user_id: userId
            });

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    error: 'Conversation not found'
                });
            }

            // Delete conversation (messages will be deleted due to CASCADE)
            await db.conversations.destroy({ id: conversationId });

            res.json({
                success: true,
                message: 'Conversation deleted'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Helper: Generate conversation title from first message
    generateConversationTitle(message) {
        const cleanMessage = message.trim();
        
        // Take first sentence or first 50 characters
        const firstSentence = cleanMessage.split(/[.!?]/)[0];
        const title = firstSentence.length > 50 
            ? firstSentence.substring(0, 50) + '...'
            : firstSentence;
            
        return title || 'New Conversation';
    }
}
module.exports = ChatController