/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
const up = (pgm) => {
    pgm.createTable('messages', {
        id: 'id',
        conversation_id: {
            type: 'integer',
            notNull: true,
            references: 'conversations(id)',
            onDelete: 'CASCADE'
        },
        role: { type: 'varchar(20)', notNull: true },
        content: { type: 'text', notNull: true },
        provider: { type: 'varchar(50)', notNull: false },
        tokens_used: { type: 'integer', notNull: false },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // Create indexes for better performance
    pgm.createIndex('messages', 'conversation_id');
    pgm.createIndex('messages', 'created_at');
    pgm.createIndex('messages', ['conversation_id', 'created_at']);
    
    // Add constraint to ensure valid role
    pgm.addConstraint('messages', 'messages_role_check', 
        'CHECK (role IN (\'user\', \'assistant\'))');
    
    // Add constraint to ensure valid provider (nullable)
    pgm.addConstraint('messages', 'messages_provider_check', 
        'CHECK (provider IS NULL OR provider IN (\'gemini\', \'gpt\', \'claude\'))');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
const down = (pgm) => {
    pgm.dropTable('messages');
};

module.exports = { up, down };