/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
const up = (pgm) => {
    pgm.createTable('conversations', {
        id: 'id',
        user_id: {
            type: 'integer',
            notNull: true,
            references: 'users(id)',
            onDelete: 'CASCADE'
        },
        title: { type: 'varchar(255)', notNull: true },
        provider: { type: 'varchar(50)', notNull: true },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // Create indexes for better performance
    pgm.createIndex('conversations', 'user_id');
    pgm.createIndex('conversations', 'created_at');
    
    // Add constraint to ensure valid provider
    pgm.addConstraint('conversations', 'conversations_provider_check', 
        'CHECK (provider IN (\'gemini\', \'gpt\', \'claude\'))');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
const down = (pgm) => {
    pgm.dropTable('conversations');
};

module.exports = { up, down };